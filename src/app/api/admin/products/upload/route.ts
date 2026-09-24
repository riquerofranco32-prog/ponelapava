import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedAdmin, AuthError } from "@/lib/api-guard";

const BUCKET = "product-images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Magic bytes per format: file.type comes from the client and can lie.
function matchesSignature(buf: Buffer, ext: string): boolean {
  switch (ext) {
    case "jpg":
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case "png":
      return buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    case "gif":
      return buf.subarray(0, 4).toString("ascii") === "GIF8";
    case "webp":
      return (
        buf.subarray(0, 4).toString("ascii") === "RIFF" &&
        buf.subarray(8, 12).toString("ascii") === "WEBP"
      );
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedAdmin();
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ error: "No autorizado" }, { status });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Campo 'file' requerido" },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "La imagen no puede superar 5 MB" },
      { status: 413 },
    );
  }
  const ext = MIME_EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Formato no permitido. Usá JPG, PNG, WebP o GIF." },
      { status: 415 },
    );
  }

  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesSignature(buffer, ext)) {
    return NextResponse.json(
      { error: "El archivo no es una imagen válida." },
      { status: 415 },
    );
  }

  const supabase = supabaseAdmin();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}

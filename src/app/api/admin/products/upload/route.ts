import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "product-images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
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

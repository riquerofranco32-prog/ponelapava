import { supabaseAdmin } from "@/lib/supabase";

export const PRODUCT_IMAGE_BUCKET = "product-images";

const PUBLIC_PREFIX = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;

// Only URLs we uploaded ourselves are candidates for deletion — a photo added
// by pasting an external link, or a file under /public, is never touched.
function toBucketPath(url: string): string | null {
  const index = url.indexOf(PUBLIC_PREFIX);
  if (index === -1) return null;
  const path = url.slice(index + PUBLIC_PREFIX.length).split("?")[0];
  return path || null;
}

// Deletes bucket objects that no product and no landing content still points
// at. Called after a product delete or after an edit drops a photo, so
// replacing an image doesn't quietly leave the old file paying rent forever.
//
// Best-effort: storage cleanup must never fail the mutation the admin asked
// for — the row is already gone, an orphan file is the lesser problem.
export async function deleteUnreferencedImages(
  candidateUrls: string[],
): Promise<void> {
  const candidates = new Map<string, string>();
  for (const url of candidateUrls) {
    const path = toBucketPath(url);
    if (path) candidates.set(url, path);
  }
  if (candidates.size === 0) return;

  try {
    const admin = supabaseAdmin();

    const { data: products, error } = await admin
      .from("products")
      .select("images");
    if (error) throw error;

    const stillUsed = new Set<string>();
    for (const row of (products ?? []) as { images: string[] | null }[]) {
      for (const image of row.images ?? []) stillUsed.add(image);
    }

    // The landing editor uploads into the same bucket.
    const { data: landing } = await admin
      .from("landing_content")
      .select("content")
      .eq("id", "default")
      .maybeSingle();
    const landingBlob = landing?.content ? JSON.stringify(landing.content) : "";

    const paths = [...candidates.entries()]
      .filter(([url]) => !stillUsed.has(url) && !landingBlob.includes(url))
      .map(([, path]) => path);

    if (paths.length === 0) return;
    await admin.storage.from(PRODUCT_IMAGE_BUCKET).remove(paths);
  } catch (err) {
    console.warn("[storage] no se pudieron limpiar imágenes huérfanas:", err);
  }
}

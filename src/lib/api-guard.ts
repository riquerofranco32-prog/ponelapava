import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/validation";

export * from "@/lib/validation";

// Every /api/admin handler runs through this: a thrown Supabase/PostgREST
// error becomes a 500 with a logged cause instead of an unhandled rejection
// that reaches the browser as an opaque failure, and a ValidationError becomes
// a 400 the admin UI can actually show.
export async function handle<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<NextResponse> {
  try {
    return NextResponse.json(await fn());
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(`[api] ${label} failed:`, error);
    const message =
      error instanceof Error ? error.message : "Error inesperado del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// A 401 from any /api/admin/* route almost always means the Supabase Auth
// session expired or was never established — a far more actionable message
// than a generic "couldn't load/save" for every admin fetch.
export function assertOk(res: Response, fallbackMessage: string) {
  if (res.ok) return;
  if (res.status === 401) {
    throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
  }
  throw new Error(fallbackMessage);
}

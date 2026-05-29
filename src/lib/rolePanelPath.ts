/** Rol → varsayılan panel yolu (giriş sonrası ve /profil kapısı için tek kaynak). */
export function getPanelPathForRole(rol: string | undefined | null): string {
  const r = (rol ?? "").toLowerCase();
  if (r === "admin") return "/admin";
  if (r === "isletmeci" || r === "isletme") return "/isletme";
  if (r === "garson") return "/garson";
  if (r === "mutfak") return "/mutfak";
  return "/profil";
}

export function isMusteriRole(rol: string | undefined | null): boolean {
  return (rol ?? "").toLowerCase() === "musteri";
}

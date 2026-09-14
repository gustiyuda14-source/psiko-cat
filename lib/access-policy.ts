export function canAccessSession(
  ownerId: string,
  actor: { sub: string; role: "peserta" | "admin" },
  allowAdmin: boolean
): boolean {
  return ownerId === actor.sub || (allowAdmin && actor.role === "admin");
}

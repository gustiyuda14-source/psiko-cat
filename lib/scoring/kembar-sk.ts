import kembar from "./kembar-sk.json";

// Butir kembar Pass Hand per bank id (dua arah), dari scripts/build-kembar-sk.ts.
const KEMBAR = kembar as Record<string, string>;

export const kembarSk = (bankId: string): string | null => KEMBAR[bankId] ?? null;

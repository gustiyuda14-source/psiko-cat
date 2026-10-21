import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { kembarSk } from "./kembar-sk";

// Peta kembar Pass Hand harus sama dengan `kembar_dengan` di semua bank sk-*.json, dua arah.
const dir = path.join(__dirname, "../../bank/pribadi");
let n = 0;
for (const f of fs.readdirSync(dir).filter((f) => /^sk-.*\.json$/.test(f))) {
  const { items } = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as { items: { id: string; kembar_dengan: string | null }[] };
  for (const it of items) {
    if (!it.kembar_dengan) continue;
    assert.equal(kembarSk(it.id), it.kembar_dengan, `${f} ${it.id}`);
    assert.equal(kembarSk(it.kembar_dengan), it.id, `${f} ${it.kembar_dengan} (arah balik)`);
    n++;
  }
}
assert.ok(n > 0);
assert.equal(kembarSk("TIDAK-ADA"), null);
console.log(`kembar-sk ok (${n} butir)`);

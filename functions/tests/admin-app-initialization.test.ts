import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

describe("Functions entrypoint", () => {
  it("deve inicializar o Firebase Admin antes de atender callables", () => {
    const source = readFileSync(join(process.cwd(), "src", "index.ts"), "utf8");

    assert.match(source, /AdminApp\.init\(\);/);
  });
});

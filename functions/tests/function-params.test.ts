import { readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("Function parameters", () => {
  it("nao deve declarar nomes reservados pelo Firebase", () => {
    const source = readFileSync(join(process.cwd(), "src", "config", "FunctionSecrets.ts"), "utf8");

    assert.equal(source.includes('defineString("FUNCTION_REGION"'), false);
  });
});

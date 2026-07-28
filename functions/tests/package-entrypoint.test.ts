import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Functions package entrypoint", () => {
  it("deve apontar para o arquivo gerado pelo build", () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { main: string };

    assert.equal(existsSync(join(process.cwd(), packageJson.main)), true);
  });
});

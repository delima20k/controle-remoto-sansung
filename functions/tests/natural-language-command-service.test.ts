import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NaturalLanguageCommandService } from "../src/ai/NaturalLanguageCommandService";

describe("NaturalLanguageCommandService", () => {
  it("deve ficar desativado por padrao", () => {
    const service = new NaturalLanguageCommandService();
    assert.throws(() => service.parse("aumente o volume"), /desativados/);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MockTvAdapter } from "../src/tv/MockTvAdapter";

describe("MockTvAdapter", () => {
  it("deve aceitar comandos sem TV real", async () => {
    const adapter = new MockTvAdapter();
    const result = await adapter.send({ command: "VOLUME_UP", parameters: {} });
    assert.equal(result.status, "accepted");
  });
});

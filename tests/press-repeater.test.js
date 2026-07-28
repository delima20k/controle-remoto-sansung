const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { setTimeout: wait } = require("node:timers/promises");
const { FrontendTestImporter } = require("./frontend-test-importer");

describe("PressRepeater", () => {
  it("deve repetir e cancelar timers com seguranca", async () => {
    const { PressRepeater } = await FrontendTestImporter.import("utils/PressRepeater.js");
    let calls = 0;
    const repeater = new PressRepeater(() => {
      calls += 1;
    }, { initialDelay: 10, intervalDelay: 10 });

    repeater.start();
    await wait(36);
    repeater.stop();
    const stoppedAt = calls;
    await wait(25);

    assert.equal(calls, stoppedAt);
  });
});

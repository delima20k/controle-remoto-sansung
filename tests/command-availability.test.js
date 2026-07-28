const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

describe("CommandAvailabilityService", () => {
  it("deve habilitar botao por SmartThings somente quando capability foi confirmada", async () => {
    const { CommandAvailabilityService } = await FrontendTestImporter.import("services/CommandAvailabilityService.js");
    const profile = {
      commandAvailability: [
        {
          command: "VOLUME_UP",
          smartThings: { available: true, reason: "audioVolume retornada", method: "smartthings" },
          localBridge: { available: false, experimental: false, reason: "nao pareado", method: "localBridge" }
        }
      ]
    };

    const result = new CommandAvailabilityService().resolve("VOLUME_UP", profile, "smartthings");

    assert.deepEqual({ available: result.available, method: result.method }, { available: true, method: "SmartThings" });
  });

  it("deve informar Local Bridge experimental quando SmartThings nao cobre o comando", async () => {
    const { CommandAvailabilityService } = await FrontendTestImporter.import("services/CommandAvailabilityService.js");
    const profile = {
      commandAvailability: [
        {
          command: "NAVIGATE_UP",
          smartThings: { available: false, reason: "sem capability", method: "smartthings" },
          localBridge: { available: true, experimental: true, reason: "bridge experimental", method: "localBridge" }
        }
      ]
    };

    const result = new CommandAvailabilityService().resolve("NAVIGATE_UP", profile, "localBridge");

    assert.equal(result.method, "Local Bridge experimental");
  });
});

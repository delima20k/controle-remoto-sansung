import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SmartThingsCapabilityResolver } from "../src/smartthings/SmartThingsCapabilityResolver";
import { SmartThingsDevice } from "../src/smartthings/SmartThingsTypes";

const device: SmartThingsDevice = {
  deviceId: "tv-1",
  label: "Samsung TV Sala",
  components: [
    {
      id: "main",
      capabilities: [
        { id: "switch" },
        { id: "audioVolume" },
        { id: "audioMute" },
        { id: "mediaPlayback" }
      ]
    }
  ]
};

describe("SmartThingsCapabilityResolver", () => {
  it("deve mapear POWER_ON para switch.on quando capability existe", () => {
    const resolver = new SmartThingsCapabilityResolver();
    const command = resolver.toCommand(device, "POWER_ON", {});
    assert.deepEqual(command, {
      component: "main",
      capability: "switch",
      command: "on",
      arguments: []
    });
  });

  it("deve bloquear comando sem suporte SmartThings", () => {
    const resolver = new SmartThingsCapabilityResolver();
    assert.throws(() => resolver.toCommand(device, "NAVIGATE_UP", {}), /nao esta disponivel/);
  });

  it("deve bloquear capability ausente", () => {
    const resolver = new SmartThingsCapabilityResolver();
    const limited: SmartThingsDevice = { deviceId: "tv-2", components: [{ id: "main", capabilities: [{ id: "switch" }] }] };
    assert.throws(() => resolver.toCommand(limited, "VOLUME_UP", {}), /audioVolume/);
  });
});

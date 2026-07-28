import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SamsungCu7700Profile } from "../src/smartthings/SamsungCu7700Profile";
import { SmartThingsDevice } from "../src/smartthings/SmartThingsTypes";

describe("SamsungCu7700Profile", () => {
  it("deve conter somente identidade confirmada pelo device retornado", () => {
    const device: SmartThingsDevice = {
      deviceId: "device-1",
      label: "TV Sala",
      manufacturerName: "Samsung",
      deviceModel: "UN75CU7700GXZD",
      components: []
    };
    const profile = new SamsungCu7700Profile().build(device);
    assert.equal(profile.profileName, "SamsungCu7700Profile");
    assert.equal(profile.confirmedModelMatch, true);
    assert.deepEqual(profile.confirmedIdentity, {
      deviceId: "device-1",
      label: "TV Sala",
      manufacturerName: "Samsung",
      deviceModel: "UN75CU7700GXZD"
    });
  });

  it("deve habilitar comando SmartThings apenas quando capability foi retornada", () => {
    const device: SmartThingsDevice = {
      deviceId: "device-1",
      components: [
        {
          id: "main",
          capabilities: [
            { id: "audioVolume", version: 1 }
          ]
        }
      ]
    };
    const profile = new SamsungCu7700Profile().build(device);
    const volumeUp = profile.commandAvailability.find((item) => item.command === "VOLUME_UP");
    const powerOn = profile.commandAvailability.find((item) => item.command === "POWER_ON");
    assert.equal(volumeUp?.smartThings.available, true);
    assert.equal(volumeUp?.preferredMethod, "smartthings");
    assert.equal(powerOn?.smartThings.available, false);
    assert.equal(powerOn?.localBridge.available, true);
    assert.equal(powerOn?.preferredMethod, "localBridge");
  });
});

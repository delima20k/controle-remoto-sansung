const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

describe("SmartThingsRemoteAdapter", () => {
  it("deve usar o perfil confirmado da TV listada ao conectar", async () => {
    const { SmartThingsRemoteAdapter } = await FrontendTestImporter.import("services/SmartThingsRemoteAdapter.js");
    const profile = { profileName: "SamsungCu7700Profile", commandAvailability: [] };
    const functions = {
      httpsCallable: (name) => async () => {
        if (name === "listSmartThingsDevices") {
          return { data: { devices: [{ providerDeviceId: "tv-1", deviceProfile: profile }] } };
        }
        return { data: { components: {} } };
      }
    };

    const connection = await new SmartThingsRemoteAdapter({ functions, deviceId: "tv-1" }).connect();

    assert.equal(connection.deviceProfile, profile);
  });
});

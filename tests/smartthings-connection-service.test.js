const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

describe("SmartThingsConnectionService", () => {
  it("deve redirecionar somente para a autorizacao oficial do SmartThings", async () => {
    const { SmartThingsConnectionService } = await FrontendTestImporter.import("services/SmartThingsConnectionService.js");
    const locations = [];
    const functions = {
      httpsCallable: () => async () => ({ data: { authorizationUrl: "https://api.smartthings.com/v1/oauth/authorize?state=valid" } })
    };
    const service = new SmartThingsConnectionService(functions, "uid-1", new Map(), { assign: (url) => locations.push(url) });

    await service.startAuthorization();

    assert.deepEqual(locations, ["https://api.smartthings.com/v1/oauth/authorize?state=valid"]);
  });

  it("deve persistir somente o id de dispositivo valido para o usuario atual", async () => {
    const { SmartThingsConnectionService } = await FrontendTestImporter.import("services/SmartThingsConnectionService.js");
    const storage = new Map();
    const service = new SmartThingsConnectionService({ httpsCallable: () => undefined }, "uid-1", storage);

    service.selectDevice({ providerDeviceId: "tv-001" });

    assert.equal(service.selectedDeviceId(), "tv-001");
  });
});

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

describe("AdapterFactory", () => {
  it("deve escolher SmartThings quando functions e deviceId existem", async () => {
    const { AdapterFactory } = await FrontendTestImporter.import("services/AdapterFactory.js");
    const adapter = new AdapterFactory().create({ smartThings: { functions: { httpsCallable: () => async () => ({ data: {} }) }, deviceId: "device-1" } });

    assert.equal(adapter.kind, "smartthings");
  });

  it("deve escolher Local Bridge quando SmartThings nao esta configurado", async () => {
    const { AdapterFactory } = await FrontendTestImporter.import("services/AdapterFactory.js");
    const adapter = new AdapterFactory().create({ localBridge: { baseUrl: "http://127.0.0.1:4319", fetchClient: async () => ({ ok: true, json: async () => ({}) }) } });

    assert.equal(adapter.kind, "localBridge");
  });

  it("deve usar Mock como fallback de baixo custo", async () => {
    const { AdapterFactory } = await FrontendTestImporter.import("services/AdapterFactory.js");
    const adapter = new AdapterFactory().create();

    assert.equal(adapter.kind, "mock");
  });
});

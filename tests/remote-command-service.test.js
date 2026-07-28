const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

describe("RemoteCommandService", () => {
  it("deve rejeitar comando fora da allowlist", async () => {
    const { RemoteCommandService } = await FrontendTestImporter.import("services/RemoteCommandService.js");
    const { MockRemoteAdapter } = await FrontendTestImporter.import("services/MockRemoteAdapter.js");
    const service = new RemoteCommandService(new MockRemoteAdapter());

    await assert.rejects(() => service.send("FORMAT_TV", {}), /Comando nao permitido/);
  });

  it("deve validar parametros de OPEN_APP", async () => {
    const { RemoteCommandService } = await FrontendTestImporter.import("services/RemoteCommandService.js");
    const { MockRemoteAdapter } = await FrontendTestImporter.import("services/MockRemoteAdapter.js");
    const service = new RemoteCommandService(new MockRemoteAdapter());
    await service.connect();

    await assert.rejects(() => service.send("OPEN_APP", { appId: "../token" }), /Parametro appId invalido/);
  });

  it("deve enviar comando permitido pelo mock com metodo informado", async () => {
    const { RemoteCommandService } = await FrontendTestImporter.import("services/RemoteCommandService.js");
    const { MockRemoteAdapter } = await FrontendTestImporter.import("services/MockRemoteAdapter.js");
    const service = new RemoteCommandService(new MockRemoteAdapter());
    await service.connect();

    const result = await service.send("VOLUME_UP", {});

    assert.equal(result.method, "Mock");
  });
});

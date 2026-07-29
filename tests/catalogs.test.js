const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

describe("StreamingAppsCatalog", () => {
  it("deve listar todos os principais apps solicitados com icones de marca", async () => {
    const { StreamingAppsCatalog } = await FrontendTestImporter.import("data/StreamingAppsCatalog.js");
    const apps = new StreamingAppsCatalog().getVisibleApps();

    assert.equal(apps.length, 53);
    assert.equal(apps.every((app) => app.command === "OPEN_APP" && app.iconKind && app.icon && (app.iconUrl === null || /^https:\/\/cdn\.simpleicons\.org\/[a-z0-9]+$/.test(app.iconUrl))), true);
    assert.deepEqual(apps.slice(0, 3).map((app) => app.label), ["Netflix", "Amazon Prime Video", "YouTube"]);
    assert.equal(apps.find((app) => app.id === "prime-video")?.iconUrl, null);
  });

  it("deve ocultar apps nao instalados quando houver lista confirmada", async () => {
    const { StreamingAppsCatalog } = await FrontendTestImporter.import("data/StreamingAppsCatalog.js");
    const apps = new StreamingAppsCatalog().getVisibleApps(["youtube", "spotify"]);

    assert.deepEqual(apps.map((app) => app.id), ["youtube", "spotify"]);
  });
});

describe("ExtrasCatalog", () => {
  it("deve manter extras indisponiveis quando nao existe comando confirmado", async () => {
    const { ExtrasCatalog } = await FrontendTestImporter.import("data/ExtrasCatalog.js");
    const extras = new ExtrasCatalog().getAll();
    const hdmi = extras.find((item) => item.label === "HDMI 1");

    assert.equal(hdmi.command, null);
  });
});

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

class MemoryStorage {
  #values = new Map();

  getItem(key) {
    return this.#values.get(key) ?? null;
  }

  setItem(key, value) {
    this.#values.set(key, value);
  }
}

describe("ThemeService", () => {
  it("deve persistir tema sem depender de Firebase", async () => {
    const { ThemeService } = await FrontendTestImporter.import("services/ThemeService.js");
    const storage = new MemoryStorage();
    const documentElement = { dataset: {} };
    const service = new ThemeService(storage, documentElement);

    service.setTheme("amoled");

    assert.deepEqual({ theme: service.getTheme(), dom: documentElement.dataset.theme }, { theme: "amoled", dom: "amoled" });
  });

  it("deve rejeitar tema invalido", async () => {
    const { ThemeService } = await FrontendTestImporter.import("services/ThemeService.js");
    const service = new ThemeService(new MemoryStorage(), { dataset: {} });

    assert.throws(() => service.setTheme("neon"), /Tema invalido/);
  });
});

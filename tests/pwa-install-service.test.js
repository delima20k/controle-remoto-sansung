const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

class FakeBeforeInstallPromptEvent extends Event {
  #outcome;
  promptCalls = 0;

  constructor(outcome = "accepted") {
    super("beforeinstallprompt", { cancelable: true });
    this.#outcome = outcome;
  }

  async prompt() {
    this.promptCalls += 1;
    return { outcome: this.#outcome };
  }
}

describe("PwaInstallService", () => {
  it("deve expor o prompt salvo apenas apos o navegador liberar a instalacao", async () => {
    const { PwaInstallService } = await FrontendTestImporter.import("services/PwaInstallService.js");
    const browser = new EventTarget();
    const service = new PwaInstallService(browser);
    service.start();
    const event = new FakeBeforeInstallPromptEvent();

    browser.dispatchEvent(event);
    const result = await service.promptInstallation();

    assert.equal(event.defaultPrevented, true);
    assert.equal(event.promptCalls, 1);
    assert.equal(result.outcome, "accepted");
    assert.equal(service.isAvailable(), false);
  });
});

export class PwaInstallService {
  #browser;
  #deferredPrompt = null;
  #listeners = new Set();
  #started = false;

  constructor(browser = globalThis) {
    this.#browser = browser;
  }

  start() {
    if (this.#started || !this.#browser?.addEventListener) {
      return;
    }
    this.#started = true;
    this.#browser.addEventListener("beforeinstallprompt", this.#handleBeforeInstallPrompt);
    this.#browser.addEventListener("appinstalled", this.#handleInstalled);
  }

  destroy() {
    if (!this.#started || !this.#browser?.removeEventListener) {
      return;
    }
    this.#browser.removeEventListener("beforeinstallprompt", this.#handleBeforeInstallPrompt);
    this.#browser.removeEventListener("appinstalled", this.#handleInstalled);
    this.#started = false;
    this.#deferredPrompt = null;
    this.#listeners.clear();
  }

  isAvailable() {
    return Boolean(this.#deferredPrompt);
  }

  onAvailabilityChange(listener) {
    if (typeof listener !== "function") {
      throw new Error("Listener de instalacao invalido.");
    }
    this.#listeners.add(listener);
    listener(this.isAvailable());
    return () => this.#listeners.delete(listener);
  }

  async promptInstallation() {
    if (!this.#deferredPrompt) {
      return { outcome: "unavailable" };
    }
    const prompt = this.#deferredPrompt;
    this.#deferredPrompt = null;
    this.#notify();
    return prompt.prompt();
  }

  #handleBeforeInstallPrompt = (event) => {
    event.preventDefault();
    this.#deferredPrompt = event;
    this.#notify();
  };

  #handleInstalled = () => {
    this.#deferredPrompt = null;
    this.#notify();
  };

  #notify() {
    for (const listener of this.#listeners) {
      listener(this.isAvailable());
    }
  }
}

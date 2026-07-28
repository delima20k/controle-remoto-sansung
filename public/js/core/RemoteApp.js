import { RemoteShell } from "../components/RemoteShell.js";
import { RemoteController } from "../controllers/RemoteController.js";
import { AdapterFactory } from "../services/AdapterFactory.js";
import { RemoteCommandService } from "../services/RemoteCommandService.js";
import { ThemeService } from "../services/ThemeService.js";

export class RemoteApp {
  #root;
  #themeService;
  #shell;
  #controller;

  constructor(root) {
    this.#root = root;
    this.#themeService = new ThemeService();
  }

  async start() {
    this.#themeService.applySavedTheme();
    const adapter = new AdapterFactory().create();
    const commandService = new RemoteCommandService(adapter);
    this.#controller = new RemoteController(commandService);
    this.#shell = new RemoteShell(this.#root, this.#controller, this.#themeService).render();
    const connection = await this.#connectSafely();
    this.#shell.updateConnection(connection);
    this.#registerServiceWorker();
  }

  async #connectSafely() {
    try {
      return await this.#controller.connect();
    } catch (error) {
      return {
        connected: false,
        method: "Indisponivel",
        deviceProfile: null,
        message: error instanceof Error ? error.message : "Falha ao conectar."
      };
    }
  }

  async #registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    await navigator.serviceWorker.register("/service-worker.js");
  }
}

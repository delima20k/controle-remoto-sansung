import { RemoteShell } from "../components/RemoteShell.js";
import { RemoteController } from "../controllers/RemoteController.js";
import { AdapterFactory } from "../services/AdapterFactory.js";
import { FirebaseSessionService } from "../services/FirebaseSessionService.js";
import { RemoteCommandService } from "../services/RemoteCommandService.js";
import { ThemeService } from "../services/ThemeService.js";

export class RemoteApp {
  #root;
  #themeService;
  #firebaseSessionService;
  #shell;
  #controller;

  constructor(root, firebaseSessionService = new FirebaseSessionService()) {
    this.#root = root;
    this.#themeService = new ThemeService();
    this.#firebaseSessionService = firebaseSessionService;
  }

  async start() {
    this.#themeService.applySavedTheme();
    const firebaseSession = await this.#startFirebaseSession();
    const adapter = new AdapterFactory().create({
      smartThings: { functions: firebaseSession?.functions }
    });
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

  async #startFirebaseSession() {
    try {
      return await this.#firebaseSessionService.start();
    } catch {
      return null;
    }
  }

  async #registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    await navigator.serviceWorker.register("/service-worker.js");
  }
}

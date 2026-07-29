import { RemoteShell } from "../components/RemoteShell.js";
import { RemoteController } from "../controllers/RemoteController.js";
import { AdapterFactory } from "../services/AdapterFactory.js";
import { FirebaseSessionService } from "../services/FirebaseSessionService.js";
import { PwaInstallService } from "../services/PwaInstallService.js";
import { RemoteCommandService } from "../services/RemoteCommandService.js";
import { SmartThingsConnectionService } from "../services/SmartThingsConnectionService.js";
import { ThemeService } from "../services/ThemeService.js";

export class RemoteApp {
  #root;
  #themeService;
  #firebaseSessionService;
  #shell;
  #controller;
  #smartThingsConnectionService;
  #pwaInstallService;

  constructor(root, firebaseSessionService = new FirebaseSessionService(), pwaInstallService = new PwaInstallService()) {
    this.#root = root;
    this.#themeService = new ThemeService();
    this.#firebaseSessionService = firebaseSessionService;
    this.#pwaInstallService = pwaInstallService;
  }

  async start() {
    this.#themeService.applySavedTheme();
    this.#pwaInstallService.start();
    const firebaseSession = await this.#startFirebaseSession();
    this.#smartThingsConnectionService = new SmartThingsConnectionService(firebaseSession?.functions, firebaseSession?.uid);
    const adapter = new AdapterFactory().create({
      smartThings: {
        functions: firebaseSession?.functions,
        deviceId: this.#smartThingsConnectionService.selectedDeviceId()
      }
    });
    const commandService = new RemoteCommandService(adapter);
    this.#controller = new RemoteController(commandService);
    this.#shell = new RemoteShell(
      this.#root,
      this.#controller,
      this.#themeService,
      () => this.#startSmartThingsAuthorization(),
      () => this.#requestPwaInstallation()
    ).render();
    this.#pwaInstallService.onAvailabilityChange((available) => this.#shell.setInstallAvailable(available));
    const connection = await this.#connectSafely();
    this.#shell.updateConnection(connection);
    await this.#resumeSmartThingsSelection();
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

  async #startSmartThingsAuthorization() {
    try {
      await this.#smartThingsConnectionService.startAuthorization();
    } catch (error) {
      this.#shell.showMessage(error instanceof Error ? error.message : "Nao foi possivel iniciar a autorizacao SmartThings.");
    }
  }

  async #resumeSmartThingsSelection() {
    if (!globalThis.location?.hash.startsWith("#/smartthings/success")) {
      return;
    }
    try {
      const devices = await this.#smartThingsConnectionService.listDevices();
      if (devices.length === 1) {
        this.#selectSmartThingsDevice(devices[0]);
        return;
      }
      this.#shell.showSmartThingsDeviceSelection(devices, (device) => this.#selectSmartThingsDevice(device));
    } catch (error) {
      this.#shell.showMessage(error instanceof Error ? error.message : "Nao foi possivel listar as TVs SmartThings.");
    }
  }

  #selectSmartThingsDevice(device) {
    try {
      this.#smartThingsConnectionService.selectDevice(device);
      globalThis.location.replace(globalThis.location.pathname);
    } catch (error) {
      this.#shell.showMessage(error instanceof Error ? error.message : "Nao foi possivel selecionar a TV.");
    }
  }

  async #requestPwaInstallation() {
    const result = await this.#pwaInstallService.promptInstallation();
    if (result.outcome === "dismissed") {
      this.#shell.showMessage("Instalacao cancelada.");
    }
  }

  async #registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    await navigator.serviceWorker.register("/service-worker.js");
  }
}

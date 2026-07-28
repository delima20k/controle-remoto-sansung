import { RemoteApp } from "./core/RemoteApp.js";

class ControleTvEntrypoint {
  async boot() {
    const root = document.getElementById("app");
    if (!root) {
      throw new Error("Elemento #app nao encontrado.");
    }
    await new RemoteApp(root).start();
  }
}

new ControleTvEntrypoint().boot();

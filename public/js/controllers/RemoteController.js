import { Haptics } from "../utils/Haptics.js";

export class RemoteController {
  #commandService;
  #haptics;

  constructor(commandService, haptics = new Haptics()) {
    this.#commandService = commandService;
    this.#haptics = haptics;
  }

  async connect() {
    return this.#commandService.connect();
  }

  getAvailability(command) {
    return this.#commandService.getAvailability(command);
  }

  async send(command, parameters = {}) {
    this.#haptics.pulse();
    try {
      return await this.#commandService.send(command, parameters);
    } catch (error) {
      return {
        status: "error",
        command,
        method: "Erro",
        message: error instanceof Error ? error.message : "Falha ao enviar comando."
      };
    }
  }
}

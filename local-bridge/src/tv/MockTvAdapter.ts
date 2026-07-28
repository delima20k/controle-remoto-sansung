import { BridgeCommandRequest, BridgeCommandResult } from "../domain/RemoteCommand";
import { TvAdapter, TvStatus } from "./TvAdapter";

export class MockTvAdapter implements TvAdapter {
  #volume = 20;
  #muted = false;
  #power = true;

  async status(): Promise<TvStatus> {
    return {
      adapter: "mock",
      connected: true,
      message: `Mock ligado=${this.#power} volume=${this.#volume} mudo=${this.#muted}`
    };
  }

  async send(command: BridgeCommandRequest): Promise<BridgeCommandResult> {
    switch (command.command) {
      case "POWER_ON":
        this.#power = true;
        break;
      case "POWER_OFF":
        this.#power = false;
        break;
      case "VOLUME_UP":
        this.#volume = Math.min(100, this.#volume + 1);
        break;
      case "VOLUME_DOWN":
        this.#volume = Math.max(0, this.#volume - 1);
        break;
      case "SET_VOLUME":
        this.#volume = Number(command.parameters.volume);
        break;
      case "MUTE":
        this.#muted = true;
        break;
      case "UNMUTE":
        this.#muted = false;
        break;
      default:
        break;
    }
    return {
      status: "accepted",
      command: command.command,
      message: "Comando aceito pelo MockTvAdapter"
    };
  }
}

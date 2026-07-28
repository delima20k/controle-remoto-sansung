import { BridgeCommandRequest, BridgeCommandResult } from "../domain/RemoteCommand";
import { TvAdapter } from "./TvAdapter";

export class LocalRemoteCommandService {
  readonly #adapter: TvAdapter;
  #lastSignature = "";
  #lastAt = 0;
  #queue: Promise<BridgeCommandResult> = Promise.resolve({
    status: "accepted",
    command: "PLAY",
    message: "Fila inicializada"
  });

  constructor(adapter: TvAdapter) {
    this.#adapter = adapter;
  }

  async send(command: BridgeCommandRequest): Promise<BridgeCommandResult> {
    const signature = JSON.stringify({ command: command.command, parameters: command.parameters });
    const now = Date.now();
    if (signature === this.#lastSignature && now - this.#lastAt < 250) {
      return {
        status: "accepted",
        command: command.command,
        message: "Comando repetido cancelado pela protecao local"
      };
    }
    this.#lastSignature = signature;
    this.#lastAt = now;
    this.#queue = this.#queue.then(() => this.#adapter.send(command));
    return this.#queue;
  }
}

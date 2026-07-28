import { BridgeConfigValues } from "../config/BridgeConfig";
import { BridgeCommandRequest, BridgeCommandResult } from "../domain/RemoteCommand";
import { TvAdapter, TvStatus } from "./TvAdapter";

export class SamsungLocalAdapter implements TvAdapter {
  readonly #config: BridgeConfigValues;

  constructor(config: BridgeConfigValues) {
    this.#config = config;
  }

  async status(): Promise<TvStatus> {
    if (!this.#config.samsungLocalEnabled || !this.#config.samsungTvIp) {
      return {
        adapter: "samsung-local",
        connected: false,
        message: "Adaptador local Samsung experimental desativado. Configure SAMSUNG_LOCAL_ENABLED=true e SAMSUNG_TV_IP para testes controlados."
      };
    }
    return {
      adapter: "samsung-local",
      connected: false,
      message: "Adaptador experimental aguardando implementacao de protocolo local validado para este modelo/firmware."
    };
  }

  async send(command: BridgeCommandRequest): Promise<BridgeCommandResult> {
    return {
      status: "unsupported",
      command: command.command,
      message: "Protocolo local Samsung nao oficial nao foi habilitado para envio real de comandos."
    };
  }
}

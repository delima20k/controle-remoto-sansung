import { BridgeCommandRequest, BridgeCommandResult } from "../domain/RemoteCommand";
import { TvAdapter, TvStatus } from "./TvAdapter";

export class SamsungSmartThingsAdapter implements TvAdapter {
  async status(): Promise<TvStatus> {
    return {
      adapter: "smartthings",
      connected: false,
      message: "Use Cloud Functions para SmartThings oficial; o bridge nao guarda tokens SmartThings."
    };
  }

  async send(command: BridgeCommandRequest): Promise<BridgeCommandResult> {
    return {
      status: "unsupported",
      command: command.command,
      message: "Comandos SmartThings oficiais devem passar pelas Cloud Functions autenticadas."
    };
  }
}

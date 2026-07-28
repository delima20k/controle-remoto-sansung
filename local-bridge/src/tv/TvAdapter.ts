import { BridgeCommandRequest, BridgeCommandResult } from "../domain/RemoteCommand";

export type TvStatus = {
  readonly adapter: string;
  readonly connected: boolean;
  readonly message: string;
};

export interface TvAdapter {
  status(): Promise<TvStatus>;
  send(command: BridgeCommandRequest): Promise<BridgeCommandResult>;
}

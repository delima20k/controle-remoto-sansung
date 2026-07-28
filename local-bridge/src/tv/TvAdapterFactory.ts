import { BridgeConfigValues } from "../config/BridgeConfig";
import { MockTvAdapter } from "./MockTvAdapter";
import { SamsungLocalAdapter } from "./SamsungLocalAdapter";
import { SamsungSmartThingsAdapter } from "./SamsungSmartThingsAdapter";
import { TvAdapter } from "./TvAdapter";

export class TvAdapterFactory {
  static create(config: BridgeConfigValues): TvAdapter {
    if (config.adapter === "samsung-local") {
      return new SamsungLocalAdapter(config);
    }
    if (config.adapter === "smartthings") {
      return new SamsungSmartThingsAdapter();
    }
    return new MockTvAdapter();
  }
}

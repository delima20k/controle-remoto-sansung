import { LocalBridgeRemoteAdapter } from "./LocalBridgeRemoteAdapter.js";
import { MockRemoteAdapter } from "./MockRemoteAdapter.js";
import { SmartThingsRemoteAdapter } from "./SmartThingsRemoteAdapter.js";

export class AdapterFactory {
  create(options = {}) {
    const smartThings = new SmartThingsRemoteAdapter(options.smartThings ?? {});
    if (smartThings.isConfigured()) {
      return smartThings;
    }
    const localBridge = new LocalBridgeRemoteAdapter(options.localBridge ?? {});
    if (localBridge.isConfigured()) {
      return localBridge;
    }
    return new MockRemoteAdapter();
  }
}

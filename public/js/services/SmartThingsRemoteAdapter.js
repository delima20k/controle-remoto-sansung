export class SmartThingsRemoteAdapter {
  kind = "smartthings";
  label = "SmartThings";
  #functions;
  #deviceId;

  constructor(options = {}) {
    this.#functions = options.functions ?? globalThis.firebase?.functions?.();
    this.#deviceId = options.deviceId ?? globalThis.__CONTROL_TV_CONFIG__?.smartThingsDeviceId ?? null;
  }

  isConfigured() {
    return Boolean(this.#functions && this.#deviceId);
  }

  async connect() {
    if (!this.isConfigured()) {
      throw new Error("SmartThings nao configurado.");
    }
    const statusCallable = this.#functions.httpsCallable("getSmartThingsDeviceStatus");
    const response = await statusCallable({ deviceId: this.#deviceId });
    return {
      connected: true,
      method: "SmartThings",
      deviceProfile: response.data?.deviceProfile ?? response.data?.profile ?? null
    };
  }

  async sendCommand(command, parameters = {}) {
    if (!this.isConfigured()) {
      throw new Error("SmartThings nao configurado.");
    }
    const callable = this.#functions.httpsCallable("sendSmartThingsCommand");
    const response = await callable({ deviceId: this.#deviceId, command, parameters });
    return {
      status: response.data?.status ?? "accepted",
      command,
      method: "SmartThings",
      message: "Comando enviado por SmartThings."
    };
  }
}

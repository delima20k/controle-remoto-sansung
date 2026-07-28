export class LocalBridgeRemoteAdapter {
  kind = "localBridge";
  label = "Local Bridge";
  #baseUrl;
  #token;
  #fetchClient;

  constructor(options = {}) {
    this.#baseUrl = options.baseUrl ?? globalThis.__CONTROL_TV_CONFIG__?.localBridgeUrl ?? null;
    this.#token = options.token ?? globalThis.__CONTROL_TV_CONFIG__?.localBridgeToken ?? null;
    this.#fetchClient = options.fetchClient ?? globalThis.fetch?.bind(globalThis);
  }

  isConfigured() {
    return Boolean(this.#baseUrl && this.#fetchClient);
  }

  async connect() {
    if (!this.isConfigured()) {
      throw new Error("Local Bridge nao configurado.");
    }
    const response = await this.#request("/status", { method: "GET" });
    return {
      connected: response.status !== "error",
      method: "Local Bridge",
      deviceProfile: response.deviceProfile ?? null
    };
  }

  async sendCommand(command, parameters = {}) {
    if (!this.isConfigured()) {
      throw new Error("Local Bridge nao configurado.");
    }
    const response = await this.#request("/command", {
      method: "POST",
      body: JSON.stringify({ command, parameters })
    });
    return {
      status: response.status ?? "accepted",
      command,
      method: "Local Bridge",
      message: response.message ?? "Comando enviado por Local Bridge."
    };
  }

  async #request(path, init) {
    const response = await this.#fetchClient(`${this.#baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(this.#token ? { Authorization: `Bearer ${this.#token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error(`Local Bridge retornou HTTP ${response.status}`);
    }
    return response.json();
  }
}

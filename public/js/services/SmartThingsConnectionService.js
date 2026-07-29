export class SmartThingsConnectionService {
  static #STORAGE_PREFIX = "controle-tv.smartthings.device.";
  #functions;
  #uid;
  #storage;
  #location;

  constructor(functions, uid, storage = globalThis.localStorage, location = globalThis.location) {
    this.#functions = functions;
    this.#uid = uid;
    this.#storage = storage;
    this.#location = location;
  }

  isAvailable() {
    return Boolean(this.#functions && this.#uid);
  }

  selectedDeviceId() {
    if (!this.isAvailable()) {
      return null;
    }
    return this.#read(this.#storageKey()) || null;
  }

  selectDevice(device) {
    const deviceId = typeof device?.providerDeviceId === "string" ? device.providerDeviceId.trim() : "";
    if (!deviceId || deviceId.length > 256 || !this.isAvailable()) {
      throw new Error("Dispositivo SmartThings invalido.");
    }
    this.#write(this.#storageKey(), deviceId);
  }

  async startAuthorization() {
    this.#requireAvailable();
    const response = await this.#functions.httpsCallable("createSmartThingsAuthorizationUrl")({});
    const authorizationUrl = response?.data?.authorizationUrl;
    const url = this.#officialAuthorizationUrl(authorizationUrl);
    this.#location.assign(url.toString());
  }

  async listDevices() {
    this.#requireAvailable();
    const response = await this.#functions.httpsCallable("listSmartThingsDevices")({});
    const devices = response?.data?.devices;
    return Array.isArray(devices) ? devices.filter((device) => typeof device?.providerDeviceId === "string" && device.providerDeviceId.trim()) : [];
  }

  #officialAuthorizationUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.hostname !== "api.smartthings.com" || !url.pathname.startsWith("/v1/oauth/authorize")) {
        throw new Error();
      }
      return url;
    } catch {
      throw new Error("URL de autorizacao SmartThings invalida.");
    }
  }

  #storageKey() {
    return `${SmartThingsConnectionService.#STORAGE_PREFIX}${this.#uid}`;
  }

  #read(key) {
    return typeof this.#storage?.getItem === "function" ? this.#storage.getItem(key) : this.#storage?.get(key);
  }

  #write(key, value) {
    if (typeof this.#storage?.setItem === "function") {
      this.#storage.setItem(key, value);
      return;
    }
    this.#storage?.set(key, value);
  }

  #requireAvailable() {
    if (!this.isAvailable()) {
      throw new Error("Conexao SmartThings indisponivel. Verifique a sessao Firebase.");
    }
  }
}

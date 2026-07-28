import { FrontendRemoteCommandCatalog } from "../data/FrontendRemoteCommandCatalog.js";
import { CommandAvailabilityService } from "./CommandAvailabilityService.js";

export class RemoteCommandService {
  #adapter;
  #catalog;
  #availabilityService;
  #deviceProfile = null;

  constructor(adapter, catalog = new FrontendRemoteCommandCatalog(), availabilityService = new CommandAvailabilityService()) {
    this.#adapter = adapter;
    this.#catalog = catalog;
    this.#availabilityService = availabilityService;
  }

  get adapterKind() {
    return this.#adapter.kind;
  }

  setDeviceProfile(profile) {
    this.#deviceProfile = profile;
  }

  getDeviceProfile() {
    return this.#deviceProfile;
  }

  getAvailability(command) {
    if (!command || !this.#catalog.has(command)) {
      return { available: false, method: "Indisponivel", reason: "Comando fora da allowlist do front-end." };
    }
    return this.#availabilityService.resolve(command, this.#deviceProfile, this.#adapter.kind);
  }

  async connect() {
    const result = await this.#adapter.connect();
    this.setDeviceProfile(result.deviceProfile);
    return result;
  }

  async send(command, parameters = {}) {
    const request = this.#catalog.validate(command, parameters);
    const availability = this.getAvailability(command);
    if (!availability.available) {
      return {
        status: "unsupported",
        command,
        method: availability.method,
        message: availability.reason
      };
    }
    const result = await this.#adapter.sendCommand(request.command, request.parameters);
    return {
      ...result,
      method: result.method ?? availability.method,
      availability
    };
  }
}

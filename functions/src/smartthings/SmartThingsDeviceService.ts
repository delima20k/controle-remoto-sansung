import { AppError } from "../domain/AppError";
import { TvDeviceRecord, TvDeviceRepository } from "../repositories/TvDeviceRepository";
import { SmartThingsCapabilityResolver } from "./SmartThingsCapabilityResolver";
import { SmartThingsClient } from "./SmartThingsClient";
import { SmartThingsOAuthService } from "./SmartThingsOAuthService";
import { SamsungCu7700Profile } from "./SamsungCu7700Profile";
import { SmartThingsDevice } from "./SmartThingsTypes";

export class SmartThingsDeviceService {
  readonly #oauthService: SmartThingsOAuthService;
  readonly #client: SmartThingsClient;
  readonly #resolver: SmartThingsCapabilityResolver;
  readonly #repository: TvDeviceRepository;
  readonly #cu7700Profile: SamsungCu7700Profile;

  constructor(
    oauthService: SmartThingsOAuthService,
    client: SmartThingsClient,
    resolver: SmartThingsCapabilityResolver,
    repository: TvDeviceRepository,
    cu7700Profile = new SamsungCu7700Profile()
  ) {
    this.#oauthService = oauthService;
    this.#client = client;
    this.#resolver = resolver;
    this.#repository = repository;
    this.#cu7700Profile = cu7700Profile;
  }

  async listCompatibleDevices(uid: string): Promise<TvDeviceRecord[]> {
    const accessToken = await this.#oauthService.getValidAccessToken(uid);
    const devices = await this.#client.listDevices(accessToken);
    const compatible = devices.filter((device) => this.#resolver.isLikelyTvOrMediaPlayer(device));
    const records = compatible.map((device) => this.toRecord(device));
    return this.#repository.saveSmartThingsDevices(uid, records);
  }

  async getDeviceStatus(uid: string, deviceId: string): Promise<Record<string, unknown>> {
    const accessToken = await this.#oauthService.getValidAccessToken(uid);
    const known = await this.#repository.get(uid, deviceId);
    if (!known) {
      throw new AppError("not-found", "Dispositivo nao encontrado para este usuario");
    }
    return this.#client.getStatus(accessToken, deviceId);
  }

  async getDevice(uid: string, deviceId: string): Promise<SmartThingsDevice> {
    const accessToken = await this.#oauthService.getValidAccessToken(uid);
    const known = await this.#repository.get(uid, deviceId);
    if (!known) {
      throw new AppError("not-found", "Dispositivo nao encontrado para este usuario");
    }
    return this.#client.getDevice(accessToken, deviceId);
  }

  private toRecord(device: SmartThingsDevice): TvDeviceRecord {
    return {
      provider: "smartthings",
      providerDeviceId: device.deviceId,
      label: device.label ?? device.name ?? "Samsung TV",
      manufacturerName: device.manufacturerName,
      deviceManufacturerCode: device.deviceManufacturerCode,
      modelName: device.deviceModel,
      deviceModel: device.deviceModel,
      presentationId: device.presentationId,
      locationId: device.locationId,
      roomId: device.roomId,
      type: device.type,
      deviceProfile: this.#cu7700Profile.build(device),
      capabilities: this.#resolver.capabilityIds(device),
      lastKnownState: {}
    };
  }
}

import { RemoteCommandCatalog, RemoteCommandName } from "../domain/RemoteCommand";
import { AppError } from "../domain/AppError";
import { AuditEventService } from "../services/AuditEventService";
import { SamsungCu7700Profile } from "./SamsungCu7700Profile";
import { SmartThingsCapabilityResolver } from "./SmartThingsCapabilityResolver";
import { SmartThingsClient } from "./SmartThingsClient";
import { SmartThingsDeviceService } from "./SmartThingsDeviceService";
import { SmartThingsOAuthService } from "./SmartThingsOAuthService";

export class SmartThingsCommandService {
  readonly #oauthService: SmartThingsOAuthService;
  readonly #deviceService: SmartThingsDeviceService;
  readonly #client: SmartThingsClient;
  readonly #resolver: SmartThingsCapabilityResolver;
  readonly #auditEventService: AuditEventService;
  readonly #cu7700Profile = new SamsungCu7700Profile();

  constructor(
    oauthService: SmartThingsOAuthService,
    deviceService: SmartThingsDeviceService,
    client: SmartThingsClient,
    resolver: SmartThingsCapabilityResolver,
    auditEventService: AuditEventService
  ) {
    this.#oauthService = oauthService;
    this.#deviceService = deviceService;
    this.#client = client;
    this.#resolver = resolver;
    this.#auditEventService = auditEventService;
  }

  async send(uid: string, deviceId: string, command: RemoteCommandName, parameters: Record<string, unknown>, correlationId: string): Promise<{ status: "accepted"; command: RemoteCommandName; method: "smartthings" }> {
    RemoteCommandCatalog.validateParameters(command, parameters);
    const accessToken = await this.#oauthService.getValidAccessToken(uid);
    const device = await this.#deviceService.getDevice(uid, deviceId);
    const smartThingsCommand = this.resolveSmartThingsCommand(device, command, parameters);
    await this.#client.executeCommand(accessToken, deviceId, smartThingsCommand);
    await this.#auditEventService.record(uid, {
      type: "smartthings_command_sent",
      deviceId,
      command,
      status: "accepted",
      provider: "smartthings",
      correlationId
    });
    return { status: "accepted", command, method: "smartthings" };
  }

  private resolveSmartThingsCommand(device: Parameters<SmartThingsCapabilityResolver["toCommand"]>[0], command: RemoteCommandName, parameters: Record<string, unknown>) {
    try {
      return this.#resolver.toCommand(device, command, parameters);
    } catch (error) {
      if (error instanceof AppError && error.code === "failed-precondition") {
        const availability = this.#cu7700Profile.build(device).commandAvailability.find((item) => item.command === command);
        throw new AppError(error.code, error.publicMessage, {
          ...error.details,
          command,
          smartThingsAvailable: availability?.smartThings.available ?? false,
          localBridgeAvailable: availability?.localBridge.available ?? false,
          localBridgeExperimental: availability?.localBridge.experimental ?? false,
          preferredMethod: availability?.preferredMethod ?? "unavailable"
        });
      }
      throw error;
    }
  }
}

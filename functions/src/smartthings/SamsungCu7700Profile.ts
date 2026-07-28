import { RemoteCommandCatalog, RemoteCommandName } from "../domain/RemoteCommand";
import { SmartThingsDevice } from "./SmartThingsTypes";

export type ConfirmedCapability = {
  readonly componentId: string;
  readonly capabilityId: string;
  readonly version?: number;
};

export type ConfirmedComponent = {
  readonly id: string;
  readonly label?: string;
  readonly capabilities: ConfirmedCapability[];
  readonly categories: readonly string[];
};

export type CommandAvailability = {
  readonly command: RemoteCommandName;
  readonly smartThings: {
    readonly available: boolean;
    readonly reason: string;
    readonly method: "smartthings";
    readonly capabilityId?: string;
  };
  readonly localBridge: {
    readonly available: boolean;
    readonly experimental: boolean;
    readonly reason: string;
    readonly method: "localBridge";
  };
  readonly preferredMethod: "smartthings" | "localBridge" | "unavailable";
};

export type ConfirmedSamsungCu7700Profile = {
  readonly profileName: "SamsungCu7700Profile";
  readonly targetModel: "UN75CU7700GXZD";
  readonly confirmedModelMatch: boolean;
  readonly confirmedIdentity: {
    readonly deviceId: string;
    readonly name?: string;
    readonly label?: string;
    readonly manufacturerName?: string;
    readonly deviceManufacturerCode?: string;
    readonly deviceModel?: string;
    readonly presentationId?: string;
    readonly type?: string;
    readonly locationId?: string;
    readonly roomId?: string;
  };
  readonly confirmedComponents: ConfirmedComponent[];
  readonly confirmedCapabilities: string[];
  readonly commandAvailability: CommandAvailability[];
};

export class SamsungCu7700Profile {
  static readonly profileName = "SamsungCu7700Profile";
  static readonly targetModel = "UN75CU7700GXZD";

  build(device: SmartThingsDevice): ConfirmedSamsungCu7700Profile {
    const capabilities = this.capabilitySet(device);
    const confirmedIdentity = this.compactIdentity(device);
    return {
      profileName: SamsungCu7700Profile.profileName,
      targetModel: SamsungCu7700Profile.targetModel,
      confirmedModelMatch: this.isConfirmedModelMatch(device),
      confirmedIdentity,
      confirmedComponents: this.components(device),
      confirmedCapabilities: [...capabilities].sort(),
      commandAvailability: this.commandAvailability(capabilities)
    };
  }

  private compactIdentity(device: SmartThingsDevice): ConfirmedSamsungCu7700Profile["confirmedIdentity"] {
    return this.withoutUndefined({
      deviceId: device.deviceId,
      name: device.name,
      label: device.label,
      manufacturerName: device.manufacturerName,
      deviceManufacturerCode: device.deviceManufacturerCode,
      deviceModel: device.deviceModel,
      presentationId: device.presentationId,
      type: device.type,
      locationId: device.locationId,
      roomId: device.roomId
    });
  }

  private components(device: SmartThingsDevice): ConfirmedComponent[] {
    return (device.components ?? []).map((component) => this.withoutUndefined({
      id: component.id,
      label: component.label,
      capabilities: (component.capabilities ?? []).map((capability) => this.withoutUndefined({
        componentId: component.id,
        capabilityId: capability.id,
        version: capability.version
      })),
      categories: (component.categories ?? []).map((category) => category.name).filter(Boolean).sort()
    }));
  }

  private commandAvailability(capabilities: Set<string>): CommandAvailability[] {
    return [...RemoteCommandCatalog.definitions.values()].map((definition) => {
      const smartThingsCapability = this.requiredSmartThingsCapability(definition.name) ?? undefined;
      const smartThingsAvailable = Boolean(smartThingsCapability && capabilities.has(smartThingsCapability));
      const localBridgeAvailable = definition.localBridgeSupport !== "unsupported";
      return {
        command: definition.name,
        smartThings: {
          available: smartThingsAvailable,
          reason: smartThingsAvailable
            ? `Disponivel via SmartThings capability ${smartThingsCapability}`
            : definition.smartThingsSupport === "supported"
              ? `SmartThings nao retornou a capability necessaria: ${smartThingsCapability ?? "desconhecida"}`
              : "Nao ha mapeamento oficial SmartThings para este comando",
          method: "smartthings",
          capabilityId: smartThingsAvailable ? smartThingsCapability : undefined
        },
        localBridge: {
          available: localBridgeAvailable,
          experimental: definition.localBridgeSupport === "experimental",
          reason: localBridgeAvailable
            ? definition.localBridgeSupport === "experimental"
              ? "Pode ser tentado pelo Local Bridge experimental apos pareamento local"
              : "Disponivel pelo Local Bridge quando pareado"
            : "Nao disponivel pelo Local Bridge",
          method: "localBridge"
        },
        preferredMethod: smartThingsAvailable ? "smartthings" : localBridgeAvailable ? "localBridge" : "unavailable"
      };
    });
  }

  private requiredSmartThingsCapability(command: RemoteCommandName): string | null {
    switch (command) {
      case "POWER_ON":
      case "POWER_OFF":
        return "switch";
      case "VOLUME_UP":
      case "VOLUME_DOWN":
      case "SET_VOLUME":
        return "audioVolume";
      case "MUTE":
      case "UNMUTE":
        return "audioMute";
      case "PLAY":
      case "PAUSE":
      case "PLAY_PAUSE":
      case "FAST_FORWARD":
      case "REWIND":
        return "mediaPlayback";
      default:
        return null;
    }
  }

  private capabilitySet(device: SmartThingsDevice): Set<string> {
    const ids = new Set<string>();
    for (const component of device.components ?? []) {
      for (const capability of component.capabilities ?? []) {
        ids.add(capability.id);
      }
    }
    return ids;
  }

  private isConfirmedModelMatch(device: SmartThingsDevice): boolean {
    const confirmedValues = [device.deviceModel, device.name, device.label].filter((value): value is string => typeof value === "string");
    return confirmedValues.some((value) => value.toUpperCase().includes(SamsungCu7700Profile.targetModel));
  }

  private withoutUndefined<T extends Record<string, unknown>>(value: T): T {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
  }
}

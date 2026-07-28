import { AppError } from "../domain/AppError";
import { RemoteCommandCatalog, RemoteCommandName } from "../domain/RemoteCommand";
import { SmartThingsCommand, SmartThingsDevice } from "./SmartThingsTypes";

export class SmartThingsCapabilityResolver {
  toCommand(device: SmartThingsDevice, command: RemoteCommandName, parameters: Record<string, unknown>): SmartThingsCommand {
    RemoteCommandCatalog.validateParameters(command, parameters);
    const definition = RemoteCommandCatalog.get(command);
    if (definition.smartThingsSupport !== "supported") {
      throw new AppError("failed-precondition", definition.unavailableMessage, { command, mode: "smartthings" });
    }
    const capabilities = this.capabilitySet(device);
    switch (command) {
      case "POWER_ON":
        return this.commandIfSupported(capabilities, "switch", "on");
      case "POWER_OFF":
        return this.commandIfSupported(capabilities, "switch", "off");
      case "VOLUME_UP":
        return this.commandIfSupported(capabilities, "audioVolume", "volumeUp");
      case "VOLUME_DOWN":
        return this.commandIfSupported(capabilities, "audioVolume", "volumeDown");
      case "SET_VOLUME":
        return this.commandIfSupported(capabilities, "audioVolume", "setVolume", [parameters.volume]);
      case "MUTE":
        return this.commandIfSupported(capabilities, "audioMute", "mute");
      case "UNMUTE":
        return this.commandIfSupported(capabilities, "audioMute", "unmute");
      case "PLAY":
        return this.commandIfSupported(capabilities, "mediaPlayback", "play");
      case "PAUSE":
        return this.commandIfSupported(capabilities, "mediaPlayback", "pause");
      case "PLAY_PAUSE":
        return this.commandIfSupported(capabilities, "mediaPlayback", "playPause");
      case "FAST_FORWARD":
        return this.commandIfSupported(capabilities, "mediaPlayback", "fastForward");
      case "REWIND":
        return this.commandIfSupported(capabilities, "mediaPlayback", "rewind");
      default:
        throw new AppError("failed-precondition", definition.unavailableMessage, { command, mode: "smartthings" });
    }
  }

  capabilityIds(device: SmartThingsDevice): string[] {
    return [...this.capabilitySet(device)].sort();
  }

  isLikelyTvOrMediaPlayer(device: SmartThingsDevice): boolean {
    const capabilities = this.capabilitySet(device);
    return capabilities.has("mediaPlayback")
      || capabilities.has("audioVolume")
      || capabilities.has("audioMute")
      || capabilities.has("mediaInputSource")
      || /tv|television|samsung|media/i.test(`${device.label ?? ""} ${device.name ?? ""}`);
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

  private commandIfSupported(capabilities: Set<string>, capability: string, command: string, args: unknown[] = []): SmartThingsCommand {
    if (!capabilities.has(capability)) {
      throw new AppError("failed-precondition", `A TV nao declarou suporte para ${capability}`);
    }
    return {
      component: "main",
      capability,
      command,
      arguments: args
    };
  }
}

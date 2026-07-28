export class CommandAvailabilityService {
  readonlyProfile(profile) {
    if (!profile || !Array.isArray(profile.commandAvailability)) {
      return new Map();
    }
    return new Map(profile.commandAvailability.map((entry) => [entry.command, entry]));
  }

  resolve(command, profile, adapterKind) {
    const availability = this.readonlyProfile(profile).get(command);
    if (!availability) {
      return adapterKind === "mock"
        ? { available: true, method: "Mock", reason: "Disponivel apenas para simulacao local." }
        : { available: false, method: "Indisponivel", reason: "A TV ainda nao confirmou esta capacidade." };
    }
    if (availability.smartThings?.available && adapterKind === "smartthings") {
      return { available: true, method: "SmartThings", reason: availability.smartThings.reason };
    }
    if (availability.localBridge?.available && adapterKind === "localBridge") {
      return {
        available: true,
        method: availability.localBridge.experimental ? "Local Bridge experimental" : "Local Bridge",
        reason: availability.localBridge.reason
      };
    }
    if (availability.smartThings?.available) {
      return { available: true, method: "SmartThings", reason: availability.smartThings.reason };
    }
    if (availability.localBridge?.available) {
      return {
        available: true,
        method: availability.localBridge.experimental ? "Local Bridge experimental" : "Local Bridge",
        reason: availability.localBridge.reason
      };
    }
    return { available: false, method: "Indisponivel", reason: "Nenhum metodo confirmado para este comando." };
  }
}

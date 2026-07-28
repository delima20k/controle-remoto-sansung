export class MockRemoteAdapter {
  kind = "mock";
  label = "Mock";

  async connect() {
    return {
      connected: true,
      method: "Mock",
      deviceProfile: this.#profile()
    };
  }

  async sendCommand(command, parameters = {}) {
    return {
      status: "accepted",
      command,
      parameters,
      method: "Mock",
      message: "Comando simulado."
    };
  }

  #profile() {
    const localExperimental = new Set([
      "CHANNEL_UP",
      "CHANNEL_DOWN",
      "SET_CHANNEL",
      "NAVIGATE_UP",
      "NAVIGATE_DOWN",
      "NAVIGATE_LEFT",
      "NAVIGATE_RIGHT",
      "SELECT",
      "BACK",
      "HOME",
      "MENU",
      "SOURCE",
      "OPEN_APP",
      "NUMBER_KEY"
    ]);
    const smartThings = new Set(["POWER_ON", "POWER_OFF", "VOLUME_UP", "VOLUME_DOWN", "SET_VOLUME", "MUTE", "UNMUTE", "PLAY", "PAUSE", "PLAY_PAUSE", "FAST_FORWARD", "REWIND"]);
    const commands = [...new Set([...smartThings, ...localExperimental])].sort();
    return {
      profileName: "SamsungCu7700Profile",
      targetModel: "UN75CU7700GXZD",
      confirmedModelMatch: false,
      confirmedIdentity: {
        deviceId: "mock-device",
        label: "Samsung Crystal UHD"
      },
      confirmedCapabilities: [...smartThings],
      installedApps: null,
      commandAvailability: commands.map((command) => ({
        command,
        smartThings: {
          available: smartThings.has(command),
          reason: smartThings.has(command) ? "Simulado como capability SmartThings confirmada." : "Sem mapeamento SmartThings no mock.",
          method: "smartthings"
        },
        localBridge: {
          available: localExperimental.has(command),
          experimental: localExperimental.has(command),
          reason: localExperimental.has(command) ? "Simulado como alternativa Local Bridge experimental." : "Nao disponivel no bridge mock.",
          method: "localBridge"
        },
        preferredMethod: smartThings.has(command) ? "smartthings" : localExperimental.has(command) ? "localBridge" : "unavailable"
      }))
    };
  }
}

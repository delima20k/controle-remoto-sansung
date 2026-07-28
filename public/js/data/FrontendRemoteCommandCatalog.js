export class FrontendRemoteCommandCatalog {
  static #COMMANDS = new Map([
    ["POWER_ON", { command: "POWER_ON", requires: [], label: "Power on" }],
    ["POWER_OFF", { command: "POWER_OFF", requires: [], label: "Power off" }],
    ["VOLUME_UP", { command: "VOLUME_UP", requires: [], label: "Volume +" }],
    ["VOLUME_DOWN", { command: "VOLUME_DOWN", requires: [], label: "Volume -" }],
    ["SET_VOLUME", { command: "SET_VOLUME", requires: [{ name: "volume", type: "integer", min: 0, max: 100 }], label: "Volume" }],
    ["MUTE", { command: "MUTE", requires: [], label: "Mute" }],
    ["UNMUTE", { command: "UNMUTE", requires: [], label: "Unmute" }],
    ["CHANNEL_UP", { command: "CHANNEL_UP", requires: [], label: "Canal +" }],
    ["CHANNEL_DOWN", { command: "CHANNEL_DOWN", requires: [], label: "Canal -" }],
    ["SET_CHANNEL", { command: "SET_CHANNEL", requires: [{ name: "channel", type: "integer", min: 1, max: 9999 }], label: "Canal" }],
    ["NAVIGATE_UP", { command: "NAVIGATE_UP", requires: [], label: "Cima" }],
    ["NAVIGATE_DOWN", { command: "NAVIGATE_DOWN", requires: [], label: "Baixo" }],
    ["NAVIGATE_LEFT", { command: "NAVIGATE_LEFT", requires: [], label: "Esquerda" }],
    ["NAVIGATE_RIGHT", { command: "NAVIGATE_RIGHT", requires: [], label: "Direita" }],
    ["SELECT", { command: "SELECT", requires: [], label: "OK" }],
    ["BACK", { command: "BACK", requires: [], label: "Voltar" }],
    ["HOME", { command: "HOME", requires: [], label: "Home" }],
    ["MENU", { command: "MENU", requires: [], label: "Menu" }],
    ["SOURCE", { command: "SOURCE", requires: [], label: "Source" }],
    ["PLAY", { command: "PLAY", requires: [], label: "Play" }],
    ["PAUSE", { command: "PAUSE", requires: [], label: "Pause" }],
    ["PLAY_PAUSE", { command: "PLAY_PAUSE", requires: [], label: "Play/Pause" }],
    ["FAST_FORWARD", { command: "FAST_FORWARD", requires: [], label: "Avancar" }],
    ["REWIND", { command: "REWIND", requires: [], label: "Voltar midia" }],
    ["OPEN_APP", { command: "OPEN_APP", requires: [{ name: "appId", type: "string", min: 1, max: 80, pattern: /^[a-zA-Z0-9._:-]+$/ }], label: "Abrir app" }],
    ["NUMBER_KEY", { command: "NUMBER_KEY", requires: [{ name: "digit", type: "integer", min: 0, max: 9 }], label: "Numero" }]
  ]);

  getAll() {
    return [...FrontendRemoteCommandCatalog.#COMMANDS.values()].map((command) => ({ ...command }));
  }

  has(command) {
    return FrontendRemoteCommandCatalog.#COMMANDS.has(command);
  }

  get(command) {
    const definition = FrontendRemoteCommandCatalog.#COMMANDS.get(command);
    if (!definition) {
      throw new Error(`Comando nao permitido: ${command}`);
    }
    return { ...definition, requires: definition.requires.map((item) => ({ ...item })) };
  }

  validate(command, parameters = {}) {
    const definition = this.get(command);
    const keys = Object.keys(parameters);
    const allowedKeys = new Set(definition.requires.map((item) => item.name));
    for (const key of keys) {
      if (!allowedKeys.has(key)) {
        throw new Error(`Parametro nao permitido: ${key}`);
      }
    }
    for (const requirement of definition.requires) {
      this.#validateRequirement(requirement, parameters[requirement.name]);
    }
    return { command, parameters: { ...parameters } };
  }

  #validateRequirement(requirement, value) {
    if (value === undefined) {
      throw new Error(`Parametro obrigatorio ausente: ${requirement.name}`);
    }
    if (requirement.type === "integer" && (!Number.isInteger(value) || typeof value !== "number")) {
      throw new Error(`Parametro ${requirement.name} deve ser inteiro`);
    }
    if (requirement.type === "string" && typeof value !== "string") {
      throw new Error(`Parametro ${requirement.name} deve ser texto`);
    }
    if (typeof value === "number" && value < requirement.min) {
      throw new Error(`Parametro ${requirement.name} abaixo do minimo`);
    }
    if (typeof value === "number" && value > requirement.max) {
      throw new Error(`Parametro ${requirement.name} acima do maximo`);
    }
    if (typeof value === "string" && value.length < requirement.min) {
      throw new Error(`Parametro ${requirement.name} curto demais`);
    }
    if (typeof value === "string" && value.length > requirement.max) {
      throw new Error(`Parametro ${requirement.name} longo demais`);
    }
    if (requirement.pattern && typeof value === "string" && !requirement.pattern.test(value)) {
      throw new Error(`Parametro ${requirement.name} invalido`);
    }
  }
}

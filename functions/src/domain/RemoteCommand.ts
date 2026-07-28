import { z } from "zod";

export const RemoteCommandNameSchema = z.enum([
  "POWER_ON",
  "POWER_OFF",
  "VOLUME_UP",
  "VOLUME_DOWN",
  "SET_VOLUME",
  "MUTE",
  "UNMUTE",
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
  "PLAY",
  "PAUSE",
  "PLAY_PAUSE",
  "FAST_FORWARD",
  "REWIND",
  "OPEN_APP",
  "NUMBER_KEY"
]);

export type RemoteCommandName = z.infer<typeof RemoteCommandNameSchema>;

export type RemoteMode = "smartthings" | "localBridge";

export type ParameterSpec = {
  readonly name: string;
  readonly type: "integer" | "string";
  readonly required: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: RegExp;
};

export type CommandDefinition = {
  readonly name: RemoteCommandName;
  readonly smartThingsSupport: "supported" | "unsupported";
  readonly localBridgeSupport: "supported" | "unsupported" | "experimental";
  readonly parameters: readonly ParameterSpec[];
  readonly unavailableMessage: string;
};

export type RemoteCommandRequest = {
  readonly command: RemoteCommandName;
  readonly parameters: Record<string, unknown>;
};

export class RemoteCommandCatalog {
  static readonly definitions: ReadonlyMap<RemoteCommandName, CommandDefinition> = new Map(
    [
      this.entry("POWER_ON", "supported", "experimental", []),
      this.entry("POWER_OFF", "supported", "experimental", []),
      this.entry("VOLUME_UP", "supported", "supported", []),
      this.entry("VOLUME_DOWN", "supported", "supported", []),
      this.entry("SET_VOLUME", "supported", "supported", [{ name: "volume", type: "integer", required: true, min: 0, max: 100 }]),
      this.entry("MUTE", "supported", "supported", []),
      this.entry("UNMUTE", "supported", "supported", []),
      this.entry("CHANNEL_UP", "unsupported", "experimental", []),
      this.entry("CHANNEL_DOWN", "unsupported", "experimental", []),
      this.entry("SET_CHANNEL", "unsupported", "experimental", [{ name: "channel", type: "integer", required: true, min: 1, max: 9999 }]),
      this.entry("NAVIGATE_UP", "unsupported", "experimental", []),
      this.entry("NAVIGATE_DOWN", "unsupported", "experimental", []),
      this.entry("NAVIGATE_LEFT", "unsupported", "experimental", []),
      this.entry("NAVIGATE_RIGHT", "unsupported", "experimental", []),
      this.entry("SELECT", "unsupported", "experimental", []),
      this.entry("BACK", "unsupported", "experimental", []),
      this.entry("HOME", "unsupported", "experimental", []),
      this.entry("MENU", "unsupported", "experimental", []),
      this.entry("SOURCE", "unsupported", "experimental", []),
      this.entry("PLAY", "supported", "supported", []),
      this.entry("PAUSE", "supported", "supported", []),
      this.entry("PLAY_PAUSE", "supported", "supported", []),
      this.entry("FAST_FORWARD", "supported", "supported", []),
      this.entry("REWIND", "supported", "supported", []),
      this.entry("OPEN_APP", "unsupported", "experimental", [{ name: "appId", type: "string", required: true, min: 1, max: 80, pattern: /^[a-zA-Z0-9._:-]+$/ }]),
      this.entry("NUMBER_KEY", "unsupported", "experimental", [{ name: "digit", type: "integer", required: true, min: 0, max: 9 }])
    ]
  );

  static get(command: RemoteCommandName): CommandDefinition {
    const definition = this.definitions.get(command);
    if (!definition) {
      throw new Error(`Comando desconhecido: ${command}`);
    }
    return definition;
  }

  static validateParameters(command: RemoteCommandName, parameters: Record<string, unknown>): RemoteCommandRequest {
    const definition = this.get(command);
    const allowed = new Set(definition.parameters.map((parameter) => parameter.name));
    for (const key of Object.keys(parameters)) {
      if (!allowed.has(key)) {
        throw new Error(`Parametro nao permitido: ${key}`);
      }
    }
    for (const spec of definition.parameters) {
      const value = parameters[spec.name];
      if (spec.required && value === undefined) {
        throw new Error(`Parametro obrigatorio ausente: ${spec.name}`);
      }
      if (value === undefined) {
        continue;
      }
      if (spec.type === "integer" && (!Number.isInteger(value) || typeof value !== "number")) {
        throw new Error(`Parametro ${spec.name} deve ser inteiro`);
      }
      if (spec.type === "string" && typeof value !== "string") {
        throw new Error(`Parametro ${spec.name} deve ser texto`);
      }
      if (typeof value === "number" && spec.min !== undefined && value < spec.min) {
        throw new Error(`Parametro ${spec.name} abaixo do minimo`);
      }
      if (typeof value === "number" && spec.max !== undefined && value > spec.max) {
        throw new Error(`Parametro ${spec.name} acima do maximo`);
      }
      if (typeof value === "string" && spec.min !== undefined && value.length < spec.min) {
        throw new Error(`Parametro ${spec.name} curto demais`);
      }
      if (typeof value === "string" && spec.max !== undefined && value.length > spec.max) {
        throw new Error(`Parametro ${spec.name} longo demais`);
      }
      if (typeof value === "string" && spec.pattern && !spec.pattern.test(value)) {
        throw new Error(`Parametro ${spec.name} tem formato invalido`);
      }
    }
    return { command, parameters };
  }

  private static entry(
    name: RemoteCommandName,
    smartThingsSupport: CommandDefinition["smartThingsSupport"],
    localBridgeSupport: CommandDefinition["localBridgeSupport"],
    parameters: readonly ParameterSpec[]
  ): readonly [RemoteCommandName, CommandDefinition] {
    return [
      name,
      {
        name,
        smartThingsSupport,
        localBridgeSupport,
        parameters,
        unavailableMessage: `O comando ${name} nao esta disponivel neste modo ou nesta TV.`
      }
    ];
  }
}

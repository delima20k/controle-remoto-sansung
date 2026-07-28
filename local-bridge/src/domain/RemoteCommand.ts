import { z } from "zod";

export const BridgeCommandNameSchema = z.enum([
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

export type BridgeCommandName = z.infer<typeof BridgeCommandNameSchema>;

export const BridgeCommandSchema = z.object({
  command: BridgeCommandNameSchema,
  parameters: z.record(z.string(), z.unknown()).default({}),
  requestId: z.string().min(8).max(80).regex(/^[a-zA-Z0-9._:-]+$/).optional()
}).strict();

export type BridgeCommandRequest = z.infer<typeof BridgeCommandSchema>;

export type BridgeCommandResult = {
  readonly status: "accepted" | "unsupported" | "error";
  readonly command: BridgeCommandName;
  readonly message: string;
};

export class BridgeCommandValidator {
  static validate(input: unknown): BridgeCommandRequest {
    const parsed = BridgeCommandSchema.parse(input);
    if (parsed.command === "SET_VOLUME") {
      this.assertInteger(parsed.parameters.volume, "volume", 0, 100);
    }
    if (parsed.command === "SET_CHANNEL") {
      this.assertInteger(parsed.parameters.channel, "channel", 1, 9999);
    }
    if (parsed.command === "NUMBER_KEY") {
      this.assertInteger(parsed.parameters.digit, "digit", 0, 9);
    }
    if (parsed.command === "OPEN_APP") {
      const appId = parsed.parameters.appId;
      if (typeof appId !== "string" || appId.length < 1 || appId.length > 80 || !/^[a-zA-Z0-9._:-]+$/.test(appId)) {
        throw new Error("Parametro appId invalido");
      }
    }
    return parsed;
  }

  private static assertInteger(value: unknown, name: string, min: number, max: number): void {
    if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
      throw new Error(`Parametro ${name} deve ser inteiro entre ${min} e ${max}`);
    }
  }
}

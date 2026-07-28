import { z } from "zod";
import { RemoteCommandNameSchema } from "../domain/RemoteCommand";

export const EmptySchema = z.object({}).strict();

export const DeviceIdSchema = z.object({
  deviceId: z.string().min(1).max(160).regex(/^[a-zA-Z0-9._:-]+$/)
}).strict();

export const SendCommandSchema = DeviceIdSchema.extend({
  command: RemoteCommandNameSchema,
  parameters: z.record(z.string(), z.unknown()).default({})
}).strict();

export const PreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  highContrast: z.boolean(),
  hapticsEnabled: z.boolean(),
  defaultControlMode: z.enum(["smartthings", "localBridge"]),
  selectedDeviceId: z.string().min(1).max(160).optional(),
  language: z.literal("pt-BR")
}).strict();

export const NaturalLanguageSchema = z.object({
  phrase: z.string().trim().min(1).max(160)
}).strict();

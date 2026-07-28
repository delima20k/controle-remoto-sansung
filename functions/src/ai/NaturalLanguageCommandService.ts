import { AppConfig } from "../config/AppConfig";
import { AppError } from "../domain/AppError";
import { RemoteCommandCatalog, RemoteCommandName } from "../domain/RemoteCommand";

export type ParsedNaturalLanguageCommand = {
  readonly command: RemoteCommandName;
  readonly parameters: Record<string, unknown>;
  readonly confidence: number;
  readonly requiresConfirmation: boolean;
};

export class NaturalLanguageCommandService {
  parse(phrase: string): ParsedNaturalLanguageCommand {
    if (!AppConfig.aiCommandsEnabled()) {
      throw new AppError("failed-precondition", "Comandos por IA estao desativados");
    }
    const normalized = phrase.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const result = this.ruleBasedParse(normalized);
    if (!result) {
      throw new AppError("failed-precondition", "Nao foi possivel transformar a frase em comando permitido");
    }
    RemoteCommandCatalog.validateParameters(result.command, result.parameters);
    return result;
  }

  private ruleBasedParse(normalized: string): ParsedNaturalLanguageCommand | null {
    if (normalized.includes("aument") && normalized.includes("volume")) {
      return { command: "VOLUME_UP", parameters: {}, confidence: 0.88, requiresConfirmation: false };
    }
    if (normalized.includes("baix") && normalized.includes("volume")) {
      return { command: "VOLUME_DOWN", parameters: {}, confidence: 0.88, requiresConfirmation: false };
    }
    if (normalized.includes("mudo") || normalized.includes("silenciar")) {
      return { command: "MUTE", parameters: {}, confidence: 0.82, requiresConfirmation: false };
    }
    if (normalized.includes("deslig")) {
      return { command: "POWER_OFF", parameters: {}, confidence: 0.86, requiresConfirmation: true };
    }
    const channel = normalized.match(/canal\s+(\d{1,4})/);
    if (channel?.[1]) {
      return { command: "SET_CHANNEL", parameters: { channel: Number(channel[1]) }, confidence: 0.84, requiresConfirmation: false };
    }
    return null;
  }
}

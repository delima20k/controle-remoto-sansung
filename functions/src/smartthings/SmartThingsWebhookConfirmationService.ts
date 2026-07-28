import { AppError } from "../domain/AppError";
import { HttpClient } from "../utils/HttpClient";

type SmartThingsConfirmationPayload = {
  readonly messageType?: unknown;
  readonly confirmationData?: {
    readonly confirmationUrl?: unknown;
  };
};

export class SmartThingsWebhookConfirmationService {
  readonly #httpClient: Pick<HttpClient, "getJson">;

  constructor(httpClient: Pick<HttpClient, "getJson">) {
    this.#httpClient = httpClient;
  }

  async handle(payload: SmartThingsConfirmationPayload): Promise<{ confirmed: boolean }> {
    if (payload.messageType !== "CONFIRMATION") {
      return { confirmed: false };
    }
    const confirmationUrl = this.#validateConfirmationUrl(payload.confirmationData?.confirmationUrl);
    const response = await this.#httpClient.getJson<Record<string, never>>(confirmationUrl, {});
    if (response.status >= 400) {
      throw new AppError("unavailable", "SmartThings recusou a confirmacao do webhook");
    }
    return { confirmed: true };
  }

  #validateConfirmationUrl(value: unknown): string {
    if (typeof value !== "string") {
      throw new AppError("invalid-argument", "URL de confirmacao SmartThings invalida");
    }
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.hostname !== "api.smartthings.com") {
        throw new Error("host invalido");
      }
      return url.toString();
    } catch {
      throw new AppError("invalid-argument", "URL de confirmacao SmartThings invalida");
    }
  }
}

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SmartThingsWebhookConfirmationService } from "../src/smartthings/SmartThingsWebhookConfirmationService";
import { HttpClientResponse } from "../src/utils/HttpClient";

describe("SmartThingsWebhookConfirmationService", () => {
  it("deve confirmar somente a URL HTTPS oficial recebida no desafio", async () => {
    const requested: string[] = [];
    const httpClient = {
      getJson: async (url: string): Promise<HttpClientResponse<Record<string, never>>> => {
        requested.push(url);
        return { status: 200, headers: new Headers(), data: {} };
      }
    };
    const service = new SmartThingsWebhookConfirmationService(httpClient as never);

    const result = await service.handle({
      messageType: "CONFIRMATION",
      confirmationData: { confirmationUrl: "https://api.smartthings.com/v1/apps/app-1/confirm-registration?token=abc" }
    });

    assert.equal(result.confirmed, true);
    assert.equal(requested.length, 1);
  });

  it("deve ignorar eventos sem executar chamadas externas", async () => {
    const httpClient = {
      getJson: async (): Promise<HttpClientResponse<Record<string, never>>> => {
        throw new Error("nao deveria chamar a SmartThings");
      }
    };
    const service = new SmartThingsWebhookConfirmationService(httpClient as never);

    const result = await service.handle({ messageType: "EVENT" });

    assert.equal(result.confirmed, false);
  });

  it("deve rejeitar desafio sem URL de confirmacao valida", async () => {
    const service = new SmartThingsWebhookConfirmationService({} as never);

    await assert.rejects(
      () => service.handle({ messageType: "CONFIRMATION", confirmationData: { confirmationUrl: "http://inseguro.example" } }),
      /confirmacao SmartThings invalida/
    );
  });
});

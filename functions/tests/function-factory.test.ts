import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FunctionFactory } from "../src/FunctionFactory";
import { SmartThingsWebhookConfirmationService } from "../src/smartthings/SmartThingsWebhookConfirmationService";

describe("FunctionFactory", () => {
  it("deve compor o webhook sem carregar os servicos que dependem de segredos", () => {
    const service = FunctionFactory.buildSmartThingsWebhookConfirmationService();

    assert.equal(service instanceof SmartThingsWebhookConfirmationService, true);
  });
});

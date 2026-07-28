import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BridgeCommandValidator } from "../src/domain/RemoteCommand";

describe("BridgeCommandValidator", () => {
  it("deve aceitar NUMBER_KEY valido", () => {
    const command = BridgeCommandValidator.validate({ command: "NUMBER_KEY", parameters: { digit: 7 } });
    assert.equal(command.parameters.digit, 7);
  });

  it("deve rejeitar OPEN_APP com appId inseguro", () => {
    assert.throws(() => BridgeCommandValidator.validate({ command: "OPEN_APP", parameters: { appId: "http://evil" } }), /appId invalido/);
  });
});

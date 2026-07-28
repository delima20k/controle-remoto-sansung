import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RemoteCommandCatalog } from "../src/domain/RemoteCommand";

describe("RemoteCommandCatalog", () => {
  it("deve validar parametros de SET_VOLUME", () => {
    const result = RemoteCommandCatalog.validateParameters("SET_VOLUME", { volume: 42 });
    assert.equal(result.parameters.volume, 42);
  });

  it("deve rejeitar parametro desconhecido", () => {
    assert.throws(() => RemoteCommandCatalog.validateParameters("VOLUME_UP", { raw: "x" }), /Parametro nao permitido/);
  });

  it("deve rejeitar NUMBER_KEY fora do intervalo", () => {
    assert.throws(() => RemoteCommandCatalog.validateParameters("NUMBER_KEY", { digit: 10 }), /acima do maximo/);
  });
});

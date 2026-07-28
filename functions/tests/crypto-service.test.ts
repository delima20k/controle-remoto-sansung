import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CryptoService } from "../src/utils/CryptoService";

describe("CryptoService", () => {
  it("deve criptografar e descriptografar token", () => {
    const service = new CryptoService("uma-chave-local-de-teste-com-tamanho");
    const encrypted = service.encrypt("token-secreto");
    assert.notEqual(encrypted.ciphertext, "token-secreto");
    assert.equal(service.decrypt(encrypted), "token-secreto");
  });
});

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type EncryptedValue = {
  readonly iv: string;
  readonly tag: string;
  readonly ciphertext: string;
  readonly algorithm: "aes-256-gcm";
  readonly keyVersion: string;
};

export class CryptoService {
  readonly #key: Buffer;
  readonly #keyVersion: string;

  constructor(secret: string, keyVersion = "v1") {
    if (!secret || secret.length < 16) {
      throw new Error("TOKEN_ENCRYPTION_KEY deve ter pelo menos 16 caracteres");
    }
    this.#key = createHash("sha256").update(secret).digest();
    this.#keyVersion = keyVersion;
  }

  encrypt(plainText: string): EncryptedValue {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.#key, iv);
    const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      iv: iv.toString("base64url"),
      tag: tag.toString("base64url"),
      ciphertext: ciphertext.toString("base64url"),
      algorithm: "aes-256-gcm",
      keyVersion: this.#keyVersion
    };
  }

  decrypt(value: EncryptedValue): string {
    if (value.algorithm !== "aes-256-gcm") {
      throw new Error("Algoritmo de criptografia nao suportado");
    }
    const decipher = createDecipheriv("aes-256-gcm", this.#key, Buffer.from(value.iv, "base64url"));
    decipher.setAuthTag(Buffer.from(value.tag, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(value.ciphertext, "base64url")),
      decipher.final()
    ]);
    return decrypted.toString("utf8");
  }
}

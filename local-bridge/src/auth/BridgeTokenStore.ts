import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

type TokenFile = {
  readonly tokenHash: string;
  readonly createdAt: string;
};

export class BridgeTokenStore {
  readonly #path: string;

  constructor(dataDir: string) {
    this.#path = join(dataDir, "bridge-token.json");
  }

  hasToken(): boolean {
    return existsSync(this.#path);
  }

  createToken(): string {
    const token = randomBytes(32).toString("base64url");
    const payload: TokenFile = {
      tokenHash: this.hash(token),
      createdAt: new Date().toISOString()
    };
    writeFileSync(this.#path, `${JSON.stringify(payload, null, 2)}\n`, { mode: 0o600 });
    chmodSync(this.#path, 0o600);
    return token;
  }

  verify(token: string): boolean {
    if (!this.hasToken() || !token) {
      return false;
    }
    const payload = JSON.parse(readFileSync(this.#path, "utf8")) as TokenFile;
    const expected = Buffer.from(payload.tokenHash, "hex");
    const actual = Buffer.from(this.hash(token), "hex");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  private hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

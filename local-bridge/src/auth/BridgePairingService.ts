import { randomBytes } from "node:crypto";
import { BridgeTokenStore } from "./BridgeTokenStore";

type PairingSession = {
  readonly code: string;
  readonly expiresAt: number;
};

export class BridgePairingService {
  readonly #tokenStore: BridgeTokenStore;
  #session: PairingSession | null = null;

  constructor(tokenStore: BridgeTokenStore) {
    this.#tokenStore = tokenStore;
  }

  startPairing(): { code: string; expiresAt: string } {
    const code = String(100000 + Math.floor(Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000;
    this.#session = { code, expiresAt };
    return { code, expiresAt: new Date(expiresAt).toISOString() };
  }

  confirmPairing(code: string): { token: string } {
    if (!this.#session || this.#session.expiresAt < Date.now()) {
      throw new Error("Sessao de pareamento expirada");
    }
    if (this.#session.code !== code) {
      throw new Error("Codigo de pareamento invalido");
    }
    this.#session = null;
    return { token: this.#tokenStore.createToken() };
  }

  ensureDevelopmentToken(): string | null {
    if (this.#tokenStore.hasToken()) {
      return null;
    }
    return randomBytes(32).toString("base64url");
  }
}

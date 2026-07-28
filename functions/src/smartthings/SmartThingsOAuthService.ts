import { createHash, randomBytes } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { AppConfig } from "../config/AppConfig";
import { AppError } from "../domain/AppError";
import { SmartThingsTokenRepository } from "../repositories/SmartThingsTokenRepository";
import { AuditEventService } from "../services/AuditEventService";
import { CryptoService } from "../utils/CryptoService";
import { SmartThingsClient } from "./SmartThingsClient";
import { SmartThingsTokenResponse } from "./SmartThingsTypes";

export class SmartThingsOAuthService {
  readonly #repository: SmartThingsTokenRepository;
  readonly #client: SmartThingsClient;
  readonly #cryptoService: CryptoService;
  readonly #auditEventService: AuditEventService;

  constructor(
    repository: SmartThingsTokenRepository,
    client: SmartThingsClient,
    cryptoService: CryptoService,
    auditEventService: AuditEventService
  ) {
    this.#repository = repository;
    this.#client = client;
    this.#cryptoService = cryptoService;
    this.#auditEventService = auditEventService;
  }

  async createAuthorizationUrl(uid: string): Promise<{ authorizationUrl: string; expiresAt: string }> {
    const state = this.randomUrlSafe(32);
    const nonce = this.randomUrlSafe(16);
    const expiresAt = new Date(Date.now() + AppConfig.oauthStateTtlMs);
    const stateHash = this.hash(state);
    await this.#repository.saveOAuthState({
      uid,
      stateHash,
      nonce,
      expiresAt: Timestamp.fromDate(expiresAt)
    });
    const url = new URL(`${AppConfig.smartThingsBaseUrl}${AppConfig.smartThingsAuthorizePath}`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", AppConfig.smartThingsClientId());
    url.searchParams.set("redirect_uri", AppConfig.smartThingsRedirectUri());
    url.searchParams.set("scope", AppConfig.defaultScopes.join(" "));
    url.searchParams.set("state", state);
    return { authorizationUrl: url.toString(), expiresAt: expiresAt.toISOString() };
  }

  async handleCallback(code: string, state: string, correlationId: string): Promise<string> {
    const record = await this.#repository.consumeOAuthState(this.hash(state));
    if (!record) {
      throw new AppError("failed-precondition", "State OAuth invalido ou ja utilizado");
    }
    if (record.expiresAt.toMillis() < Date.now()) {
      throw new AppError("failed-precondition", "State OAuth expirado");
    }
    const tokens = await this.#client.exchangeCode(code);
    await this.saveTokens(record.uid, tokens);
    await this.#auditEventService.record(record.uid, {
      type: "smartthings_connected",
      status: "success",
      provider: "smartthings",
      correlationId
    });
    return record.uid;
  }

  async getValidAccessToken(uid: string): Promise<string> {
    const connection = await this.#repository.getConnection(uid);
    if (!connection || connection.status !== "active") {
      throw new AppError("failed-precondition", "SmartThings nao esta conectado");
    }
    if (connection.tokenExpiresAt.toMillis() > Date.now() + 60_000) {
      return this.#cryptoService.decrypt(connection.encryptedAccessToken);
    }
    if (!connection.encryptedRefreshToken) {
      throw new AppError("unauthenticated", "Token SmartThings expirado e sem refresh token");
    }
    const refreshToken = this.#cryptoService.decrypt(connection.encryptedRefreshToken);
    const tokens = await this.#client.refreshToken(refreshToken);
    await this.saveTokens(uid, tokens);
    return tokens.access_token;
  }

  async disconnect(uid: string): Promise<{ disconnected: true }> {
    await this.#repository.revokeConnection(uid);
    await this.#auditEventService.record(uid, {
      type: "smartthings_disconnected",
      status: "success",
      provider: "smartthings"
    });
    return { disconnected: true };
  }

  private async saveTokens(uid: string, tokens: SmartThingsTokenResponse): Promise<void> {
    if (!tokens.access_token) {
      throw new AppError("unavailable", "SmartThings nao retornou access token");
    }
    const expiresIn = typeof tokens.expires_in === "number" ? tokens.expires_in : 3600;
    await this.#repository.saveConnection(uid, {
      provider: "smartthings",
      encryptedAccessToken: this.#cryptoService.encrypt(tokens.access_token),
      encryptedRefreshToken: tokens.refresh_token ? this.#cryptoService.encrypt(tokens.refresh_token) : undefined,
      tokenExpiresAt: Timestamp.fromMillis(Date.now() + expiresIn * 1000),
      scopes: typeof tokens.scope === "string" ? tokens.scope.split(" ") : AppConfig.defaultScopes,
      status: "active",
      revokedAt: null
    });
  }

  private randomUrlSafe(bytes: number): string {
    return randomBytes(bytes).toString("base64url");
  }

  private hash(value: string): string {
    return createHash("sha256").update(value).digest("base64url");
  }
}

import { AppConfig } from "../config/AppConfig";
import { AppError } from "../domain/AppError";
import { HttpClient } from "../utils/HttpClient";
import { SmartThingsCommand, SmartThingsDevice, SmartThingsTokenResponse } from "./SmartThingsTypes";

export class SmartThingsClient {
  readonly #httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.#httpClient = httpClient;
  }

  async exchangeCode(code: string): Promise<SmartThingsTokenResponse> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: AppConfig.smartThingsRedirectUri()
    });
    return this.tokenRequest(body);
  }

  async refreshToken(refreshToken: string): Promise<SmartThingsTokenResponse> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    });
    return this.tokenRequest(body);
  }

  async listDevices(accessToken: string): Promise<SmartThingsDevice[]> {
    const response = await this.#httpClient.getJson<{ items?: SmartThingsDevice[] }>(
      `${AppConfig.smartThingsBaseUrl}/v1/devices`,
      this.authHeaders(accessToken)
    );
    if (response.status >= 400) {
      throw this.mapExternalError(response.status);
    }
    return response.data.items ?? [];
  }

  async getDevice(accessToken: string, deviceId: string): Promise<SmartThingsDevice> {
    const response = await this.#httpClient.getJson<SmartThingsDevice>(
      `${AppConfig.smartThingsBaseUrl}/v1/devices/${encodeURIComponent(deviceId)}`,
      this.authHeaders(accessToken)
    );
    if (response.status >= 400) {
      throw this.mapExternalError(response.status);
    }
    return response.data;
  }

  async getStatus(accessToken: string, deviceId: string): Promise<Record<string, unknown>> {
    const response = await this.#httpClient.getJson<Record<string, unknown>>(
      `${AppConfig.smartThingsBaseUrl}/v1/devices/${encodeURIComponent(deviceId)}/status`,
      this.authHeaders(accessToken)
    );
    if (response.status >= 400) {
      throw this.mapExternalError(response.status);
    }
    return response.data;
  }

  async executeCommand(accessToken: string, deviceId: string, command: SmartThingsCommand): Promise<{ accepted: true }> {
    const response = await this.#httpClient.postJson(
      `${AppConfig.smartThingsBaseUrl}/v1/devices/${encodeURIComponent(deviceId)}/commands`,
      { commands: [command] },
      this.authHeaders(accessToken)
    );
    if (response.status >= 400) {
      throw this.mapExternalError(response.status);
    }
    return { accepted: true };
  }

  private async tokenRequest(body: URLSearchParams): Promise<SmartThingsTokenResponse> {
    const credentials = Buffer.from(`${AppConfig.smartThingsClientId()}:${AppConfig.smartThingsClientSecret()}`).toString("base64");
    const response = await this.#httpClient.postForm<SmartThingsTokenResponse>(
      `${AppConfig.smartThingsBaseUrl}${AppConfig.smartThingsTokenPath}`,
      body,
      { Authorization: `Basic ${credentials}` }
    );
    if (response.status >= 400) {
      throw this.mapExternalError(response.status);
    }
    return response.data;
  }

  private authHeaders(accessToken: string): Record<string, string> {
    return { Authorization: `Bearer ${accessToken}` };
  }

  private mapExternalError(status: number): AppError {
    if (status === 401) {
      return new AppError("unauthenticated", "Conexao SmartThings expirada");
    }
    if (status === 403) {
      return new AppError("permission-denied", "SmartThings negou acesso ao dispositivo");
    }
    if (status === 404) {
      return new AppError("not-found", "Dispositivo SmartThings nao encontrado");
    }
    if (status === 429) {
      return new AppError("resource-exhausted", "Limite da SmartThings atingido");
    }
    return new AppError("unavailable", "SmartThings indisponivel no momento", { status });
  }
}

import { AppError } from "../domain/AppError";

export type HttpClientResponse<T> = {
  readonly status: number;
  readonly headers: Headers;
  readonly data: T;
};

export class HttpClient {
  readonly #timeoutMs: number;

  constructor(timeoutMs = 8000) {
    this.#timeoutMs = timeoutMs;
  }

  async getJson<T>(url: string, headers: Record<string, string>): Promise<HttpClientResponse<T>> {
    return this.requestJson<T>(url, { method: "GET", headers });
  }

  async postJson<T>(url: string, body: unknown, headers: Record<string, string>): Promise<HttpClientResponse<T>> {
    return this.requestJson<T>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=utf-8", ...headers },
      body: JSON.stringify(body)
    });
  }

  async postForm<T>(url: string, body: URLSearchParams, headers: Record<string, string>): Promise<HttpClientResponse<T>> {
    return this.requestJson<T>(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
      body
    });
  }

  private async requestJson<T>(url: string, init: RequestInit): Promise<HttpClientResponse<T>> {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "api.smartthings.com") {
      throw new AppError("invalid-argument", "Destino externo nao permitido");
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.#timeoutMs);
    try {
      const response = await fetch(parsed, { ...init, signal: controller.signal });
      const text = await response.text();
      const data = text ? JSON.parse(text) as T : ({} as T);
      return { status: response.status, headers: response.headers, data };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new AppError("unavailable", "Resposta externa invalida");
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError("unavailable", "Tempo limite ao chamar SmartThings");
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}

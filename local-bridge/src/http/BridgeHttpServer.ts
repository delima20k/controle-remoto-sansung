import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { AddressInfo } from "node:net";
import { WebSocketServer } from "ws";
import { BridgePairingService } from "../auth/BridgePairingService";
import { BridgeTokenStore } from "../auth/BridgeTokenStore";
import { BridgeConfigValues } from "../config/BridgeConfig";
import { BridgeCommandValidator } from "../domain/RemoteCommand";
import { LocalRemoteCommandService } from "../tv/LocalRemoteCommandService";
import { TvAdapter } from "../tv/TvAdapter";
import { LocalLogger } from "../utils/LocalLogger";
import { RateLimiter } from "../utils/RateLimiter";

export class BridgeHttpServer {
  readonly #config: BridgeConfigValues;
  readonly #pairingService: BridgePairingService;
  readonly #tokenStore: BridgeTokenStore;
  readonly #adapter: TvAdapter;
  readonly #commandService: LocalRemoteCommandService;
  readonly #logger: LocalLogger;
  readonly #rateLimiter = new RateLimiter(60_000, 120);
  readonly #server = createServer((request, response) => {
    this.handle(request, response).catch((error: unknown) => this.error(response, error));
  });

  constructor(config: BridgeConfigValues, pairingService: BridgePairingService, tokenStore: BridgeTokenStore, adapter: TvAdapter, logger: LocalLogger) {
    this.#config = config;
    this.#pairingService = pairingService;
    this.#tokenStore = tokenStore;
    this.#adapter = adapter;
    this.#commandService = new LocalRemoteCommandService(adapter);
    this.#logger = logger;
    this.configureWebSocket();
  }

  async start(): Promise<AddressInfo> {
    return new Promise((resolve) => {
      this.#server.listen(this.#config.port, this.#config.host, () => {
        const address = this.#server.address() as AddressInfo;
        this.#logger.info("Local Bridge iniciado", { host: address.address, port: address.port, adapter: this.#config.adapter });
        resolve(address);
      });
    });
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.#server.close((error) => error ? reject(error) : resolve());
    });
  }

  private async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    this.applyCors(request, response);
    if (request.method === "OPTIONS") {
      response.writeHead(204).end();
      return;
    }
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/healthz") {
      this.json(response, 200, { ok: true, name: this.#config.publicName });
      return;
    }
    if (request.method === "GET" && url.pathname === "/status") {
      this.assertAuthorized(request);
      this.json(response, 200, await this.#adapter.status());
      return;
    }
    if (request.method === "POST" && url.pathname === "/pairing/start") {
      this.#rateLimiter.assertAllowed(this.clientKey(request, "pairing-start"));
      this.json(response, 200, this.#pairingService.startPairing());
      return;
    }
    if (request.method === "POST" && url.pathname === "/pairing/confirm") {
      this.#rateLimiter.assertAllowed(this.clientKey(request, "pairing-confirm"));
      const body = await this.readJson(request);
      const code = typeof body.code === "string" ? body.code : "";
      this.json(response, 200, this.#pairingService.confirmPairing(code));
      return;
    }
    if (request.method === "POST" && url.pathname === "/command") {
      this.assertAuthorized(request);
      this.#rateLimiter.assertAllowed(this.clientKey(request, "command"));
      const command = BridgeCommandValidator.validate(await this.readJson(request));
      this.json(response, 200, await this.#commandService.send(command));
      return;
    }
    this.json(response, 404, { error: "Rota local nao encontrada" });
  }

  private configureWebSocket(): void {
    const wsServer = new WebSocketServer({ server: this.#server, path: "/ws" });
    wsServer.on("connection", (socket, request) => {
      try {
        const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
        const token = url.searchParams.get("token") ?? "";
        if (!this.#tokenStore.verify(token)) {
          socket.close(1008, "Token invalido");
          return;
        }
      } catch {
        socket.close(1008, "Token invalido");
        return;
      }
      socket.on("message", (raw) => {
        this.handleSocketMessage(socket, raw.toString()).catch((error: unknown) => {
          socket.send(JSON.stringify({ status: "error", message: error instanceof Error ? error.message : "Erro local" }));
        });
      });
    });
  }

  private async handleSocketMessage(socket: { send(data: string): void }, raw: string): Promise<void> {
    const parsed = JSON.parse(raw) as unknown;
    const command = BridgeCommandValidator.validate(parsed);
    const result = await this.#commandService.send(command);
    socket.send(JSON.stringify(result));
  }

  private assertAuthorized(request: IncomingMessage): void {
    const token = String(request.headers["x-bridge-token"] ?? "");
    if (!this.#tokenStore.verify(token)) {
      throw new Error("Token local invalido");
    }
  }

  private applyCors(request: IncomingMessage, response: ServerResponse): void {
    const origin = String(request.headers.origin ?? "");
    if (origin && this.#config.allowedOrigins.includes(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
    }
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Bridge-Token");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
  }

  private async readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of request) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size > 16_384) {
        throw new Error("Payload local grande demais");
      }
      chunks.push(buffer);
    }
    const text = Buffer.concat(chunks).toString("utf8");
    return text ? JSON.parse(text) as Record<string, unknown> : {};
  }

  private json(response: ServerResponse, status: number, payload: unknown): void {
    response.writeHead(status, { "Content-Type": "application/json;charset=utf-8" });
    response.end(JSON.stringify(payload));
  }

  private error(response: ServerResponse, error: unknown): void {
    this.#logger.warn("Erro tratado no Local Bridge", { error });
    this.json(response, 400, { error: error instanceof Error ? error.message : "Erro local" });
  }

  private clientKey(request: IncomingMessage, scope: string): string {
    return `${scope}:${request.socket.remoteAddress ?? "unknown"}`;
  }
}

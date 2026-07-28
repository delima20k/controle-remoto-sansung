import { BridgePairingService } from "./auth/BridgePairingService";
import { BridgeTokenStore } from "./auth/BridgeTokenStore";
import { BridgeConfig } from "./config/BridgeConfig";
import { BridgeHttpServer } from "./http/BridgeHttpServer";
import { TvAdapterFactory } from "./tv/TvAdapterFactory";
import { LocalLogger } from "./utils/LocalLogger";

export class LocalBridgeApp {
  readonly #logger = new LocalLogger();

  async start(): Promise<void> {
    const config = BridgeConfig.load();
    const tokenStore = new BridgeTokenStore(config.dataDir);
    const pairingService = new BridgePairingService(tokenStore);
    const adapter = TvAdapterFactory.create(config);
    const server = new BridgeHttpServer(config, pairingService, tokenStore, adapter, this.#logger);
    await server.start();
    if (!tokenStore.hasToken()) {
      this.#logger.warn("Nenhum token local existe. Inicie /pairing/start e confirme /pairing/confirm antes de enviar comandos.");
    }
    if (config.host === "0.0.0.0") {
      this.#logger.warn("Bridge exposto em todas as interfaces. Use firewall e rede privada confiavel.");
    }
  }
}

if (require.main === module) {
  new LocalBridgeApp().start().catch((error: unknown) => {
    const logger = new LocalLogger();
    logger.error("Falha ao iniciar Local Bridge", { error });
    process.exitCode = 1;
  });
}

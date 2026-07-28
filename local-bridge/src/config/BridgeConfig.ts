import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

export type BridgeAdapterName = "mock" | "samsung-local" | "smartthings";

export type BridgeConfigValues = {
  readonly host: string;
  readonly port: number;
  readonly allowedOrigins: string[];
  readonly pairingRequired: boolean;
  readonly adapter: BridgeAdapterName;
  readonly dataDir: string;
  readonly publicName: string;
  readonly samsungTvIp?: string;
  readonly samsungLocalEnabled: boolean;
};

export class BridgeConfig {
  static load(env: NodeJS.ProcessEnv = process.env): BridgeConfigValues {
    const dataDir = resolve(env.BRIDGE_DATA_DIR ?? "./data");
    mkdirSync(dataDir, { recursive: true });
    return {
      host: env.BRIDGE_HOST ?? "127.0.0.1",
      port: this.port(env.BRIDGE_PORT),
      allowedOrigins: (env.BRIDGE_ALLOWED_ORIGINS ?? "http://localhost:5000").split(",").map((origin) => origin.trim()).filter(Boolean),
      pairingRequired: env.BRIDGE_PAIRING_REQUIRED !== "false",
      adapter: this.adapter(env.BRIDGE_ADAPTER),
      dataDir,
      publicName: env.BRIDGE_PUBLIC_NAME ?? "Controle TV Local Bridge",
      samsungTvIp: env.SAMSUNG_TV_IP || undefined,
      samsungLocalEnabled: env.SAMSUNG_LOCAL_ENABLED === "true"
    };
  }

  private static port(raw: string | undefined): number {
    const parsed = Number(raw ?? "9443");
    if (!Number.isInteger(parsed) || parsed < 1024 || parsed > 65535) {
      throw new Error("BRIDGE_PORT deve estar entre 1024 e 65535");
    }
    return parsed;
  }

  private static adapter(raw: string | undefined): BridgeAdapterName {
    if (raw === "samsung-local" || raw === "smartthings" || raw === "mock") {
      return raw;
    }
    return "mock";
  }
}

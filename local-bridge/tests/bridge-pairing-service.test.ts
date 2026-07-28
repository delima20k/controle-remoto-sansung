import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BridgePairingService } from "../src/auth/BridgePairingService";
import { BridgeTokenStore } from "../src/auth/BridgeTokenStore";

describe("BridgePairingService", () => {
  it("deve gerar token apos confirmar codigo", () => {
    const dir = mkdtempSync(join(tmpdir(), "controle-tv-bridge-"));
    try {
      const store = new BridgeTokenStore(dir);
      const service = new BridgePairingService(store);
      const start = service.startPairing();
      const confirmed = service.confirmPairing(start.code);
      assert.equal(store.verify(confirmed.token), true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

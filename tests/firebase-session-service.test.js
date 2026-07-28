const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

describe("FirebaseSessionService", () => {
  it("deve iniciar uma sessao anonima e expor Functions na regiao configurada", async () => {
    const { FirebaseSessionService } = await FrontendTestImporter.import("services/FirebaseSessionService.js");
    const auth = {
      currentUser: null,
      signInAnonymously: async () => ({ user: { uid: "anonymous-user" } })
    };
    const functions = { httpsCallable: () => undefined };
    const app = {
      auth: () => auth,
      functions: (region) => {
        assert.equal(region, "southamerica-east1");
        return functions;
      }
    };
    const firebase = {
      apps: [],
      initializeApp: (config) => {
        assert.equal(config.projectId, "controle-remoto-56b6f");
        return app;
      }
    };

    const session = await new FirebaseSessionService(firebase).start();

    assert.equal(session.uid, "anonymous-user");
    assert.equal(session.functions, functions);
  });

  it("deve reutilizar a sessao anonima ja existente", async () => {
    const { FirebaseSessionService } = await FrontendTestImporter.import("services/FirebaseSessionService.js");
    const auth = {
      currentUser: { uid: "existing-user" },
      signInAnonymously: async () => {
        throw new Error("nao deveria criar uma nova sessao");
      }
    };
    const app = {
      auth: () => auth,
      functions: () => ({})
    };

    const session = await new FirebaseSessionService({ apps: [app] }).start();

    assert.equal(session.uid, "existing-user");
  });

  it("deve falhar com mensagem segura quando o SDK Web nao estiver disponivel", async () => {
    const { FirebaseSessionService } = await FrontendTestImporter.import("services/FirebaseSessionService.js");

    await assert.rejects(() => new FirebaseSessionService(null).start(), /SDK Web do Firebase indisponivel/);
  });
});

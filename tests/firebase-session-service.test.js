const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { FrontendTestImporter } = require("./frontend-test-importer");

describe("FirebaseSessionService", () => {
  it("deve ativar o App Check Enterprise antes de disponibilizar as Functions", async () => {
    const { FirebaseSessionService } = await FrontendTestImporter.import("services/FirebaseSessionService.js");
    const activations = [];
    const app = {
      auth: () => ({ currentUser: { uid: "anonymous-user" } }),
      functions: () => ({})
    };
    class ReCaptchaEnterpriseProvider {
      constructor(siteKey) {
        this.siteKey = siteKey;
      }
    }
    const appCheck = () => ({
      activate: (provider, autoRefresh) => activations.push({ provider, autoRefresh })
    });
    appCheck.ReCaptchaEnterpriseProvider = ReCaptchaEnterpriseProvider;
    const firebase = {
      apps: [app],
      appCheck
    };

    await new FirebaseSessionService(firebase).start();

    assert.equal(activations.length, 1);
    assert.equal(activations[0].provider.siteKey, "6LdMjWotAAAAAKJSoMJxkKzLw27BOgB3Xy4s-EDq");
    assert.equal(activations[0].autoRefresh, true);
  });

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
      },
      appCheck: Object.assign(() => ({ activate: () => undefined }), {
        ReCaptchaEnterpriseProvider: class {}
      })
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

    const firebase = {
      apps: [app],
      appCheck: Object.assign(() => ({ activate: () => undefined }), {
        ReCaptchaEnterpriseProvider: class {}
      })
    };
    const session = await new FirebaseSessionService(firebase).start();

    assert.equal(session.uid, "existing-user");
  });

  it("deve falhar com mensagem segura quando o SDK Web nao estiver disponivel", async () => {
    const { FirebaseSessionService } = await FrontendTestImporter.import("services/FirebaseSessionService.js");

    await assert.rejects(() => new FirebaseSessionService(null).start(), /SDK Web do Firebase indisponivel/);
  });
});

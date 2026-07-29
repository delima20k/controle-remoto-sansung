import { FirebaseWebConfig } from "../config/FirebaseWebConfig.js";

export class FirebaseSessionService {
  #firebase;
  #config;
  #appCheckSiteKey;

  constructor(
    firebaseSdk = globalThis.firebase,
    config = FirebaseWebConfig.values(),
    appCheckSiteKey = FirebaseWebConfig.appCheckSiteKey()
  ) {
    this.#firebase = firebaseSdk;
    this.#config = config;
    this.#appCheckSiteKey = appCheckSiteKey;
  }

  async start() {
    if (!this.#firebase) {
      throw new Error("SDK Web do Firebase indisponivel.");
    }
    const existingApp = this.#firebase.apps?.[0];
    if (!existingApp && !this.#firebase.initializeApp) {
      throw new Error("SDK Web do Firebase indisponivel.");
    }
    const app = existingApp ?? this.#firebase.initializeApp(this.#config);
    if (!app?.auth || !app?.functions || !this.#firebase.appCheck) {
      throw new Error("SDKs Authentication, Functions e App Check do Firebase sao obrigatorios.");
    }
    this.#activateAppCheck();
    const auth = app.auth();
    const user = auth.currentUser ?? (await auth.signInAnonymously()).user;
    if (!user?.uid) {
      throw new Error("Nao foi possivel iniciar a sessao anonima.");
    }
    return {
      uid: user.uid,
      functions: app.functions(FirebaseWebConfig.functionsRegion())
    };
  }

  #activateAppCheck() {
    const provider = this.#firebase.appCheck?.ReCaptchaEnterpriseProvider;
    const appCheck = this.#firebase.appCheck?.();
    if (!provider || !appCheck?.activate || !this.#appCheckSiteKey) {
      throw new Error("SDK App Check do Firebase indisponivel.");
    }
    appCheck.activate(new provider(this.#appCheckSiteKey), true);
  }
}

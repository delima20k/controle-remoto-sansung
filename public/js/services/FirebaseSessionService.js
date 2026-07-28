import { FirebaseWebConfig } from "../config/FirebaseWebConfig.js";

export class FirebaseSessionService {
  #firebase;
  #config;

  constructor(firebaseSdk = globalThis.firebase, config = FirebaseWebConfig.values()) {
    this.#firebase = firebaseSdk;
    this.#config = config;
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
    if (!app?.auth || !app?.functions) {
      throw new Error("SDKs Authentication e Functions do Firebase sao obrigatorios.");
    }
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
}

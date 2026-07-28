export class FirebaseWebConfig {
  static #CONFIG = Object.freeze({
    apiKey: "AIzaSyB5E8awYRXTEwGtVJyUydYOyJFNMlZi2zE",
    authDomain: "controle-remoto-56b6f.firebaseapp.com",
    projectId: "controle-remoto-56b6f",
    storageBucket: "controle-remoto-56b6f.firebasestorage.app",
    messagingSenderId: "950418092622",
    appId: "1:950418092622:web:8efef2d98695763b78891f"
  });

  static values() {
    return FirebaseWebConfig.#CONFIG;
  }

  static functionsRegion() {
    return "southamerica-east1";
  }
}

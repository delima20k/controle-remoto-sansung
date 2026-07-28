import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export class AdminApp {
  static init(): void {
    if (getApps().length === 0) {
      initializeApp();
    }
  }

  static firestore() {
    AdminApp.init();
    return getFirestore();
  }

  static auth() {
    AdminApp.init();
    return getAuth();
  }
}

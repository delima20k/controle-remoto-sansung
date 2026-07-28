import { FieldValue, Firestore, Timestamp } from "firebase-admin/firestore";
import { EncryptedValue } from "../utils/CryptoService";

export type SmartThingsConnectionRecord = {
  readonly provider: "smartthings";
  readonly encryptedAccessToken: EncryptedValue;
  readonly encryptedRefreshToken?: EncryptedValue;
  readonly tokenExpiresAt: Timestamp;
  readonly scopes: string[];
  readonly status: "active" | "revoked";
  readonly updatedAt?: FirebaseFirestore.FieldValue;
  readonly createdAt?: FirebaseFirestore.FieldValue;
  readonly revokedAt?: FirebaseFirestore.FieldValue | null;
};

export type OAuthStateRecord = {
  readonly uid: string;
  readonly stateHash: string;
  readonly nonce: string;
  readonly expiresAt: Timestamp;
  readonly createdAt?: FirebaseFirestore.FieldValue;
};

export class SmartThingsTokenRepository {
  readonly #db: Firestore;

  constructor(db: Firestore) {
    this.#db = db;
  }

  async saveOAuthState(record: OAuthStateRecord): Promise<void> {
    await this.#db.collection("oauthStates").doc(record.stateHash).set({
      ...record,
      createdAt: FieldValue.serverTimestamp()
    });
  }

  async consumeOAuthState(stateHash: string): Promise<OAuthStateRecord | null> {
    const ref = this.#db.collection("oauthStates").doc(stateHash);
    return this.#db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) {
        return null;
      }
      const data = snapshot.data() as OAuthStateRecord;
      transaction.delete(ref);
      return data;
    });
  }

  async saveConnection(uid: string, record: SmartThingsConnectionRecord): Promise<void> {
    await this.#db.collection("users").doc(uid).collection("smartThingsConnections").doc("default").set({
      ...record,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  }

  async getConnection(uid: string): Promise<SmartThingsConnectionRecord | null> {
    const snapshot = await this.#db.collection("users").doc(uid).collection("smartThingsConnections").doc("default").get();
    return snapshot.exists ? snapshot.data() as SmartThingsConnectionRecord : null;
  }

  async revokeConnection(uid: string): Promise<void> {
    await this.#db.collection("users").doc(uid).collection("smartThingsConnections").doc("default").set({
      status: "revoked",
      revokedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  }

  async deleteExpiredOAuthStates(now: Date): Promise<number> {
    const snapshot = await this.#db.collection("oauthStates")
      .where("expiresAt", "<", Timestamp.fromDate(now))
      .limit(200)
      .get();
    if (snapshot.empty) {
      return 0;
    }
    const batch = this.#db.batch();
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    return snapshot.size;
  }
}

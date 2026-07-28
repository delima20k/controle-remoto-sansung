import { FieldValue, Firestore } from "firebase-admin/firestore";

export type UserProfile = {
  readonly uid: string;
  readonly displayName: string | null;
  readonly emailNormalized: string;
  readonly emailVerified: boolean;
  readonly createdAt?: FirebaseFirestore.FieldValue;
  readonly updatedAt?: FirebaseFirestore.FieldValue;
  readonly deletedAt?: FirebaseFirestore.Timestamp | null;
};

export type UserPreferences = {
  readonly ownerUid: string;
  readonly theme: "light" | "dark" | "system";
  readonly highContrast: boolean;
  readonly hapticsEnabled: boolean;
  readonly defaultControlMode: "smartthings" | "localBridge";
  readonly selectedDeviceId?: string;
  readonly language: "pt-BR";
  readonly updatedAt?: FirebaseFirestore.FieldValue;
};

export class UserRepository {
  readonly #db: Firestore;

  constructor(db: Firestore) {
    this.#db = db;
  }

  async upsertProfile(profile: Omit<UserProfile, "createdAt" | "updatedAt">): Promise<void> {
    await this.#db.collection("users").doc(profile.uid).set({
      ...profile,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  }

  async getProfile(uid: string): Promise<FirebaseFirestore.DocumentData | null> {
    const snapshot = await this.#db.collection("users").doc(uid).get();
    return snapshot.exists ? snapshot.data() ?? null : null;
  }

  async updatePreferences(uid: string, preferences: Omit<UserPreferences, "ownerUid" | "updatedAt">): Promise<UserPreferences> {
    const payload: UserPreferences = {
      ownerUid: uid,
      ...preferences,
      updatedAt: FieldValue.serverTimestamp()
    };
    const firestorePayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    await this.#db.collection("users").doc(uid).collection("preferences").doc("default").set(firestorePayload, { merge: true });
    return payload;
  }

  async deleteUserData(uid: string): Promise<void> {
    const userRef = this.#db.collection("users").doc(uid);
    const collections = ["devices", "favoriteCommands", "auditEvents"];
    for (const collection of collections) {
      let snapshot = await userRef.collection(collection).limit(100).get();
      while (!snapshot.empty) {
      const batch = this.#db.batch();
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
      }
      await batch.commit();
        snapshot = await userRef.collection(collection).limit(100).get();
      }
    }
    await userRef.collection("preferences").doc("default").delete().catch(() => undefined);
    await userRef.collection("smartThingsConnections").doc("default").delete().catch(() => undefined);
    await userRef.set({
      deletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  }
}

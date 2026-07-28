import { FieldValue, Firestore } from "firebase-admin/firestore";

export type AuditEvent = {
  readonly type: string;
  readonly deviceId?: string;
  readonly command?: string;
  readonly status: string;
  readonly provider?: string;
  readonly correlationId?: string;
};

export class AuditEventRepository {
  readonly #db: Firestore;

  constructor(db: Firestore) {
    this.#db = db;
  }

  async write(uid: string, event: AuditEvent): Promise<void> {
    await this.#db.collection("users").doc(uid).collection("auditEvents").add({
      ...event,
      createdAt: FieldValue.serverTimestamp()
    });
  }
}

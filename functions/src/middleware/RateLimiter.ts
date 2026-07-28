import { FieldValue, Firestore } from "firebase-admin/firestore";
import { AppError } from "../domain/AppError";

export class RateLimiter {
  readonly #db: Firestore;
  readonly #windowMs: number;
  readonly #maxRequests: number;

  constructor(db: Firestore, windowMs: number, maxRequests: number) {
    this.#db = db;
    this.#windowMs = windowMs;
    this.#maxRequests = maxRequests;
  }

  async assertAllowed(key: string): Promise<void> {
    const safeKey = Buffer.from(key).toString("base64url");
    const ref = this.#db.collection("rateLimits").doc(safeKey);
    const now = Date.now();
    await this.#db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const data = snapshot.exists ? snapshot.data() as { count?: number; resetAt?: number } : {};
      const resetAt = typeof data.resetAt === "number" ? data.resetAt : 0;
      const count = resetAt > now && typeof data.count === "number" ? data.count : 0;
      if (count >= this.#maxRequests) {
        throw new AppError("resource-exhausted", "Muitas tentativas. Aguarde alguns instantes.");
      }
      transaction.set(ref, {
        count: count + 1,
        resetAt: now + this.#windowMs,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    });
  }
}

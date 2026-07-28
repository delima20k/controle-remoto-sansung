import { FieldValue, Firestore } from "firebase-admin/firestore";

export type TvDeviceRecord = {
  readonly provider: "smartthings";
  readonly providerDeviceId: string;
  readonly label: string;
  readonly manufacturerName?: string;
  readonly deviceManufacturerCode?: string;
  readonly modelName?: string;
  readonly deviceModel?: string;
  readonly presentationId?: string;
  readonly locationId?: string;
  readonly roomId?: string;
  readonly type?: string;
  readonly deviceProfile?: Record<string, unknown>;
  readonly capabilities: string[];
  readonly lastKnownState: Record<string, unknown>;
  readonly updatedAt?: FirebaseFirestore.FieldValue;
  readonly createdAt?: FirebaseFirestore.FieldValue;
};

export class TvDeviceRepository {
  readonly #db: Firestore;

  constructor(db: Firestore) {
    this.#db = db;
  }

  async saveSmartThingsDevices(uid: string, devices: TvDeviceRecord[]): Promise<TvDeviceRecord[]> {
    const batch = this.#db.batch();
    const collection = this.#db.collection("users").doc(uid).collection("devices");
    for (const device of devices) {
      const ref = collection.doc(device.providerDeviceId);
      batch.set(ref, {
        ...device,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
    await batch.commit();
    return devices;
  }

  async get(uid: string, deviceId: string): Promise<TvDeviceRecord | null> {
    const snapshot = await this.#db.collection("users").doc(uid).collection("devices").doc(deviceId).get();
    return snapshot.exists ? snapshot.data() as TvDeviceRecord : null;
  }
}

import { UserRepository } from "../repositories/UserRepository";

export type AuthProfileClaims = {
  readonly uid: string;
  readonly name?: unknown;
  readonly email?: unknown;
  readonly email_verified?: unknown;
};

export class UserProfileService {
  readonly #repository: UserRepository;

  constructor(repository: UserRepository) {
    this.#repository = repository;
  }

  async getOrCreate(decoded: AuthProfileClaims): Promise<Record<string, unknown>> {
    const email = typeof decoded.email === "string" ? decoded.email.toLowerCase() : "";
    await this.#repository.upsertProfile({
      uid: decoded.uid,
      displayName: typeof decoded.name === "string" ? decoded.name : null,
      emailNormalized: email,
      emailVerified: decoded.email_verified === true,
      deletedAt: null
    });
    return await this.#repository.getProfile(decoded.uid) ?? { uid: decoded.uid };
  }
}

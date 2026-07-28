import { UserPreferences, UserRepository } from "../repositories/UserRepository";

export class UserPreferencesService {
  readonly #repository: UserRepository;

  constructor(repository: UserRepository) {
    this.#repository = repository;
  }

  async update(uid: string, preferences: Omit<UserPreferences, "ownerUid" | "updatedAt">): Promise<UserPreferences> {
    return this.#repository.updatePreferences(uid, preferences);
  }
}

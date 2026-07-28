import { Auth } from "firebase-admin/auth";
import { UserRepository } from "../repositories/UserRepository";
import { SmartThingsOAuthService } from "../smartthings/SmartThingsOAuthService";

export class UserDeletionService {
  readonly #auth: Auth;
  readonly #repository: UserRepository;
  readonly #smartThingsOAuthService: SmartThingsOAuthService;

  constructor(auth: Auth, repository: UserRepository, smartThingsOAuthService: SmartThingsOAuthService) {
    this.#auth = auth;
    this.#repository = repository;
    this.#smartThingsOAuthService = smartThingsOAuthService;
  }

  async delete(uid: string): Promise<{ deleted: true }> {
    await this.#smartThingsOAuthService.disconnect(uid);
    await this.#repository.deleteUserData(uid);
    await this.#auth.revokeRefreshTokens(uid);
    await this.#auth.deleteUser(uid).catch((error: unknown) => {
      if (error && typeof error === "object" && "code" in error && error.code === "auth/user-not-found") {
        return;
      }
      throw error;
    });
    return { deleted: true };
  }
}

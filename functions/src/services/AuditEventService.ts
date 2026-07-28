import { AuditEvent, AuditEventRepository } from "../repositories/AuditEventRepository";

export class AuditEventService {
  readonly #repository: AuditEventRepository;

  constructor(repository: AuditEventRepository) {
    this.#repository = repository;
  }

  async record(uid: string, event: AuditEvent): Promise<void> {
    await this.#repository.write(uid, event);
  }
}

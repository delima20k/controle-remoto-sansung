import { randomUUID } from "node:crypto";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { AppError } from "../domain/AppError";
import { SecureLogger } from "../utils/SecureLogger";

export type AuthContext = {
  readonly uid: string;
  readonly correlationId: string;
};

export class CallableGuard {
  static requireAuth(request: CallableRequest<unknown>): AuthContext {
    if (!request.auth?.uid) {
      throw new AppError("unauthenticated", "Autenticacao obrigatoria");
    }
    return {
      uid: request.auth.uid,
      correlationId: this.correlationId(request)
    };
  }

  static toHttpsError(error: unknown, correlationId: string): HttpsError {
    if (error instanceof HttpsError) {
      return error;
    }
    if (error instanceof AppError) {
      SecureLogger.warn("Erro controlado em callable", { correlationId, code: error.code, details: error.details });
      return new HttpsError(error.code, error.publicMessage, { correlationId, ...error.details });
    }
    SecureLogger.error("Erro inesperado em callable", { correlationId, error });
    return new HttpsError("internal", "Erro interno ao processar a solicitacao", { correlationId });
  }

  private static correlationId(request: CallableRequest<unknown>): string {
    const raw = request.rawRequest.header("x-correlation-id");
    return raw && /^[a-zA-Z0-9._:-]{8,80}$/.test(raw) ? raw : randomUUID();
  }
}

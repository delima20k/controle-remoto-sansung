import { randomUUID } from "node:crypto";
import { setGlobalOptions } from "firebase-functions/v2";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, onRequest } from "firebase-functions/v2/https";
import { AppConfig } from "./config/AppConfig";
import {
  SMARTTHINGS_CLIENT_ID,
  SMARTTHINGS_CLIENT_SECRET,
  SMARTTHINGS_REDIRECT_URI,
  TOKEN_ENCRYPTION_KEY
} from "./config/FunctionSecrets";
import { RemoteCommandCatalog } from "./domain/RemoteCommand";
import { AdminApp } from "./firebase/AdminApp";
import { FunctionFactory } from "./FunctionFactory";
import { CallableGuard } from "./middleware/CallableGuard";
import { SmartThingsTokenRepository } from "./repositories/SmartThingsTokenRepository";
import { DeviceIdSchema, EmptySchema, NaturalLanguageSchema, PreferencesSchema, SendCommandSchema } from "./schemas/RequestSchemas";
import { SchemaValidator } from "./utils/SchemaValidator";

setGlobalOptions({
  region: "southamerica-east1",
  timeoutSeconds: 30,
  memory: "256MiB",
  maxInstances: 10
});

const smartThingsSecrets = [
  SMARTTHINGS_CLIENT_ID,
  SMARTTHINGS_CLIENT_SECRET,
  SMARTTHINGS_REDIRECT_URI,
  TOKEN_ENCRYPTION_KEY
];

export const createSmartThingsAuthorizationUrl = onCall(
  { enforceAppCheck: true, secrets: smartThingsSecrets },
  async (request) => {
    const context = CallableGuard.requireAuth(request);
    try {
      SchemaValidator.parse(EmptySchema, request.data ?? {});
      const services = FunctionFactory.build();
      await services.rateLimiter.assertAllowed(`oauth-start:${context.uid}`);
      return await services.smartThingsOAuthService.createAuthorizationUrl(context.uid);
    } catch (error) {
      throw CallableGuard.toHttpsError(error, context.correlationId);
    }
  }
);

export const smartThingsOAuthCallback = onRequest(
  { secrets: smartThingsSecrets, timeoutSeconds: 30 },
  async (request, response) => {
    const correlationId = randomUUID();
    try {
      if (request.method !== "GET") {
        response.status(405).send("Metodo nao permitido");
        return;
      }
      const code = String(request.query.code ?? "");
      const state = String(request.query.state ?? "");
      if (!code || !state) {
        response.redirect(`${AppConfig.errorRedirectUrl()}?reason=missing_oauth_params`);
        return;
      }
      const services = FunctionFactory.build();
      await services.smartThingsOAuthService.handleCallback(code, state, correlationId);
      response.redirect(`${AppConfig.successRedirectUrl()}?provider=smartthings`);
    } catch (error) {
      response.redirect(`${AppConfig.errorRedirectUrl()}?reason=smartthings_oauth_failed&correlationId=${encodeURIComponent(correlationId)}`);
    }
  }
);

export const smartThingsWebhook = onRequest(
  { timeoutSeconds: 15 },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Metodo nao permitido");
      return;
    }
    try {
      await FunctionFactory.build().smartThingsWebhookConfirmationService.handle(request.body ?? {});
      response.status(204).send();
    } catch {
      response.status(400).send("Requisicao SmartThings invalida");
    }
  }
);

export const disconnectSmartThings = onCall(
  { enforceAppCheck: true, secrets: smartThingsSecrets },
  async (request) => {
    const context = CallableGuard.requireAuth(request);
    try {
      SchemaValidator.parse(EmptySchema, request.data ?? {});
      const services = FunctionFactory.build();
      await services.rateLimiter.assertAllowed(`disconnect:${context.uid}`);
      return await services.smartThingsOAuthService.disconnect(context.uid);
    } catch (error) {
      throw CallableGuard.toHttpsError(error, context.correlationId);
    }
  }
);

export const listSmartThingsDevices = onCall(
  { enforceAppCheck: true, secrets: smartThingsSecrets },
  async (request) => {
    const context = CallableGuard.requireAuth(request);
    try {
      SchemaValidator.parse(EmptySchema, request.data ?? {});
      const services = FunctionFactory.build();
      await services.rateLimiter.assertAllowed(`list-devices:${context.uid}`);
      return { devices: await services.smartThingsDeviceService.listCompatibleDevices(context.uid) };
    } catch (error) {
      throw CallableGuard.toHttpsError(error, context.correlationId);
    }
  }
);

export const getSmartThingsDeviceStatus = onCall(
  { enforceAppCheck: true, secrets: smartThingsSecrets },
  async (request) => {
    const context = CallableGuard.requireAuth(request);
    try {
      const input = SchemaValidator.parse(DeviceIdSchema, request.data);
      const services = FunctionFactory.build();
      await services.rateLimiter.assertAllowed(`status:${context.uid}:${input.deviceId}`);
      return await services.smartThingsDeviceService.getDeviceStatus(context.uid, input.deviceId);
    } catch (error) {
      throw CallableGuard.toHttpsError(error, context.correlationId);
    }
  }
);

export const sendSmartThingsCommand = onCall(
  { enforceAppCheck: true, secrets: smartThingsSecrets },
  async (request) => {
    const context = CallableGuard.requireAuth(request);
    try {
      const input = SchemaValidator.parse(SendCommandSchema, request.data);
      RemoteCommandCatalog.validateParameters(input.command, input.parameters);
      const services = FunctionFactory.build();
      await services.rateLimiter.assertAllowed(`command:${context.uid}:${input.deviceId}`);
      return await services.smartThingsCommandService.send(context.uid, input.deviceId, input.command, input.parameters, context.correlationId);
    } catch (error) {
      throw CallableGuard.toHttpsError(error, context.correlationId);
    }
  }
);

export const getUserProfile = onCall(
  { enforceAppCheck: true },
  async (request) => {
    const context = CallableGuard.requireAuth(request);
    try {
      SchemaValidator.parse(EmptySchema, request.data ?? {});
      const services = FunctionFactory.build();
      const authToken = request.auth?.token;
      return await services.userProfileService.getOrCreate({
        uid: context.uid,
        name: authToken?.name,
        email: authToken?.email,
        email_verified: authToken?.email_verified
      });
    } catch (error) {
      throw CallableGuard.toHttpsError(error, context.correlationId);
    }
  }
);

export const updateUserPreferences = onCall(
  { enforceAppCheck: true },
  async (request) => {
    const context = CallableGuard.requireAuth(request);
    try {
      const input = SchemaValidator.parse(PreferencesSchema, request.data);
      const services = FunctionFactory.build();
      return await services.userPreferencesService.update(context.uid, input);
    } catch (error) {
      throw CallableGuard.toHttpsError(error, context.correlationId);
    }
  }
);

export const deleteUserAccountData = onCall(
  { enforceAppCheck: true, secrets: smartThingsSecrets },
  async (request) => {
    const context = CallableGuard.requireAuth(request);
    try {
      SchemaValidator.parse(EmptySchema, request.data ?? {});
      const services = FunctionFactory.build();
      await services.rateLimiter.assertAllowed(`delete-account:${context.uid}`);
      return await services.userDeletionService.delete(context.uid);
    } catch (error) {
      throw CallableGuard.toHttpsError(error, context.correlationId);
    }
  }
);

export const parseNaturalLanguageCommand = onCall(
  { enforceAppCheck: true },
  async (request) => {
    const context = CallableGuard.requireAuth(request);
    try {
      const input = SchemaValidator.parse(NaturalLanguageSchema, request.data);
      const services = FunctionFactory.build();
      await services.rateLimiter.assertAllowed(`ai:${context.uid}`);
      return services.naturalLanguageCommandService.parse(input.phrase);
    } catch (error) {
      throw CallableGuard.toHttpsError(error, context.correlationId);
    }
  }
);

export const cleanupExpiredOAuthStates = onSchedule(
  { schedule: "every 30 minutes" },
  async () => {
    const repository = new SmartThingsTokenRepository(AdminApp.firestore());
    await repository.deleteExpiredOAuthStates(new Date());
  }
);

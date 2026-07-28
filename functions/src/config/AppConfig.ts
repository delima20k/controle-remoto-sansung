import {
  AI_COMMANDS_ENABLED,
  ALLOWED_ORIGINS,
  APP_ERROR_REDIRECT_URL,
  APP_SUCCESS_REDIRECT_URL,
  SMARTTHINGS_CLIENT_ID,
  SMARTTHINGS_CLIENT_SECRET,
  SMARTTHINGS_REDIRECT_URI,
  TOKEN_ENCRYPTION_KEY
} from "./FunctionSecrets";

export class AppConfig {
  static readonly smartThingsBaseUrl = "https://api.smartthings.com";
  static readonly smartThingsAuthorizePath = "/v1/oauth/authorize";
  static readonly smartThingsTokenPath = "/v1/oauth/token";
  static readonly defaultScopes = ["r:devices:$", "x:devices:$"];
  static readonly oauthStateTtlMs = 10 * 60 * 1000;

  static allowedOrigins(): string[] {
    return ALLOWED_ORIGINS.value().split(",").map((origin) => origin.trim()).filter(Boolean);
  }

  static successRedirectUrl(): string {
    return APP_SUCCESS_REDIRECT_URL.value();
  }

  static errorRedirectUrl(): string {
    return APP_ERROR_REDIRECT_URL.value();
  }

  static smartThingsClientId(): string {
    return SMARTTHINGS_CLIENT_ID.value();
  }

  static smartThingsClientSecret(): string {
    return SMARTTHINGS_CLIENT_SECRET.value();
  }

  static smartThingsRedirectUri(): string {
    return SMARTTHINGS_REDIRECT_URI.value();
  }

  static tokenEncryptionKey(): string {
    return TOKEN_ENCRYPTION_KEY.value();
  }

  static aiCommandsEnabled(): boolean {
    return AI_COMMANDS_ENABLED.value() === "true";
  }
}

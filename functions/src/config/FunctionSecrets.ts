import { defineSecret, defineString } from "firebase-functions/params";

export const SMARTTHINGS_CLIENT_ID = defineSecret("SMARTTHINGS_CLIENT_ID");
export const SMARTTHINGS_CLIENT_SECRET = defineSecret("SMARTTHINGS_CLIENT_SECRET");
export const SMARTTHINGS_REDIRECT_URI = defineSecret("SMARTTHINGS_REDIRECT_URI");
export const TOKEN_ENCRYPTION_KEY = defineSecret("TOKEN_ENCRYPTION_KEY");
export const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const REGION = defineString("FUNCTION_REGION", { default: "southamerica-east1" });
export const ALLOWED_ORIGINS = defineString("ALLOWED_ORIGINS", { default: "http://localhost:5000" });
export const APP_SUCCESS_REDIRECT_URL = defineString("APP_SUCCESS_REDIRECT_URL", { default: "http://localhost:5000/#/smartthings/success" });
export const APP_ERROR_REDIRECT_URL = defineString("APP_ERROR_REDIRECT_URL", { default: "http://localhost:5000/#/smartthings/error" });
export const AI_COMMANDS_ENABLED = defineString("AI_COMMANDS_ENABLED", { default: "false" });

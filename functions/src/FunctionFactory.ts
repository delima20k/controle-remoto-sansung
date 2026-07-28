import { AdminApp } from "./firebase/AdminApp";
import { AuditEventRepository } from "./repositories/AuditEventRepository";
import { SmartThingsTokenRepository } from "./repositories/SmartThingsTokenRepository";
import { TvDeviceRepository } from "./repositories/TvDeviceRepository";
import { UserRepository } from "./repositories/UserRepository";
import { AuditEventService } from "./services/AuditEventService";
import { UserDeletionService } from "./services/UserDeletionService";
import { UserPreferencesService } from "./services/UserPreferencesService";
import { UserProfileService } from "./services/UserProfileService";
import { SmartThingsCapabilityResolver } from "./smartthings/SmartThingsCapabilityResolver";
import { SmartThingsClient } from "./smartthings/SmartThingsClient";
import { SmartThingsCommandService } from "./smartthings/SmartThingsCommandService";
import { SmartThingsDeviceService } from "./smartthings/SmartThingsDeviceService";
import { SmartThingsOAuthService } from "./smartthings/SmartThingsOAuthService";
import { SamsungCu7700Profile } from "./smartthings/SamsungCu7700Profile";
import { CryptoService } from "./utils/CryptoService";
import { HttpClient } from "./utils/HttpClient";
import { RateLimiter } from "./middleware/RateLimiter";
import { AppConfig } from "./config/AppConfig";
import { NaturalLanguageCommandService } from "./ai/NaturalLanguageCommandService";

export class FunctionFactory {
  static build() {
    const db = AdminApp.firestore();
    const auth = AdminApp.auth();
    const userRepository = new UserRepository(db);
    const auditEventRepository = new AuditEventRepository(db);
    const auditEventService = new AuditEventService(auditEventRepository);
    const tokenRepository = new SmartThingsTokenRepository(db);
    const cryptoService = new CryptoService(AppConfig.tokenEncryptionKey());
    const httpClient = new HttpClient();
    const smartThingsClient = new SmartThingsClient(httpClient);
    const resolver = new SmartThingsCapabilityResolver();
    const oauthService = new SmartThingsOAuthService(tokenRepository, smartThingsClient, cryptoService, auditEventService);
    const tvDeviceRepository = new TvDeviceRepository(db);
    const deviceService = new SmartThingsDeviceService(oauthService, smartThingsClient, resolver, tvDeviceRepository, new SamsungCu7700Profile());
    const commandService = new SmartThingsCommandService(oauthService, deviceService, smartThingsClient, resolver, auditEventService);
    return {
      auth,
      userProfileService: new UserProfileService(userRepository),
      userPreferencesService: new UserPreferencesService(userRepository),
      userDeletionService: new UserDeletionService(auth, userRepository, oauthService),
      smartThingsOAuthService: oauthService,
      smartThingsDeviceService: deviceService,
      smartThingsCommandService: commandService,
      naturalLanguageCommandService: new NaturalLanguageCommandService(),
      rateLimiter: new RateLimiter(db, 60_000, 60)
    };
  }
}

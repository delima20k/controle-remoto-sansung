# CLASS REGISTRY

| Nome | Arquivo | Camada DDD | Responsabilidade | Reutilizavel em |
|---|---|---|---|---|
| AdapterFactory | public/js/services/AdapterFactory.js | infra | Escolhe o adapter remoto disponivel entre SmartThings, Local Bridge e Mock. | Front-end PWA |
| AdminApp | functions/src/firebase/AdminApp.ts | infra | Inicializa e fornece Auth/Firestore Admin SDK. | Functions |
| AppConfig | functions/src/config/AppConfig.ts | infra | Centraliza configuracao de ambiente e SmartThings. | Functions |
| AppError | functions/src/domain/AppError.ts | domain | Erro tipado com codigo publico seguro. | Functions |
| AppsBottomSheet | public/js/components/AppsBottomSheet.js | ui | Exibe grade de apps de streaming acionaveis via OPEN_APP. | Front-end PWA |
| AuditEventRepository | functions/src/repositories/AuditEventRepository.ts | infra | Persiste eventos de auditoria sanitizados por usuario. | Functions |
| AuditEventService | functions/src/services/AuditEventService.ts | application | Registra eventos relevantes de seguranca/integracao. | Functions |
| BaseSheet | public/js/components/BaseSheet.js | ui | Fornece estrutura reutilizavel de bottom sheet acessivel. | Front-end PWA |
| BridgeCommandValidator | local-bridge/src/domain/RemoteCommand.ts | domain | Valida comandos abstratos aceitos pelo Local Bridge. | Local Bridge |
| BridgeConfig | local-bridge/src/config/BridgeConfig.ts | infra | Carrega e valida configuracao local do bridge. | Local Bridge |
| BridgeHttpServer | local-bridge/src/http/BridgeHttpServer.ts | infra | Expoe HTTP/WebSocket local com CORS, auth e rate limit. | Local Bridge |
| BridgePairingService | local-bridge/src/auth/BridgePairingService.ts | application | Controla inicio e confirmacao de pareamento local. | Local Bridge |
| BridgeTokenStore | local-bridge/src/auth/BridgeTokenStore.ts | infra | Armazena hash do token local em arquivo protegido. | Local Bridge |
| CallableGuard | functions/src/middleware/CallableGuard.ts | infra | Valida Auth callable e converte erros para HttpsError. | Functions |
| ChannelRail | public/js/components/ChannelRail.js | ui | Renderiza controle lateral de canal com repeticao segura. | Front-end PWA |
| CommandAvailabilityService | public/js/services/CommandAvailabilityService.js | application | Resolve disponibilidade e metodo de cada comando pelo perfil confirmado. | Front-end PWA |
| ControleTvEntrypoint | public/js/app.js | application | Inicializa o app PWA a partir do elemento raiz. | Front-end PWA |
| CryptoService | functions/src/utils/CryptoService.ts | infra | Criptografa e descriptografa tokens com AES-256-GCM. | Functions |
| DomBuilder | public/js/utils/DomBuilder.js | shared | Centraliza criacao segura de elementos DOM sem innerHTML. | Front-end PWA |
| DPad | public/js/components/DPad.js | ui | Renderiza direcional circular com OK central. | Front-end PWA |
| ExtrasCatalog | public/js/data/ExtrasCatalog.js | domain | Lista atalhos extras e bloqueia itens sem comando confirmado. | Front-end PWA |
| ExtrasSheet | public/js/components/ExtrasSheet.js | ui | Exibe painel de atalhos extras habilitando somente comandos confirmados. | Front-end PWA |
| FirebaseSessionService | public/js/services/FirebaseSessionService.js | application | Inicializa sessao anonima do Firebase e fornece Functions na regiao do projeto. | Front-end PWA/TWA |
| FirebaseWebConfig | public/js/config/FirebaseWebConfig.js | infra | Centraliza a configuracao publica do Firebase Web e a regiao das Functions. | Front-end PWA/TWA |
| FrontendModuleSyntaxChecker | scripts/check-frontend-modules.js | infra | Valida sintaxe dos ES Modules do front-end e service worker. | Build |
| FrontendRemoteCommandCatalog | public/js/data/FrontendRemoteCommandCatalog.js | domain | Define allowlist e validacao de parametros de comandos do front-end. | Front-end PWA |
| FunctionFactory | functions/src/FunctionFactory.ts | infra | Compoe services, repositories e adapters das Functions. | Functions |
| Haptics | public/js/utils/Haptics.js | shared | Encapsula feedback tatil quando suportado pelo navegador. | Front-end PWA |
| HttpClient | functions/src/utils/HttpClient.ts | infra | Executa HTTP externo com timeout e allowlist SmartThings. | Functions |
| LocalBridgeApp | local-bridge/src/index.ts | application | Inicializa configuracao, pareamento, adaptador e servidor local. | Local Bridge |
| LocalBridgeRemoteAdapter | public/js/services/LocalBridgeRemoteAdapter.js | infra | Envia comandos ao Local Bridge configurado via HTTP local. | Front-end PWA |
| LocalLogger | local-bridge/src/utils/LocalLogger.ts | infra | Emite logs locais sanitizados. | Local Bridge |
| LocalRemoteCommandService | local-bridge/src/tv/LocalRemoteCommandService.ts | application | Serializa comandos locais e cancela repeticoes rapidas. | Local Bridge |
| MockRemoteAdapter | public/js/services/MockRemoteAdapter.js | infra | Simula TV e perfil CU7700 para desenvolvimento sem dispositivo real. | Front-end PWA |
| MockTvAdapter | local-bridge/src/tv/MockTvAdapter.ts | infra | Simula TV para desenvolvimento e testes sem dispositivo real. | Local Bridge |
| NaturalLanguageCommandService | functions/src/ai/NaturalLanguageCommandService.ts | application | Estrutura comando por linguagem natural, desativado por padrao. | Functions |
| NumericKeypadSheet | public/js/components/NumericKeypadSheet.js | ui | Exibe teclado numerico usando NUMBER_KEY e bloqueando teclas sem contrato. | Front-end PWA |
| PowerButton | public/js/components/PowerButton.js | ui | Renderiza botao power premium com comando seguro. | Front-end PWA |
| PressRepeater | public/js/utils/PressRepeater.js | shared | Controla repeticao cancelavel para comandos pressionados. | Front-end PWA |
| RateLimiter | functions/src/middleware/RateLimiter.ts | infra | Aplica rate limit distribuido usando Firestore. | Functions |
| RateLimiter | local-bridge/src/utils/RateLimiter.ts | infra | Aplica rate limit em memoria no bridge local. | Local Bridge |
| RemoteApp | public/js/core/RemoteApp.js | application | Inicializa tema, adapter, controller, shell e service worker. | Front-end PWA |
| RemoteButton | public/js/components/RemoteButton.js | ui | Componente reutilizavel de botao com estados e disponibilidade. | Front-end PWA |
| RemoteCommandCatalog | functions/src/domain/RemoteCommand.ts | domain | Define comandos abstratos, modos suportados e parametros. | Functions |
| RemoteCommandService | public/js/services/RemoteCommandService.js | application | Valida allowlist, disponibilidade e envia comandos pelo adapter ativo. | Front-end PWA |
| RemoteController | public/js/controllers/RemoteController.js | application | Recebe acoes da UI, aplica haptics e delega comandos ao service. | Front-end PWA |
| RemoteShell | public/js/components/RemoteShell.js | ui | Compoe o controle remoto, painels, status e feedback ao usuario. | Front-end PWA |
| SamsungCu7700Profile | functions/src/smartthings/SamsungCu7700Profile.ts | domain | Cria perfil confirmado da Samsung CU7700 a partir dos dados retornados pela conexao. | Functions |
| SamsungLocalAdapter | local-bridge/src/tv/SamsungLocalAdapter.ts | infra | Adapter experimental para protocolo local Samsung validado futuramente. | Local Bridge |
| SamsungSmartThingsAdapter | local-bridge/src/tv/SamsungSmartThingsAdapter.ts | infra | Bloqueia uso indevido de SmartThings no bridge local. | Local Bridge |
| SchemaValidator | functions/src/utils/SchemaValidator.ts | infra | Converte validacoes Zod em AppError seguro. | Functions |
| SecureLogger | functions/src/utils/SecureLogger.ts | infra | Sanitiza logs das Cloud Functions. | Functions |
| SmartThingsCapabilityResolver | functions/src/smartthings/SmartThingsCapabilityResolver.ts | application | Converte comandos abstratos em capabilities declaradas. | Functions |
| SmartThingsClient | functions/src/smartthings/SmartThingsClient.ts | infra | Cliente HTTP restrito para SmartThings API oficial. | Functions |
| SmartThingsCommandService | functions/src/smartthings/SmartThingsCommandService.ts | application | Orquestra validacao e envio de comandos SmartThings. | Functions |
| SmartThingsDeviceService | functions/src/smartthings/SmartThingsDeviceService.ts | application | Lista, filtra, salva e consulta TVs/media players. | Functions |
| SmartThingsOAuthService | functions/src/smartthings/SmartThingsOAuthService.ts | application | Controla OAuth, state, token exchange, refresh e desconexao. | Functions |
| SmartThingsRemoteAdapter | public/js/services/SmartThingsRemoteAdapter.js | infra | Integra o front-end com callable Functions SmartThings quando configuradas. | Front-end PWA |
| SmartThingsTokenRepository | functions/src/repositories/SmartThingsTokenRepository.ts | infra | Persiste states OAuth e tokens SmartThings criptografados. | Functions |
| StatusHeader | public/js/components/StatusHeader.js | ui | Mostra TV alvo, status de conexao, conectividade e configuracoes. | Front-end PWA |
| StreamingAppsCatalog | public/js/data/StreamingAppsCatalog.js | domain | Mantem catalogo local extensivel de apps de streaming sem logos oficiais. | Front-end PWA |
| ThemePanel | public/js/components/ThemePanel.js | ui | Exibe selecao de tema persistida localmente. | Front-end PWA |
| ThemeService | public/js/services/ThemeService.js | application | Persiste e aplica temas Claro, Escuro e AMOLED. | Front-end PWA |
| ToastPresenter | public/js/components/ToastPresenter.js | ui | Apresenta feedback curto de comandos e erros. | Front-end PWA |
| TvAdapterFactory | local-bridge/src/tv/TvAdapterFactory.ts | infra | Cria adaptador local conforme configuracao. | Local Bridge |
| TvDeviceRepository | functions/src/repositories/TvDeviceRepository.ts | infra | Persiste metadados de dispositivos por usuario. | Functions |
| UserDeletionService | functions/src/services/UserDeletionService.ts | application | Remove dados do usuario e revoga sessoes. | Functions |
| UserPreferencesService | functions/src/services/UserPreferencesService.ts | application | Atualiza preferencias sincronizadas nao sensiveis. | Functions |
| UserProfileService | functions/src/services/UserProfileService.ts | application | Cria e retorna perfil minimo com base no token Firebase. | Functions |
| UserRepository | functions/src/repositories/UserRepository.ts | infra | Persiste perfil, preferencias e remocao de dados do usuario. | Functions |
| VolumeRail | public/js/components/VolumeRail.js | ui | Renderiza controle lateral de volume com repeticao segura. | Front-end PWA |

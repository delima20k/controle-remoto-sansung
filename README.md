# Controle TV

Aplicativo PWA para Android, provisoriamente chamado **Controle TV**, planejado para controlar Smart TVs Samsung modernas por dois caminhos: a API oficial SmartThings e um Local Bridge opcional na rede residencial.

Este README e um documento inicial de arquitetura. Ele nao implementa o front-end, as Cloud Functions nem o Local Bridge.

## Decisao De Stack

Este repositorio ainda nao possui codigo de aplicacao. As regras DELIMA existentes foram escritas para outro contexto e proibem Firebase, mas o requisito deste produto define Firebase como tecnologia obrigatoria. Para este novo app, a arquitetura adota:

- Front-end: HTML5, CSS3, JavaScript moderno com ES Modules, sem React, Angular, Vue ou TypeScript no front-end.
- PWA: manifest, service worker, cache offline, instalacao no Android.
- Firebase: Hosting, Authentication, Cloud Firestore, Cloud Functions for Firebase em Node.js com TypeScript, App Check e Emulator Suite.
- SmartThings: integracao oficial via OAuth 2.0, API de dispositivos, status, comandos e capacidades.
- Local Bridge: servico auxiliar opcional e experimental para controle local na mesma rede da TV.

## Fontes Tecnicas Consultadas

- SmartThings Service Integrations: https://developer.smartthings.com/docs/service-integrations/app-setup
- SmartThings OAuth e tokens: https://developer.smartthings.com/docs/service-integrations/token-management
- SmartThings Devices API: https://developer.smartthings.com/docs/service-integrations/query-and-list-devices
- SmartThings Commands API: https://developer.smartthings.com/docs/service-integrations/control-devices
- SmartThings Capabilities: https://developer.smartthings.com/docs/devices/capabilities/capabilities-reference
- Firebase Authentication: https://firebase.google.com/docs/auth
- Firebase Cloud Functions callable: https://firebase.google.com/docs/functions/callable
- Firebase App Check em Functions: https://firebase.google.com/docs/app-check/cloud-functions
- Firebase Hosting headers: https://firebase.google.com/docs/hosting/full-config
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/rules-conditions
- Firestore billing e custo: https://firebase.google.com/docs/firestore/pricing
- Firebase Emulator Suite: https://firebase.google.com/docs/emulator-suite
- MDN Service Workers/PWA offline: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
- MDN acesso a rede local: https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Local_network_access

## 1. Viabilidade Tecnica

O projeto e viavel com ressalvas.

O modo SmartThings e o caminho principal e mais seguro, porque usa API oficial, OAuth 2.0, escopos, tokens revogaveis e comandos baseados em capacidades. O ponto critico e que nem toda TV Samsung expoe todas as capacidades desejadas. Volume, mute, playback, input source e switch dependem das capacidades retornadas para o dispositivo. Canal, teclado direcional, Home, Back, Menu, Source e apps podem nao existir como comandos oficiais para todos os modelos.

O modo Local Bridge e viavel como recurso opcional, mas deve ser tratado como experimental. Protocolos locais usados por TVs Samsung podem variar por modelo, firmware e regiao. O PWA hospedado em HTTPS tambem nao deve assumir acesso livre a IPs privados, WebSockets locais ou dispositivos HTTP locais. Quando funcionar, o Local Bridge deve ser uma camada autenticada na rede local, nunca uma porta aberta sem controle.

Cloud Functions nao conseguem acessar diretamente IPs privados da casa do usuario. Qualquer controle local precisa acontecer entre o celular e o Local Bridge, ou entre o Local Bridge e a TV, dentro da mesma rede.

## 2. Limitacoes Do PWA

- Service worker exige contexto seguro em producao, normalmente HTTPS.
- O app pode abrir offline, mas nao controla a TV offline se SmartThings, Local Bridge ou rede local estiverem indisponiveis.
- Service workers nao rodam continuamente; o navegador pode encerrar tarefas em background.
- Acesso a rede local pode exigir permissao do navegador e pode ser bloqueado por regras de local network access, mixed content, CORS ou certificados.
- Vibracao depende de suporte do dispositivo e permissao/decisao do navegador.
- Wake-on-LAN, descoberta SSDP/mDNS e WebSocket local nao sao garantidos em PWA mobile.
- O PWA nao deve prometer paridade total com controle remoto nativo.

## 3. SmartThings Vs Local Bridge

| Criterio | SmartThings Oficial | Local Bridge Opcional |
|---|---|---|
| Status | Oficial | Experimental |
| Alcance | Internet, via SmartThings Cloud | Mesma rede local |
| Seguranca | OAuth 2.0, escopos, tokens | Depende da implementacao local |
| Segredos no front-end | Nunca | Nunca |
| Latencia | Pode variar pela nuvem | Pode ser menor na LAN |
| Compatibilidade | Depende das capacidades SmartThings da TV | Depende de protocolo local e firmware |
| Ligar TV | So se a capacidade existir | Pode depender de WoL/protocolo local |
| Manutencao | Menor risco | Maior risco de quebra |
| Recomendacao | Caminho principal | Recurso avancado, opcional |

## Modelo Principal De Desenvolvimento

O aparelho principal para desenvolvimento e testes e a Samsung Smart TV 75 polegadas Crystal UHD 4K CU7700, modelo `UN75CU7700GXZD`.

Esse modelo orienta o foco dos testes manuais, mas nao libera comandos por suposicao. O back-end usa `SamsungCu7700Profile` para registrar somente dados confirmados pela conexao SmartThings, como `deviceId`, `label`, `manufacturerName`, `deviceModel`, `presentationId`, `components`, `categories` e `capabilities` quando esses campos forem retornados pela API.

Nenhum IP, token, porta, aplicativo instalado ou capability e inventado com base no modelo. A UI futura deve habilitar botoes a partir de `deviceProfile.commandAvailability`, mostrando o metodo usado: `smartthings`, `localBridge` ou indisponivel.

## 4. Arquitetura Completa

```txt
Usuario Android
  |
  v
PWA no Chrome Android
  |
  |-- Firebase Authentication
  |-- IndexedDB/localStorage para estado local nao sensivel
  |-- Service Worker para shell offline
  |
  v
Firebase Hosting
  |
  v
Cloud Functions for Firebase
  |-- Auth guard
  |-- App Check
  |-- Rate limiting
  |-- CORS restrito
  |-- SmartThings OAuth handler
  |-- SmartThings command gateway
  |-- Token encryption/decryption
  |-- Audit logger
  |
  v
Cloud Firestore
  |-- dados de usuario
  |-- preferencias
  |-- metadados de TVs
  |-- conexoes SmartThings criptografadas e inacessiveis ao cliente
  |-- auditoria sem dados sensiveis
  |
  v
SmartThings API Oficial
  |-- listar dispositivos
  |-- consultar status
  |-- enviar comandos por capacidade

Modo local opcional:

PWA
  |
  |-- HTTPS/WebSocket autenticado na LAN quando suportado
  v
Local Bridge
  |-- descoberta local
  |-- pareamento com TV
  |-- token local guardado somente no dispositivo do bridge
  v
Smart TV Samsung
```

### Camadas

- `public/js/app`: boot, router e composicao.
- `public/js/pages`: telas.
- `public/js/components`: componentes visuais reutilizaveis.
- `public/js/services`: clientes Firebase, Functions e Local Bridge.
- `public/js/stores`: estado de UI, preferencias locais e cache.
- `functions/src`: BFF serverless, regras de negocio, integracoes e seguranca.
- `local-bridge/src`: servico local opcional, separado do PWA e do Firebase.

## 5. Fluxo De Autenticacao

### Firebase

1. Usuario abre o PWA.
2. App inicializa Firebase Web SDK com configuracao publica do projeto.
3. O PWA inicia uma sessao anonima, sem tela de cadastro ou senha.
4. Firebase Authentication emite ID token vinculado ao dispositivo/navegador.
5. Chamadas para Cloud Functions usam Callable Functions quando possivel, com Auth e App Check incluidos pelo SDK.
6. Cloud Functions validam `request.auth.uid`, App Check e entrada.

### SmartThings OAuth

1. Usuario autenticado clica em conectar SmartThings.
2. PWA chama `startSmartThingsOAuth`.
3. Function gera `state`, nonce e, se suportado pelo fluxo configurado, PKCE.
4. Function salva tentativa curta em Firestore com TTL logico.
5. PWA redireciona para a URL de autorizacao SmartThings com escopos minimos.
6. SmartThings redireciona para `/smartthings/oauth/callback`.
7. Cloud Function valida `state`, troca `code` por tokens usando `client_id` e `client_secret` no backend.
8. Tokens sao criptografados antes de persistir.
9. Function associa conexao ao `uid` do usuario.
10. PWA recebe apenas status de sucesso, nunca tokens.

Escopos iniciais recomendados:

- `r:devices:$` para ler somente TVs selecionadas, quando suficiente.
- `x:devices:$` para executar comandos nos dispositivos selecionados.
- `r:locations:*` somente se a UX precisar agrupar por local.

Usar `*` apenas quando a experiencia exigir listar todos os dispositivos autorizados.

## 6. Fluxo De Pareamento Local

1. Usuario instala e inicia o Local Bridge no computador, Raspberry Pi ou mini PC da mesma rede.
2. Bridge gera uma chave local e exibe QR Code ou codigo curto.
3. PWA acessa o bridge por URL local informada pelo usuario ou descoberta quando o navegador permitir.
4. PWA envia pedido de pareamento com ID de sessao temporario.
5. Bridge exige confirmacao local por PIN/QR.
6. Bridge descobre TVs Samsung na LAN.
7. Usuario seleciona a TV.
8. TV mostra prompt de autorizacao, quando o protocolo local exigir.
9. Bridge salva token de pareamento apenas no dispositivo local.
10. PWA salva somente metadados nao sensiveis do bridge, como nome, host aprovado e data da ultima conexao.

## 7. Fluxo Dos Comandos

### SmartThings

1. Usuario toca em um botao do controle.
2. UI gera um comando abstrato, por exemplo `VOLUME_UP`.
3. `RemoteCommandService` valida o comando contra uma lista fechada.
4. PWA chama `sendRemoteCommand`.
5. Cloud Function valida Auth, App Check, ownership do dispositivo e rate limit.
6. `SmartThingsCapabilityResolver` converte o comando abstrato em capacidade e comando SmartThings quando suportado.
7. `SmartThingsClient` envia `POST /v1/devices/{deviceId}/commands`.
8. Function retorna `accepted`, `unsupported`, `offline`, `rate_limited` ou `error`.
9. UI mostra feedback claro em portugues.

Importante: resposta `ACCEPTED` da SmartThings significa comando aceito para execucao, nao execucao concluida.

### Local Bridge

1. Usuario toca em um botao.
2. PWA valida comando abstrato localmente.
3. PWA chama o Local Bridge autenticado.
4. Bridge valida token local, origem, sessao e rate limit.
5. Bridge envia comando para a TV pelo protocolo local configurado.
6. Bridge responde status ao PWA.

## 8. Modelo De Seguranca

- Nenhum `client_secret`, access token, refresh token ou token de pareamento no front-end.
- SmartThings tokens criptografados no backend antes de salvar.
- Segredos estaticos em Secret Manager/Functions secrets.
- Firestore Security Rules negam acesso direto aos tokens.
- Cloud Functions validam Auth, App Check e schema de entrada.
- CORS restrito aos dominios do Firebase Hosting e dominios customizados.
- OAuth usa `state`; usar PKCE se o fluxo e o provedor escolhido suportarem.
- Logs nao armazenam tokens, secrets, payloads OAuth completos nem comandos sensiveis.
- Comandos de IA ficam em allowlist; IA nunca executa diretamente.
- Exclusao de conta remove preferencias, dispositivos, conexoes, favoritos e auditoria associada.
- Revogacao SmartThings remove tokens locais e tenta revogar/desconectar quando a API/fluxo permitir.
- Local Bridge exige autenticacao local, pareamento explicito e rate limit.

### Content Security Policy Inicial

```txt
default-src 'self';
script-src 'self' https://www.gstatic.com https://www.googletagmanager.com;
style-src 'self';
img-src 'self' data: blob: https://cdn.simpleicons.org;
font-src 'self';
connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://api.smartthings.com;
manifest-src 'self';
worker-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests;
```

Para Local Bridge, adicionar origem local somente apos decisao tecnica, por exemplo `https://bridge.local:9443`, e nunca liberar `*`.

### Headers De Seguranca No Hosting

```json
{
  "hosting": {
    "public": "public",
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://www.gstatic.com https://www.googletagmanager.com; style-src 'self'; img-src 'self' data: blob: https://cdn.simpleicons.org; font-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://api.smartthings.com; manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "no-referrer" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()" },
          { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
          { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
        ]
      },
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|webp|svg|ico|woff2)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "/service-worker.js",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache" }
        ]
      }
    ]
  }
}
```

## 9. Estrutura Do Firestore

### Colecoes

```txt
users/{uid}
tvDevices/{deviceId}
smartThingsConnections/{connectionId}
userPreferences/{uid}
remoteLayouts/{layoutId}
favoriteCommands/{favoriteId}
auditEvents/{eventId}
```

### `users/{uid}`

Dados publicos minimos do usuario autenticado.

```json
{
  "uid": "firebase-auth-uid",
  "displayName": "Nome",
  "emailNormalized": "usuario@example.com",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp",
  "deletedAt": null
}
```

### `tvDevices/{deviceId}`

Metadados da TV. Nao contem tokens.

```json
{
  "ownerUid": "firebase-auth-uid",
  "provider": "smartthings",
  "providerDeviceId": "smartthings-device-id",
  "label": "Sala",
  "manufacturerName": "Samsung",
  "modelName": "Crystal UHD CU7700",
  "capabilities": ["switch", "audioVolume", "audioMute", "mediaPlayback"],
  "connectionId": "smartthings-connection-id",
  "lastKnownState": {
    "power": "unknown",
    "health": "unknown"
  },
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

### `smartThingsConnections/{connectionId}`

Documento gerenciado somente por Cloud Functions/Admin SDK. O cliente nao le nem escreve.

```json
{
  "ownerUid": "firebase-auth-uid",
  "provider": "smartthings",
  "installedAppId": "smartthings-installed-app-id",
  "scopes": ["r:devices:$", "x:devices:$"],
  "encryptedAccessToken": "ciphertext",
  "encryptedRefreshToken": "ciphertext",
  "tokenExpiresAt": "timestamp",
  "encryptionKeyVersion": "kms-key-version",
  "status": "active",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp",
  "revokedAt": null
}
```

### `userPreferences/{uid}`

Preferencias sincronizadas e nao sensiveis.

```json
{
  "ownerUid": "firebase-auth-uid",
  "theme": "system",
  "highContrast": false,
  "hapticsEnabled": true,
  "defaultControlMode": "smartthings",
  "selectedDeviceId": "tv-device-id",
  "language": "pt-BR",
  "updatedAt": "serverTimestamp"
}
```

### `remoteLayouts/{layoutId}`

Layouts do controle por usuario.

```json
{
  "ownerUid": "firebase-auth-uid",
  "name": "Padrao",
  "deviceId": "tv-device-id",
  "buttons": [
    { "command": "POWER_TOGGLE", "position": 1, "visible": true }
  ],
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

### `favoriteCommands/{favoriteId}`

Atalhos favoritos.

```json
{
  "ownerUid": "firebase-auth-uid",
  "deviceId": "tv-device-id",
  "label": "YouTube",
  "command": "OPEN_APP",
  "arguments": { "appId": "youtube" },
  "position": 1,
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

### `auditEvents/{eventId}`

Auditoria sanitizada. Escrita por Cloud Functions. Leitura opcional pelo proprio usuario para diagnostico.

```json
{
  "ownerUid": "firebase-auth-uid",
  "type": "remote_command_sent",
  "deviceId": "tv-device-id",
  "command": "VOLUME_UP",
  "status": "accepted",
  "provider": "smartthings",
  "createdAt": "serverTimestamp"
}
```

### Onde Cada Dado Fica

Firestore:

- Perfil minimo do usuario.
- Preferencias sincronizadas.
- Metadados de TVs.
- Capacidades descobertas.
- Layouts e favoritos.
- Auditoria sem tokens.
- Tokens SmartThings criptografados, com acesso negado ao cliente.

IndexedDB:

- Shell de estado offline.
- Historico local dos ultimos comandos, sem tokens e sem payload sensivel.
- Cache de dispositivos e capacidades.
- Fila visual local para comandos pendentes, quando aplicavel.

localStorage:

- Tema preferido.
- Flag de onboarding concluido.
- Ultimo modo selecionado.
- Preferencias pequenas e nao sensiveis.

Nunca armazenar:

- `client_secret`.
- Access token ou refresh token em texto puro.
- Token SmartThings no front-end.
- Token de pareamento da TV na nuvem.
- Senha do usuario.
- Chave de IA no front-end.
- Frases de voz brutas sem consentimento explicito.
- Logs com tokens, headers Authorization ou respostas OAuth completas.

## 10. Firestore Rules Completas Iniciais

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    function ownsExisting() {
      return signedIn() && resource.data.ownerUid == request.auth.uid;
    }

    function ownsIncoming() {
      return signedIn() && request.resource.data.ownerUid == request.auth.uid;
    }

    function unchangedOwner() {
      return !request.resource.data.diff(resource.data).affectedKeys().hasAny(['ownerUid']);
    }

    function validTimestampFields() {
      return request.resource.data.keys().hasOnly([
        'uid',
        'ownerUid',
        'displayName',
        'emailNormalized',
        'provider',
        'providerDeviceId',
        'label',
        'manufacturerName',
        'modelName',
        'capabilities',
        'connectionId',
        'lastKnownState',
        'theme',
        'highContrast',
        'hapticsEnabled',
        'defaultControlMode',
        'selectedDeviceId',
        'language',
        'name',
        'deviceId',
        'buttons',
        'command',
        'arguments',
        'position',
        'visible',
        'createdAt',
        'updatedAt',
        'deletedAt'
      ]);
    }

    match /users/{uid} {
      allow get: if isOwner(uid);
      allow list: if false;
      allow create: if isOwner(uid)
        && request.resource.data.uid == uid
        && request.resource.data.keys().hasOnly([
          'uid',
          'displayName',
          'emailNormalized',
          'createdAt',
          'updatedAt',
          'deletedAt'
        ]);
      allow update: if isOwner(uid)
        && request.resource.data.uid == uid
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['uid', 'createdAt'])
        && request.resource.data.keys().hasOnly([
          'uid',
          'displayName',
          'emailNormalized',
          'createdAt',
          'updatedAt',
          'deletedAt'
        ]);
      allow delete: if false;
    }

    match /userPreferences/{uid} {
      allow get: if isOwner(uid);
      allow list: if false;
      allow create: if isOwner(uid)
        && request.resource.data.ownerUid == uid
        && request.resource.data.keys().hasOnly([
          'ownerUid',
          'theme',
          'highContrast',
          'hapticsEnabled',
          'defaultControlMode',
          'selectedDeviceId',
          'language',
          'updatedAt'
        ])
        && request.resource.data.theme in ['light', 'dark', 'system']
        && request.resource.data.defaultControlMode in ['smartthings', 'localBridge'];
      allow update: if isOwner(uid)
        && resource.data.ownerUid == uid
        && request.resource.data.ownerUid == uid
        && unchangedOwner()
        && request.resource.data.keys().hasOnly([
          'ownerUid',
          'theme',
          'highContrast',
          'hapticsEnabled',
          'defaultControlMode',
          'selectedDeviceId',
          'language',
          'updatedAt'
        ])
        && request.resource.data.theme in ['light', 'dark', 'system']
        && request.resource.data.defaultControlMode in ['smartthings', 'localBridge'];
      allow delete: if false;
    }

    match /tvDevices/{deviceId} {
      allow get: if ownsExisting();
      allow list: if signedIn()
        && request.query.limit <= 50;
      allow create, update, delete: if false;
    }

    match /smartThingsConnections/{connectionId} {
      allow read, write: if false;
    }

    match /remoteLayouts/{layoutId} {
      allow get: if ownsExisting();
      allow list: if signedIn()
        && request.query.limit <= 20;
      allow create: if ownsIncoming()
        && validTimestampFields()
        && request.resource.data.name is string
        && request.resource.data.name.size() <= 60;
      allow update: if ownsExisting()
        && ownsIncoming()
        && unchangedOwner()
        && validTimestampFields()
        && request.resource.data.name is string
        && request.resource.data.name.size() <= 60;
      allow delete: if ownsExisting();
    }

    match /favoriteCommands/{favoriteId} {
      allow get: if ownsExisting();
      allow list: if signedIn()
        && request.query.limit <= 50;
      allow create: if ownsIncoming()
        && request.resource.data.keys().hasOnly([
          'ownerUid',
          'deviceId',
          'label',
          'command',
          'arguments',
          'position',
          'createdAt',
          'updatedAt'
        ])
        && request.resource.data.label is string
        && request.resource.data.label.size() <= 40
        && request.resource.data.command in [
          'POWER_TOGGLE',
          'POWER_ON',
          'POWER_OFF',
          'VOLUME_UP',
          'VOLUME_DOWN',
          'MUTE_TOGGLE',
          'CHANNEL_UP',
          'CHANNEL_DOWN',
          'OPEN_APP',
          'SET_INPUT'
        ];
      allow update: if ownsExisting()
        && ownsIncoming()
        && unchangedOwner()
        && request.resource.data.keys().hasOnly([
          'ownerUid',
          'deviceId',
          'label',
          'command',
          'arguments',
          'position',
          'createdAt',
          'updatedAt'
        ])
        && request.resource.data.label is string
        && request.resource.data.label.size() <= 40;
      allow delete: if ownsExisting();
    }

    match /auditEvents/{eventId} {
      allow get: if ownsExisting();
      allow list: if signedIn()
        && request.query.limit <= 50;
      allow create, update, delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Observacao: consultas de listagem precisam incluir filtro `ownerUid == uid`; rules nao sao filtros. Se a consulta puder retornar documento de outro usuario, o Firestore rejeita a query inteira.

## 11. Estrutura Completa De Pastas

```txt
controle-tv/
  README.md
  .gitignore
  .env.example
  firebase.json
  firestore.rules
  firestore.indexes.json
  storage.rules
  package.json
  docs/
    architecture.md
    security.md
    smartthings.md
    local-bridge.md
    testing.md
    deployment.md
  public/
    index.html
    offline.html
    manifest.webmanifest
    service-worker.js
    assets/
      icons/
      screenshots/
    css/
      reset.css
      tokens.css
      base.css
      components.css
      pages.css
    js/
      app.js
      config/
        firebase-config.js
        feature-flags.js
      components/
        AppShell.js
        ConnectionStatus.js
        RemoteButton.js
        RemotePad.js
        NumericKeypad.js
        AppShortcutGrid.js
        ThemeSelector.js
        ToastPresenter.js
      pages/
        WelcomePage.js
        LoginPage.js
        ConnectTvPage.js
        DeviceListPage.js
        RemoteControlPage.js
        SettingsPage.js
        DiagnosticsPage.js
        OfflinePage.js
      services/
        FirebaseAppService.js
        AuthService.js
        FunctionsService.js
        SmartThingsRemoteService.js
        LocalBridgeService.js
        RemoteCommandService.js
        HapticsService.js
      stores/
        AppStateStore.js
        DeviceStore.js
        PreferencesStore.js
        CommandHistoryStore.js
      utils/
        DomSanitizer.js
        InputValidator.js
        RetryPolicy.js
        AccessibleNames.js
  functions/
    package.json
    tsconfig.json
    src/
      index.ts
      config/
        appConfig.ts
        corsConfig.ts
        secrets.ts
      middleware/
        assertAuth.ts
        assertAppCheck.ts
        rateLimit.ts
        validateRequest.ts
      smartthings/
        SmartThingsOAuthService.ts
        SmartThingsTokenRepository.ts
        SmartThingsClient.ts
        SmartThingsCapabilityResolver.ts
        SmartThingsDeviceService.ts
        SmartThingsCommandService.ts
      auth/
        UserDeletionService.ts
        UserProfileService.ts
      users/
        UserPreferencesRepository.ts
        TvDeviceRepository.ts
        AuditEventRepository.ts
      ai/
        NaturalLanguageCommandService.ts
        CommandAllowlist.ts
      utils/
        CryptoService.ts
        Logger.ts
        Result.ts
        SchemaValidator.ts
    tests/
      smartthings-command-service.test.ts
      smartthings-oauth-service.test.ts
      firestore-rules.test.ts
  local-bridge/
    README.md
    package.json
    .env.example
    src/
      index.js
      config/
        BridgeConfig.js
      auth/
        BridgePairingService.js
        BridgeTokenStore.js
      discovery/
        SamsungTvDiscoveryService.js
      tv/
        SamsungTvLocalAdapter.js
        LocalRemoteCommandService.js
      http/
        BridgeHttpServer.js
      utils/
        LocalLogger.js
    tests/
      bridge-pairing-service.test.js
      local-remote-command-service.test.js
```

Melhoria em relacao a estrutura sugerida: `docs/` centraliza decisoes, `public/js/services` separa integracao da UI, `functions/src/smartthings` isola a API externa, e `local-bridge` fica completamente separado para nao misturar codigo LAN experimental com o PWA hospedado.

## 12. Lista De Telas

- `WelcomePage`: apresentacao e escolha de modo.
- `LoginPage`: Google, e-mail/senha e uso local quando possivel.
- `ConnectTvPage`: escolha entre SmartThings e Local Bridge.
- `DeviceListPage`: TVs encontradas ou cadastradas.
- `RemoteControlPage`: controle principal.
- `SettingsPage`: tema, alto contraste, vibracao, conta, dados e conexoes.
- `DiagnosticsPage`: status SmartThings, status bridge, latencia, ultimo erro.
- `OfflinePage`: interface offline com configuracoes e historico local.

## 13. Lista De Componentes

- `AppShell`
- `ConnectionStatus`
- `RemoteButton`
- `RemotePad`
- `NumericKeypad`
- `AppShortcutGrid`
- `FavoriteCommandEditor`
- `ThemeSelector`
- `HighContrastToggle`
- `HapticsToggle`
- `DeviceCard`
- `ProviderSelector`
- `DiagnosticsPanel`
- `ToastPresenter`
- `ConfirmDialog`
- `LoadingOverlay`

## 14. Endpoints Das Cloud Functions

Callable Functions para o PWA:

- `startSmartThingsOAuth`
- `listTvDevices`
- `syncSmartThingsDevices`
- `getTvStatus`
- `sendRemoteCommand`
- `revokeSmartThingsConnection`
- `deleteUserData`
- `saveUserPreferences`
- `saveRemoteLayout`
- `saveFavoriteCommand`
- `deleteFavoriteCommand`
- `resolveNaturalLanguageCommand` desativada por padrao

HTTP Functions para terceiros/redirects:

- `GET /smartthings/oauth/callback`
- `POST /smartthings/webhook`
- `GET /healthz`

Funcoes administrativas internas:

- `scheduledTokenRefresh`
- `cleanupExpiredOAuthStates`
- `cleanupDeletedUsers`

## 15. Comandos Abstratos Do Controle

Comandos basicos:

- `POWER_TOGGLE`
- `POWER_ON`
- `POWER_OFF`
- `VOLUME_UP`
- `VOLUME_DOWN`
- `SET_VOLUME`
- `MUTE`
- `UNMUTE`
- `MUTE_TOGGLE`
- `CHANNEL_UP`
- `CHANNEL_DOWN`
- `SET_CHANNEL`
- `DPAD_UP`
- `DPAD_DOWN`
- `DPAD_LEFT`
- `DPAD_RIGHT`
- `DPAD_OK`
- `HOME`
- `BACK`
- `MENU`
- `SOURCE`
- `SET_INPUT`
- `PLAY`
- `PAUSE`
- `PLAY_PAUSE`
- `STOP`
- `FAST_FORWARD`
- `REWIND`
- `NEXT_TRACK`
- `PREVIOUS_TRACK`
- `OPEN_APP`
- `NUMBER_0` ate `NUMBER_9`

Mapeamento SmartThings deve ser feito por capacidades realmente retornadas pela TV. Exemplos:

- `POWER_ON` e `POWER_OFF`: `switch.on` e `switch.off`, se `switch` existir.
- `VOLUME_UP`, `VOLUME_DOWN`, `SET_VOLUME`: `audioVolume.volumeUp`, `audioVolume.volumeDown`, `audioVolume.setVolume`, se `audioVolume` existir.
- `MUTE`, `UNMUTE`: `audioMute.mute`, `audioMute.unmute`, se `audioMute` existir.
- `PLAY`, `PAUSE`, `STOP`, `FAST_FORWARD`, `REWIND`: `mediaPlayback`, se existir.
- `NEXT_TRACK`, `PREVIOUS_TRACK`: `mediaTrackControl`, se existir.
- `SET_INPUT`: `mediaInputSource.setInputSource`, se existir.

Quando nao houver capacidade correspondente, a UI deve mostrar: "Este comando nao e suportado por esta TV pelo modo selecionado."

## 16. Estrategia Offline

- Service worker com app shell cacheado: HTML, CSS, JS, manifest, icones e `offline.html`.
- Cache versionado com limpeza no `activate`.
- `Cache-Control: no-cache` para `service-worker.js`.
- IndexedDB para historico local dos ultimos comandos, preferencias e ultimo snapshot de dispositivos.
- Firestore offline persistence pode ser considerada, mas deve ser usada com cuidado para nao aumentar leituras apos reconexoes longas.
- Comandos para TV nao devem ser "executados offline" de forma enganosa. A UI pode registrar tentativa local, mas deve mostrar que o envio depende de reconexao.
- Atualizacao segura: service worker novo instala, pre-cacheia assets, notifica UI e so ativa com confirmacao ou no proximo carregamento.

## 17. Estrategia De Testes

Front-end:

- Testes unitarios com `node:test` para services, stores, validators e command mapping.
- Testes de acessibilidade manual e automatizada quando ferramentas estiverem disponiveis.
- Testes de responsividade em mobile vertical, mobile horizontal e desktop estreito.
- Testes de service worker com cache versionado e fallback offline.

Functions:

- Testes unitarios com `node:test` para services e repositories.
- Mocks somente para SmartThings API, Firestore Admin SDK e Secret Manager.
- Testes de validacao de entrada maliciosa.
- Testes de rate limit.
- Testes de concorrencia no refresh token, porque refresh token SmartThings e de uso unico.

Firestore:

- Testes no Emulator Suite para regras de owner UID.
- Testes negando leitura de `smartThingsConnections`.
- Testes de queries com `ownerUid == uid` e `limit`.

Local Bridge:

- Testes unitarios para pareamento, token local, rate limit e comando abstrato.
- Testes manuais por modelo de TV, firmware e rede.

## 18. Estrategia De Implantacao

1. Criar projeto Firebase.
2. Ativar Authentication.
3. Habilitar provedores Google e Email/Password.
4. Criar Firestore em modo production.
5. Configurar `firestore.rules` e `firestore.indexes.json`.
6. Configurar Firebase Hosting.
7. Configurar Cloud Functions 2nd gen em regiao escolhida.
8. Configurar App Check para Web.
9. Registrar API Access App no SmartThings Developer Center.
10. Configurar redirect URI: `https://<dominio>/smartthings/oauth/callback`.
11. Configurar target URL para webhook SmartThings.
12. Salvar `SMARTTHINGS_CLIENT_ID` e `SMARTTHINGS_CLIENT_SECRET` em secrets, nunca no Git.
13. Configurar dominio autorizado no Firebase Auth.
14. Configurar CORS permitido.
15. Rodar Emulator Suite local.
16. Deploy de rules e indexes.
17. Deploy de Functions.
18. Deploy de Hosting.
19. Teste com conta SmartThings real e TV real.
20. Monitorar logs sanitizados, erros e custos.

## 19. Riscos Tecnicos E Alternativas

| Risco | Impacto | Mitigacao |
|---|---|---|
| TV nao expoe todas as capacidades SmartThings | Comandos indisponiveis | Capability resolver e UI de nao suportado |
| SmartThings aceita comando mas TV nao executa | UX confusa | Mostrar "comando enviado" e consultar status depois |
| Refresh token de uso unico sofre corrida | Perda de conexao | Lock por connectionId e refresh atomico |
| PWA bloqueia LAN | Local Bridge falha | Modo SmartThings como principal e diagnostico claro |
| Local protocol muda por firmware | Bridge quebra | Marcar experimental e isolar adapter |
| Custo de Firestore por leituras | Conta cresce | Cache, limites, cursors, evitar listeners permanentes |
| OAuth CSRF | Conta vinculada incorretamente | `state`, nonce, expiracao curta e validacao server-side |
| XSS rouba sessao | Comprometimento | CSP, sem `innerHTML` inseguro, sanitizacao, Trusted Types quando aplicavel |
| Segredo no Git | Incidente critico | `.env.example` sem valores, secrets no Firebase/Secret Manager |
| IA gera comando perigoso | Comportamento inesperado | Allowlist fechada e confirmacao para comandos sensiveis |

## 20. Configuracao Firebase Necessaria

### Authentication

- Habilitar Google.
- Habilitar Email/Password.
- Configurar dominios autorizados:
  - `localhost` para desenvolvimento.
  - `<project-id>.web.app`.
  - `<project-id>.firebaseapp.com`.
  - Dominio customizado, se existir.
- Configurar templates de e-mail em pt-BR.
- Avaliar Email Link no futuro para reduzir friccao mobile.

### Firestore

- Criar banco em production mode.
- Publicar rules restritivas.
- Criar indexes conforme queries reais.
- Usar TTL logico ou job agendado para limpar estados OAuth expirados.

### Functions

- Node.js com TypeScript.
- Secrets:
  - `SMARTTHINGS_CLIENT_ID`
  - `SMARTTHINGS_CLIENT_SECRET`
  - `TOKEN_ENCRYPTION_KEY` ou integracao KMS
  - `AI_API_KEY` somente se o recurso de IA for ativado no futuro
- App Check enforcement em callable functions.
- Regiao preferencial proxima aos usuarios.
- CORS restrito.

### App Check

- Registrar app Web.
- Comecar em modo monitoramento.
- Corrigir clientes nao verificados.
- Ativar enforcement em Firestore e Functions quando estavel.

### Emulator Suite

Emuladores obrigatorios:

- Authentication
- Firestore
- Functions
- Hosting

## 21. Arquivos `.env.example`

Raiz:

```txt
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PUBLIC_API_KEY=your-public-web-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_APP_ID=your-web-app-id
FIREBASE_MEASUREMENT_ID=optional-measurement-id
```

Functions:

```txt
SMARTTHINGS_CLIENT_ID=placeholder
SMARTTHINGS_CLIENT_SECRET=placeholder
TOKEN_ENCRYPTION_KEY=placeholder
AI_API_KEY=placeholder-disabled-by-default
ALLOWED_ORIGINS=https://your-project.web.app,https://your-domain.example
```

Local Bridge:

```txt
BRIDGE_HOST=0.0.0.0
BRIDGE_PORT=9443
BRIDGE_PAIRING_REQUIRED=true
BRIDGE_ALLOWED_ORIGINS=https://your-project.web.app
```

## 22. Recurso Futuro De IA

O recurso de linguagem natural fica desativado por padrao.

Fluxo planejado:

1. Usuario digita uma frase.
2. PWA envia a frase para Cloud Function autenticada.
3. Function chama o provedor de IA com chave em secret.
4. IA retorna JSON estruturado com comando da allowlist.
5. Function valida schema, comando e argumentos.
6. Para comandos sensiveis, UI pede confirmacao.
7. Somente depois o fluxo normal de comando e acionado.

Lista fechada inicial:

- `VOLUME_UP`
- `VOLUME_DOWN`
- `MUTE`
- `UNMUTE`
- `OPEN_APP`
- `SET_CHANNEL`
- `POWER_OFF`

Nunca permitir execucao de codigo, URLs arbitrarias, comandos livres ou argumentos fora de schema.

## 23. Ordem Exata Recomendada Para Implementacao

1. Inicializar repositorio e estrutura de pastas.
2. Criar `README.md`, `.gitignore`, `.env.example`, `firebase.json`, rules e indexes.
3. Configurar Firebase Emulator Suite.
4. Implementar app shell PWA minimo: `index.html`, CSS base, manifest e service worker.
5. Criar classes base de router, estado e acessibilidade.
6. Implementar tela de apresentacao.
7. Implementar tela de login Firebase com Google e e-mail/senha.
8. Criar Cloud Functions base com Auth, App Check, CORS, logger e validator.
9. Criar regras Firestore e testes no emulator.
10. Registrar SmartThings API Access App.
11. Implementar `startSmartThingsOAuth`.
12. Implementar callback OAuth e armazenamento criptografado de tokens.
13. Implementar listagem de TVs SmartThings.
14. Implementar resolver de capacidades.
15. Implementar `sendRemoteCommand` para `POWER`, `VOLUME` e `MUTE`.
16. Criar tela principal do controle remoto.
17. Adicionar comandos de playback e input source quando suportados.
18. Implementar preferencias, tema e alto contraste.
19. Implementar favoritos e layouts.
20. Implementar diagnostico.
21. Implementar historico local sem dados sensiveis.
22. Melhorar estrategia offline e fluxo de atualizacao do service worker.
23. Implementar revogacao SmartThings e exclusao de dados.
24. Criar Local Bridge como pacote separado.
25. Implementar pareamento Local Bridge.
26. Implementar adapter experimental para TV Samsung local.
27. Testar em TV real Samsung CU7700 ou modelo disponivel.
28. Ativar App Check enforcement.
29. Configurar deploy de Hosting e Functions.
30. Fazer revisao final de seguranca, performance, acessibilidade e custo.

## Checklist Para Iniciar Implementacao

- [ ] Confirmar se o app sera criado neste repositorio ou em uma subpasta `controle-tv/`.
- [ ] Confirmar nome publico final do app.
- [ ] Criar projeto Firebase.
- [ ] Definir regiao das Cloud Functions.
- [ ] Registrar app Web no Firebase.
- [ ] Ativar Authentication com Google e Email/Password.
- [ ] Criar Firestore em production mode.
- [ ] Registrar API Access App no SmartThings Developer Center.
- [ ] Confirmar redirect URI publica.
- [ ] Confirmar se a TV Samsung ja aparece na conta SmartThings do usuario.
- [ ] Definir se Local Bridge entra no MVP ou fica para fase 2.
- [ ] Definir dominio de producao.
- [ ] Definir politica de privacidade e exclusao de dados.
- [ ] Confirmar comandos minimos do MVP: power, volume, mute e playback.
- [ ] Rodar tudo primeiro no Firebase Emulator Suite.

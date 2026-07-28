# Controle TV Functions

Back-end serverless do Controle TV usando Cloud Functions for Firebase v2, Firestore, Firebase Auth, App Check e SmartThings API oficial.

## Dependencias

- `firebase-admin`: acesso Admin SDK a Auth e Firestore no back-end.
- `firebase-functions`: definicao de Cloud Functions v2, callable, HTTP e scheduler.
- `zod`: validacao estrita de entradas nas fronteiras.
- `typescript`: compilacao em modo strict.
- `@types/node`: tipos do runtime Node.js 22.

## Secrets Obrigatorios

Cadastre com Firebase Functions Secrets:

```bash
firebase functions:secrets:set SMARTTHINGS_CLIENT_ID
firebase functions:secrets:set SMARTTHINGS_CLIENT_SECRET
firebase functions:secrets:set SMARTTHINGS_REDIRECT_URI
firebase functions:secrets:set TOKEN_ENCRYPTION_KEY
```

`TOKEN_ENCRYPTION_KEY` deve ter pelo menos 16 caracteres. Em producao, use valor aleatorio forte e guarde fora do Git.

`OPENAI_API_KEY` e opcional e nao e usada enquanto `AI_COMMANDS_ENABLED` estiver diferente de `true`.

## Configuracao Firebase

1. Crie um projeto Firebase.
2. Ative Authentication.
3. Habilite provedores Google e Email/Password.
4. Crie Firestore em production mode.
5. Configure App Check para Web.
6. Publique `firestore.rules` e `firestore.indexes.json`.
7. Configure as Functions com runtime Node.js 22.
8. Configure dominios autorizados no Firebase Auth.

## SmartThings

1. Crie um API Access App no SmartThings Developer Workspace.
2. Configure redirect URI exatamente igual ao secret `SMARTTHINGS_REDIRECT_URI`.
3. Use escopos minimos: `r:devices:$` e `x:devices:$`.
4. Nao coloque client secret no front-end.
5. O callback HTTP e `/smartthings/oauth/callback`, reescrito pelo Firebase Hosting para a Function `smartThingsOAuthCallback`.

## Funcoes

- `createSmartThingsAuthorizationUrl`: callable autenticada; cria `state` temporario e retorna URL OAuth.
- `smartThingsOAuthCallback`: HTTP; valida `state`, troca `code` por tokens e salva tokens criptografados.
- `disconnectSmartThings`: callable; revoga localmente a conexao.
- `listSmartThingsDevices`: callable; lista e filtra TVs/media players.
- `getSmartThingsDeviceStatus`: callable; consulta status do dispositivo do usuario.
- `sendSmartThingsCommand`: callable; valida comando abstrato, capabilities e envia comando suportado.
- `getUserProfile`: callable; cria/retorna perfil minimo.
- `updateUserPreferences`: callable; salva preferencias nao sensiveis.
- `deleteUserAccountData`: callable; remove dados e revoga sessoes.
- `parseNaturalLanguageCommand`: callable; estrutura segura desativada por padrao.
- `cleanupExpiredOAuthStates`: scheduled; remove states OAuth expirados.

## Emuladores

```bash
npm install
npm run build --prefix functions
firebase emulators:start --only auth,firestore,functions,hosting
```

## Testes

```bash
npm test --prefix functions
```

Os testes unitarios cobrem catalogo de comandos, capabilities, criptografia e IA desativada. Testes de rules devem ser executados no Emulator Suite quando o projeto Firebase estiver configurado.

## Seguranca

- Todas as callables privadas exigem Auth e App Check.
- UID vem exclusivamente do token autenticado.
- Tokens SmartThings sao criptografados com AES-256-GCM.
- Logs passam por sanitizacao.
- HTTP externo so permite `https://api.smartthings.com`.
- Nao ha proxy generico nem URL livre enviada pelo front-end.

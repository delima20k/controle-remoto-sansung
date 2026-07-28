# Implementacao Back-End Controle TV

## Inconsistencias Corrigidas

- Firestore passou de colecoes top-level para subcolecoes por usuario: `users/{uid}/devices`, `preferences/default`, `smartThingsConnections/default`, `favoriteCommands` e `auditEvents`.
- Tokens SmartThings ficaram em documento inacessivel ao cliente e criptografado na aplicacao.
- Local Bridge nao tenta usar Cloud Functions para IP privado residencial.
- Adaptador local Samsung nao inventa endpoint nao oficial; fica experimental ate validacao real.
- Historico de toques permanece local por padrao para reduzir custo e coleta.
- O modelo principal de desenvolvimento e a Samsung Crystal UHD CU7700 UN75CU7700GXZD, mas o perfil `SamsungCu7700Profile` persiste somente dados confirmados pela resposta da SmartThings durante a conexao.
- Disponibilidade de botoes deve vir de `deviceProfile.commandAvailability`; SmartThings so aparece disponivel quando a capability foi retornada, e Local Bridge aparece como alternativa experimental quando aplicavel.

## Dependencias Fixadas

- Root: `firebase-tools` para emuladores e deploy.
- Functions: `firebase-admin`, `firebase-functions`, `zod`, `typescript`, `@types/node`.
- Local Bridge: `ws`, `zod`, `typescript`, `@types/node`, `@types/ws`.

## Comandos

```bash
npm install
npm install --prefix functions
npm install --prefix local-bridge
npm run build
npm test
```

## Deploy

```bash
firebase use your-project-id
firebase deploy --only firestore:rules,firestore:indexes,storage
firebase deploy --only functions
firebase deploy --only hosting
```

# Controle TV Local Bridge

Servico local opcional para desenvolvimento e controle em LAN. O modo oficial SmartThings continua nas Cloud Functions. Este bridge nao guarda tokens SmartThings.

## Dependencias

- `ws`: servidor WebSocket local autenticado por token.
- `zod`: validacao estrita dos comandos locais.
- `typescript`: compilacao em modo strict.
- `@types/node` e `@types/ws`: tipos de desenvolvimento.

## Execucao

```bash
cd local-bridge
npm install
npm run build
npm start
```

Por padrao o bridge sobe em `127.0.0.1:9443` com `MockTvAdapter`.

## Pareamento

1. Inicie o bridge.
2. Chame `POST /pairing/start`.
3. Confirme o codigo exibido localmente com `POST /pairing/confirm`:

```json
{
  "code": "123456"
}
```

4. Guarde o token retornado no PWA localmente. Envie-o em `X-Bridge-Token`.

## Endpoints

- `GET /healthz`: status publico basico.
- `POST /pairing/start`: inicia pareamento.
- `POST /pairing/confirm`: confirma pareamento e retorna token.
- `GET /status`: exige `X-Bridge-Token`.
- `POST /command`: exige `X-Bridge-Token` e aceita comando abstrato.
- `WS /ws?token=<token>`: canal WebSocket local autenticado.

## Testar Sem TV

Use `BRIDGE_ADAPTER=mock`. O `MockTvAdapter` aceita comandos e simula estado de volume, mute e power.

```bash
npm test --prefix local-bridge
```

## Samsung Local Experimental

`SamsungLocalAdapter` existe como adaptador isolado, mas nao envia comandos reais porque a Samsung nao oferece uma API local web oficial estavel para todos os modelos. Ele so deve ser expandido depois de validar modelo, firmware, pareamento, certificado e protocolo com seguranca.

Nao ignore erros de certificado em producao. Para PWA hospedado em HTTPS falar com rede local, use HTTPS local confiavel, app empacotado ou outro canal seguro aprovado pelo navegador.

## Configuracao

Copie `.env.example` e ajuste:

```txt
BRIDGE_HOST=127.0.0.1
BRIDGE_PORT=9443
BRIDGE_ALLOWED_ORIGINS=http://localhost:5000,https://your-project.web.app
BRIDGE_PAIRING_REQUIRED=true
BRIDGE_ADAPTER=mock
BRIDGE_DATA_DIR=./data
```

Nunca exponha a porta publicamente. Se usar `0.0.0.0`, aplique firewall e rede privada confiavel.

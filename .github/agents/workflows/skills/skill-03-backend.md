# SKILL 03 — BACKEND: SERVICES, REPOSITORIES, BFF, APIS

> Leia este arquivo para tarefas de backend: rotas, controllers, services, repositórios, BFF, integração com Supabase.
> Expandir conforme tarefas backend forem documentadas.

---

## 1. DIVISÃO DE RESPONSABILIDADES

**DELIMA NÃO cria servidores.** A divisão é:

| Responsabilidade | Quem executa |
|---|---|
| Modelar tabelas, relacionamentos, RLS, queries | DELIMA |
| Hospedar banco, storage, APIs, auth, escalabilidade | Supabase |

- Backend controla **toda** regra de negócio
- Frontend apenas consome dados — nunca toma decisões de negócio
- ❌ NUNCA criar microserviços sem necessidade real

---

## 2. PADRÕES OBRIGATÓRIOS DE ARQUITETURA BACKEND

### Service Layer

- Toda regra de negócio fica em Services
- Services não conhecem HTTP — recebem dados puros, retornam dados puros
- Controllers apenas delegam para Services — sem lógica de negócio nos controllers
- Exemplo de estrutura:

```js
class AgendamentoService {
  #repository;
  constructor(repository) { this.#repository = repository; }
  async criar(dados) { /* validação + regra de negócio */ }
}
```

### Repository Pattern

- Acesso ao banco fica exclusivamente em Repositories
- Repositories isolam queries — Services nunca acessam Supabase diretamente
- Cada entidade tem seu próprio Repository
- Exemplo:

```js
class AgendamentoRepository {
  #client;
  constructor(supabaseClient) { this.#client = supabaseClient; }
  async buscarPorId(id) { /* query isolada */ }
}
```

### Factory Pattern para serviços e adapters

- Usar Factory para criação de serviços, adapters, providers, componentes dinâmicos
- Facilita testes (injeção de dependência) e troca de implementações

---

## 3. ESTRUTURA DE PASTAS BACKEND

```txt
src/
 ├── controllers/     # Recebem request, delegam para services
 ├── services/        # Regra de negócio
 ├── repositories/    # Acesso ao banco
 ├── entities/        # Modelos de domínio
 ├── infra/           # Supabase client, configs externas
 └── middlewares/     # Auth, rate limit, validação de request
```

---

## 4. REGRAS DE ROTAS E CONTROLLERS

- Validar **toda** entrada na fronteira (body, params, query)
- Rate limit em endpoints públicos — ver `skill-04-seguranca.md`
- Controllers retornam apenas o necessário — nunca expõem dados internos
- Status HTTP semânticos: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
- ❌ NUNCA retornar stack traces ao cliente em produção

---

## 5. BFF (BACKEND FOR FRONTEND)

- A BFF (`barberflow-bff-api/`) é o único ponto de entrada para o frontend
- Toda lógica de agregação de dados fica na BFF
- Frontend nunca acessa Supabase diretamente — passa sempre pela BFF
- Novas rotas BFF: seguir fluxo TDD incremental (ver memória de usuário)

---

## 6. FLUXO TDD INCREMENTAL PARA BFF (OBRIGATÓRIO)

Para cada nova rota ou ajuste na BFF:

1. Criar/ajustar teste primeiro
2. Implementar SOMENTE o necessário para o teste passar
3. Rodar teste local
4. Rodar build local
5. Validar que rotas existentes não quebraram
6. Só então avançar para a próxima rota

**Proibições:**
- ❌ NÃO implementar várias rotas juntas
- ❌ NÃO alterar frontend antes da BFF estar validada e testada

## 7. NOTIFICACOES CANONICAS NA BFF

- Notificacoes de produto devem passar por um servico unico atras da BFF, nunca por regras espalhadas no frontend.
- Modelar canais como adapters de `DeliveryChannel` (`push`, `email`, `in_app`, `sms`) para trocar provider sem alterar regra de negocio.
- Push provider deve ficar atras de porta/adapters (FCM/APNs/Web Push/Sandbox), com invalidacao de endpoint em bounce permanente.
- Roteamento de canal deve considerar preferencias por categoria/canal, presenca, prioridade, quiet hours e digest.
- Dedupe obrigatorio por `(user_id, template_id, dedupe_key)` com janela configuravel antes de enfileirar.
- Entrega deve ir por filas dedicadas `notifications.high` e `notifications.default`, com tracking de delivery/open/click como eventos de dominio.
- Templates devem ter i18n e renderer centralizado; controllers nao renderizam texto nem escolhem canal.

## 7.1 WEBHOOKS EXTERNOS DE INTEGRACAO

- Webhooks de terceiros devem aceitar apenas os metodos e payloads estritamente necessarios.
- URLs de confirmacao recebidas em payload devem ser validadas por protocolo e allowlist de host antes de qualquer chamada externa, evitando SSRF.
- Eventos sem processamento implementado devem ser reconhecidos sem persistir dados ou executar efeitos colaterais.
- Tokens, payloads integrais e URLs temporarias nao podem ir para logs.
- Endpoints de webhook devem compor apenas as dependencias que usam; nao devem inicializar servicos que exigem secrets ou banco quando o evento nao precisa deles.

### OAuth externo consumido pelo PWA

- O PWA deve solicitar a URL OAuth exclusivamente pela Function autenticada e validar protocolo, host e caminho permitido antes de redirecionar o navegador.
- A escolha local do dispositivo pode guardar somente seu identificador, separado por usuario; tokens OAuth ficam somente no backend criptografado.

## 7.2 DEPLOY TYPESCRIPT DE FUNCTIONS

- O campo `main` do pacote de Functions deve apontar exatamente para o entrypoint gerado pelo `tsconfig.json`.
- Todo build de Functions deve ter teste que valide a existencia do entrypoint configurado antes do deploy.
- Parametros declarados com `defineString` nao podem usar nomes reservados pelo Firebase, como `FUNCTION_REGION`; a regiao deve ser definida nas opcoes globais ou da propria Function.

## 8. SCHEDULER CANONICO NA BFF

- Tarefas recorrentes de dominio devem ficar em Scheduler unico atras da BFF/worker, nao em `setInterval` espalhado.
- Cada tarefa deve ser declarada em codigo como `ScheduledTask`, com nome canonico, cron validado, timeout, retry, ownership e skew protection.
- O registro deve ser explicito em `TaskRegistry`; proibido espalhar string magica de task pelo codigo.
- Execucao multi-instancia deve usar lock distribuido com TTL. Preferir Redis lock quando a execucao acontece fora de uma transacao Postgres mantida.
- Toda execucao deve persistir historico e gerar evento/metrica de sucesso, falha, timeout ou skip.
- Disparo manual deve ficar em endpoint admin protegido por JWT e allowlist/token administrativo.

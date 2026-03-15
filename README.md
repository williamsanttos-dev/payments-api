# Payments API - Multi-Gateway

API RESTful construída com AdonisJS para gerenciar pagamentos via múltiplos gateways mockados.
O sistema permite criar usuários, produtos, realizar compras com **múltiplos produtos**, gerenciar gateways e processar reembolsos.

> ⚠️ Atualmente suporta apenas duas roles de usuário: ADMIN e USER. Futuras roles podem ser adicionadas facilmente.

---

## 📝 Requisitos

Para rodar o projeto, você precisa ter instalado:

- Docker
- Docker Compose

> ⚡ Todo o restante (Node.js, MySQL, API, gateways mockados) é gerenciado via Docker Compose.

--

## Instalação e execução

1. clone o projeto:

```bash
git clone git@github.com:williamsanttos-dev/payments-api.git
cd payments-api
```

2. Configure variáveis de ambiente (`.env`) com exemplo `.env.example`

3. Suba o Docker Compose:

```bash
docker-compose up --build -d
```

Isso iniciará:

- MySQL
- API AdonisJS
- Gateways mockados:
  - Gateway 1 --> http://localhost:3001
  - Gateway 2 --> http://localhost:3002
- rodar migrations and seeds
- start automático da aplicação

Existem duas seeds:

- Uma para criar produtos e os gateways
- Outra para criar usuários

ambas rodam no start da aplicação.

---

## Autenticação

- Login via JWT.
- Usuários criados via seed inicial:
  - ADMIN --> johnDoe998@example.com / JohnDoe001#
  - USER --> johnDoeUser@example.com / JohnDoe12
- Endpoints privados exigem header:

```
Authorization: Bearer <token>
```

---

## 🛣️ Rotas do Sistema

Todas as rotas seguem o prefixo /api/v1.

### Rotas públicas

#### **Autenticação**

- `POST /auth/login` → Realiza login e retorna JWT.

**exemplo de request:**

```JSON
{
  "email": "admin@admin.com",
  "password": "password"
}
```

**exemplo de response:**

```JSON
{
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

- POST `/api/v1/auth/signup` → Cria novo usuário.

---

#### Rotas de Compra

- POST `/api/v1/transactions` → Cria uma compra com múltiplos produtos, calcula o valor total e processa pagamento via gateway.

**exemplo de request:**

```JSON
{
  "client": {
    "name": "johnDoe",
    "email": "johnDoe123@email.com"
  },
  "products": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ],
  "cardNumber": "5569000000006063",
  "cvv": "010"
}
```

**exemplo de response:**

```JSON
{
  "id": "1a2b3c",
  "client": {
    "name": "Tester",
    "email": "tester@email.com"
  },
  "products": [
    { "id": 1, "name": "Produto A", "quantity": 2, "total": 2000 },
    { "id": 3, "name": "Produto C", "quantity": 1, "total": 1200 }
  ],
  "amount": 3200,
  "status": "SUCCESS",
  "gateway": "Gateway 1",
  "external_id": "abc123",
  "card_last_numbers": "6063"
}
```

---

### Rotas Privadas (ADMIN)

Incluem gerenciamento de produtos, gateways, clientes, transações e usuários.
Todas exigem JWT e `role: ADMIN`.

- Produtos (`/api/v1/products`)
  - `POST` → criar produto
  - `GET` → listar todos
  - `GET :id` → detalhes
  - `PATCH :id` → atualizar
  - `DELETE :id` → deletar

- Gateways (`/api/v1/gateways`)
  - `PATCH :id/activate` → ativar/desativar gateway
  - `PATCH :id/priority` → alterar prioridade do gateway

- Clientes (`/api/v1/clients`)
  - `GET` → listar clientes
  - `GET :id` → detalhes do cliente + compras

- Transações (`/api/v1/transactions`)
  - `POST` → criar transação (usado pelo endpoint de compra também)
  - `GET` → listar todas as transações
  - `GET :id` → detalhes da transação
  - `POST :id/refund` → reembolso da transação

- Usuários (`/api/v1/users`)
  - `GET` → listar usuários
  - `GET :id` → detalhes de um usuário
  - `PATCH :id` → atualizar
  - `DELETE :id` → deletar

---

### Rotas Privadas (USER)

Permitem apenas acesso aos dados do próprio usuário.

- `GET /api/v1/users/:id` → detalhes do próprio usuário
- `PATCH /api/v1/users/:id` → atualizar dados pessoais
- `DELETE /api/v1/users/:id` → deletar conta (própria)

> ⚡ Para testar todas as rotas com exemplos completos de request/response, basta importar a Postman Collection incluída no projeto:

- [📂 Payments API.postman_collection.json](./payments-api.postman_collection.json)

OU Importe para o postman em um clique:

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/39418702-8bd4780a-4bb7-4525-8bb6-55b2f7be7efb?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D39418702-8bd4780a-4bb7-4525-8bb6-55b2f7be7efb%26entityType%3Dcollection%26workspaceId%3Dc6fa2ed1-95e1-4c0e-b187-63edc2d64ed8)

## ⚙️ Outras informações relevantes

- **TDD**: Todos os endpoints possuem testes unitários e integração.
- **Docker Compose**: Facilita rodar banco + API + mocks dos gateways.
- **Validação de dados**: Todos os inputs passam por VineJS.
- **Registro de logs**: Logs básicos via console, pronto para evolução futura.
- **Hash de senha**: Todas as senhas são hashadas antes de serem salvas no banco.
- **Transações**: Rotas críticas utilizam transações ACID para garantir consistência do banco de dados.
- **Fluxo de Git**: Branches organizadas + PRs bem documentados usando template garantem controle e rastreabilidade do código.

## 👨🏻‍💻 Considerações

#### --> Gateway Manager

O arquivo gateway_manager gerencia as operações de gateway (create e refund). Ele busca os gateways ativos (is_active=true) no banco, ordena por prioridade ascendente e utiliza uma Factory Strategy para instanciar a classe correspondente a cada gateway.

Um loop percorre os gateways ativos e, em caso de falha, continua para o próximo até que a transação seja processada com sucesso ou a lista acabe — nesse caso, retorna { success: false }.

Todos os gateways implementam a mesma interface (createTransaction e refund), garantindo consistência e permitindo fallback automático em caso de falha (Adapter Strategy).

#### --> Tests

O LucidORM é um Active Record, diferentemente de ORMs como Prisma ou TypeORM, que seguem o padrão Data Mapper. Por natureza, Active Record dificulta o mock de modelos em testes unitários, pois o modelo já está acoplado às operações de banco de dados.

Para contornar isso, nos testes do projeto, adotei a estratégia de executar os testes com banco real e utilizar rollbacks, garantindo que cada teste seja isolado e não persista alterações.

Outra abordagem possível seria criar uma camada de repositórios e injetar via Dependency Injection, permitindo mockar os métodos de acesso ao banco. No entanto, isso adicionaria complexidade extra e demandaria mais tempo de desenvolvimento, que é limitado neste projeto.

Em rotas específicas como register e login, o uso de hash de senha, JWT e banco local com rollback é rápido, tornando o ganho de performance ao tentar mockar mínimo.

#### --> Update-user endpoint

No endpoint de update-user, é enviado um body com fullName, password e passwordConfirmation. Apesar da validação funcionar, um fluxo dedicado para atualização de senha seria mais seguro, envolvendo rotas como:

- `forget-password` → envia e-mail com link contendo token.
- `change-password` → valida o token e atualiza a senha se estiver válido.

Essa é apenas uma consideração, pois o foco do projeto não é o gerenciamento completo de senha.

#### --> Delete-user endpoint

Ao invés de deletar o usuário do banco, optamos por marcar o usuário como inativo. Isso evita a remoção completa de dados históricos, mas traz a consideração de tokens ativos: um access token ainda válido poderia permitir acesso temporário.

Para minimizar essa janela:

- Access tokens devem ter curta duração (~1h).
- Usuário inativo ou deletado precisaria logar novamente, impedindo acesso futuro.
- Em aplicações sensíveis, pode-se usar rotação de refresh token via cookies; ao deletar ou fazer logout, todos os tokens são removidos, invalidando instantaneamente a sessão.

Alternativamente, poderia-se checar se o usuário está ativo em cada rota, mas isso aumentaria operações no banco e reduziria performance.

> ⚡ A estratégia adotada combina marcar como inativo + curta duração de tokens, garantindo segurança sem sobrecarga no banco.

### --> Gateway CVV 200/300

Erros de validação de cartão nos gateways (CVV 200 ou 300) são capturados via catch.
A transação é marcada como FAILED e a API retorna a transaction com status FAILED.

### --> Registro de usuários e gateways

A rota register cria usuários com role=USER por padrão.
Para criar um admin ou registrar gateways, é necessário usar seed ou inserir diretamente no banco.

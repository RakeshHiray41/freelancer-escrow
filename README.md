# EscrowHub: Freelancer Escrow Platform

A freelance marketplace where the client's money is **held in escrow per milestone** and released only when the work is approved. Built as Spring Boot microservices behind an API Gateway, with a React frontend.

## Highlights

- **Milestone escrow:** fund, hold, release, refund, or split by percentage.
- **State machine** for milestones, with ownership checks on every transition.
- **Wallet with immutable ledger**, idempotent deposits, optimistic locking, 5% platform fee.
- **Disputes:** admin decides RELEASE, REFUND or SPLIT. AI summarizes, a human decides.
- **AI assistant (Gemini):** milestone planner, proposal writer, deliverable check, dispute summary. AI never moves money.
- **Chat:** REST plus WebSocket (STOMP), with moderation for contact details and off-platform payment requests.
- **Notifications:** in-app (MongoDB) and email.
- **Security:** JWT with refresh tokens, role-based access, internal service-to-service key, idle auto logout.

## Architecture

```
React (Vite, :5173)
        |
API Gateway (:8080)   JWT check, routing, CORS, blocks /internal/**
        |
 +------+---------+----------+----------+--------------+---------+--------+
 user   project    escrow     dispute    notification   ai        chat
 :8081  :8082      :8083      :8084      :8085          :8086     :8087
```

| Service | Port | Responsibility | Storage |
|---|---|---|---|
| api-gateway | 8080 | Single entry point, JWT validation, routing, CORS | none |
| user-service | 8081 | Register, email verify, login, refresh, password reset, profile and photo, admin user block | PostgreSQL `user_schema`, Supabase Storage |
| project-service | 8082 | Projects, bids, hire, milestones and state machine, reviews, auto-approve job | PostgreSQL `project_schema` |
| escrow-service | 8083 | Wallet, deposit, hold, release, refund, split, ledger, revenue | PostgreSQL `escrow_schema` |
| dispute-service | 8084 | Raise and resolve disputes | PostgreSQL `dispute_schema` |
| notification-service | 8085 | In-app notifications and email | MongoDB `notifications_db` |
| ai-service | 8086 | Gemini-powered suggestions | none |
| chat-service | 8087 | Project chat (REST and WebSocket) | MongoDB `chat_db` |

`discovery-server` and `config-server` folders exist but are **not used** (services call each other by URL from `.env`).

## Tech stack

- **Backend:** Java 21, Spring Boot 4.1.1, Spring Security, Spring Data JPA and MongoDB, Spring Cloud Gateway (WebFlux), JJWT 0.12.6, Maven
- **Data:** Supabase PostgreSQL (one schema per service), Supabase Storage, MongoDB Atlas
- **Integrations:** Gmail SMTP, Google Gemini API
- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Axios, STOMP.js

## Prerequisites

- JDK 21, Maven 3.9+ (IntelliJ bundles Maven)
- Node.js 18+
- Accounts: Supabase, MongoDB Atlas, a Gmail account with an App Password, a Google AI Studio API key

## Setup

### 1. Supabase

1. Create a project. In the SQL Editor run:
   ```sql
   create schema if not exists user_schema;
   create schema if not exists project_schema;
   create schema if not exists escrow_schema;
   create schema if not exists dispute_schema;
   ```
2. Storage: create a **public** bucket named `profile-photos`.
3. Copy the **Session pooler** host from Connect (IPv4 compatible), your DB password, the project URL and the secret key.

### 2. MongoDB Atlas

Create a free cluster, add a database user, allow your IP under Network Access, and copy the connection string. The notification and chat services use separate databases (`notifications_db`, `chat_db`).

### 3. Environment file

All services and the frontend read **one** `.env` in the project root. It is never committed.

```bash
cp .env.example .env
```

Fill in the values:

| Variable | Used by | Notes |
|---|---|---|
| `DB_HOST` | user, project, escrow, dispute | Host name only, e.g. `aws-0-xx.pooler.supabase.com` (no `jdbc:` prefix, no port) |
| `DB_PORT` | same | `5432` |
| `DB_NAME` | same | `postgres` |
| `DB_USER` | same | `postgres.<project-id>` for the pooler |
| `DB_PASSWORD` | same | Plain letters and numbers are safest |
| `MONGO_URI_NOTIFICATIONS` | notification | Full Atlas URL ending with `/notifications_db` |
| `MONGO_URI_CHAT` | chat | Full Atlas URL ending with `/chat_db` |
| `JWT_SECRET` | all services and gateway | Long random string, **must be identical everywhere** |
| `INTERNAL_API_KEY` | all services | Long random string for service-to-service calls |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | user, notification | Gmail address and App Password (no spaces) |
| `SUPABASE_URL`, `SUPABASE_KEY` | user | Project URL and secret key (server only) |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | ai | e.g. `gemini-2.5-flash` |
| `FRONTEND_URL` | user | Used in the links inside emails |
| `VITE_API_URL` | frontend | Gateway URL |
| `VITE_WS_URL` | frontend | Chat WebSocket URL |
| `VITE_IDLE_TIMEOUT_MIN` | frontend | Auto logout after this many idle minutes |

Optional overrides (defaults are the localhost ports above): `USER_SERVICE_URL`, `PROJECT_SERVICE_URL`, `ESCROW_SERVICE_URL`, `DISPUTE_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`, `AI_SERVICE_URL`, `CHAT_SERVICE_URL`, `CHAT_WS_URL`.

Each service loads the file through:
```
spring.config.import=optional:file:.env[.properties],optional:file:../.env[.properties],optional:file:../../.env[.properties]
```
In IntelliJ keep the run configuration's working directory as the service folder (the default). In production you can skip the file and set the same names as real environment variables.

Generate secrets (PowerShell):
```powershell
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | % {[char]$_})
```

### 3b. Database notes

- Tables are created by Hibernate (`ddl-auto=update`).
- Hibernate does **not** update existing CHECK constraints. If you add a value to an enum later (for example a new milestone status), update the constraint by hand.
- If you upgrade from an older database without the block feature:
  ```sql
  alter table user_schema.users add column if not exists blocked boolean not null default false;
  ```

## Run

Start the backend services in this order (each one `Main class` run in IntelliJ, or `mvn spring-boot:run` inside the service folder):

1. escrow-service
2. user-service
3. project-service
4. dispute-service
5. notification-service
6. ai-service
7. chat-service
8. api-gateway

Console shows `Started ...Application` for each. Then the frontend:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Production build: `npm run build` (output in `frontend/dist`).

## First use

1. Register a **client**, a **freelancer** and an **admin** (use three different emails; the admin is registered with role `ADMIN`, test setup only). Open the link in each verification email.
2. Client: add funds in Wallet, post a project (optionally with the AI milestone plan).
3. Freelancer: open Find work, place a bid (optionally with the AI proposal draft).
4. Client: open the project, Bids tab, Hire.
5. Client: Fund a milestone. Freelancer: Start work, then Submit. Client: Approve, and payment is released (5% fee).
6. Dispute path: Raise a dispute on a submitted milestone. Admin resolves it under Disputes.

## Milestone state machine

```
CREATED -> FUNDED -> IN_PROGRESS -> SUBMITTED -> APPROVED -> RELEASED
                                        |   ^
                                        v   |
                              REVISION_REQUESTED
SUBMITTED / REVISION_REQUESTED -> DISPUTED -> RELEASED | REFUNDED
```

- Only the client funds, approves, requests revision. Only the hired freelancer starts and submits.
- A submitted milestone is auto-approved after 7 days of no response.
- Dispute SPLIT: the freelancer's share has the platform fee deducted, the rest returns to the client.

## Gateway routes

| Path | Service |
|---|---|
| `/auth/**`, `/profile/**`, `/admin/users/**` | user-service |
| `/projects/**`, `/milestones/**`, `/users/**` | project-service |
| `/wallet/**`, `/admin/revenue/**` | escrow-service |
| `/disputes/**` | dispute-service |
| `/notifications/**` | notification-service |
| `/ai/**` | ai-service |
| `/chat/**`, `/ws-chat/**` | chat-service |
| `/internal/**` | blocked at the gateway (403) |

Public without a token: `/auth/**`. Everything else needs `Authorization: Bearer <accessToken>`.

## Security model

- Access token 15 minutes, refresh token 7 days (stored server side, revoked on logout and block).
- Frontend refreshes the access token silently and logs out after the idle timeout.
- Service-to-service endpoints (`/internal/**`) require the `X-Internal-Key` header and are not reachable through the gateway.
- Roles: `CLIENT`, `FREELANCER`, `ADMIN`, enforced with `@PreAuthorize` plus ownership checks in services.
- WebSocket: the JWT is verified on STOMP CONNECT, and subscribing to a project's topic requires being its client or hired freelancer.
- AI prompts treat user text as data, limit its length, and the AI can only suggest.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Could not resolve placeholder 'X'` | Key `X` missing in `.env`, or `.env` not found from the service's working directory |
| `jdbc:postgresql://jdbc:postgresql://...` in the log | `DB_HOST` contains a full URL. It must be the host name only |
| `password authentication failed` | `DB_PASSWORD` or `DB_USER` wrong (pooler user is `postgres.<project-id>`) |
| Connection timed out to Supabase | Use the Session pooler host (IPv4), check your network or VPN |
| `403` on `/internal/...` from a service | `INTERNAL_API_KEY` differs between services |
| `401` on every call after changing `JWT_SECRET` | Old tokens are invalid, log in again |
| Mongo `Authentication failed` or timeout | Wrong user or password in the URL, or Atlas Network Access blocks your IP |
| No emails arrive | Gmail App Password wrong or contains spaces, check Spam |
| `status_check` constraint error on milestones | Enum value added but the DB CHECK constraint was not updated |
| Frontend `Cannot reach the server` | Gateway not running, or `VITE_API_URL` wrong (restart `npm run dev` after editing `.env`) |

## Project structure

```
freelancer-escrow/
  .env                 secrets (git-ignored)
  .env.example         template (committed)
  api-gateway/
  user-service/
  project-service/
  escrow-service/
  dispute-service/
  notification-service/
  ai-service/
  chat-service/
  frontend/
```

Each service follows `controller / service / repository / entity / dto / security / config / exception`.

## Known limitations

- Wallet deposit is a **test top-up**. Replace it with a payment gateway (Razorpay, Stripe) for production.
- A blocked user's already-issued access token stays valid until it expires (up to 15 minutes); new logins and refreshes are blocked immediately.
- Admin self-registration is open for testing. Restrict it before going live.
- No automated tests, Docker files or CI yet.
- CORS origins are listed in the gateway's `CorsConfig`. Add your production frontend URL there.

## Git

```bash
git init
git branch -M main
git add .
git status                      
git commit -m "Initial commit"
git remote add origin https://github.com/RakeshHiray41/freelancer-escrow.git
git push -u origin main
```

Never commit `.env`. If a secret was ever pushed, rotate it, because it stays in the Git history.

## License

Choose a license before publishing (for example MIT) and add a `LICENSE` file.
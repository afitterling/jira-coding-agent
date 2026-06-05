# Plan: Auth (Cognito), Projekt/Credentials & öffentliches Cost-Dashboard

Status: **proposed** · Owner: Alex Fitterling · Stand: 2026-06-05

Dieser Plan bündelt die laufenden Erweiterungen am `jira-coding-agent`. Er wird
**vor** der Implementierung committet (Review-Gate). Implementierung erfolgt
inkrementell auf dem Branch `feat/auth-cost-dashboard`.

## Ziele

1. **Öffentliches Cost-Dashboard** — zeigt die AWS-Kosten *genau dieses Projekts*
   über **alle Stages**, aufgeschlüsselt nach **AWS-Position (Service)**.
2. **Signup (Cognito)** mit **E-Mail-Bestätigung** (Confirmation-Code-Mail).
3. **Login** (E-Mail + Passwort) mit Session-Cookie.
4. (Folgeschritt) **Projekt + GitHub-Repo + Credentials** pro User, Credentials
   **sicher** in AWS Secrets Manager; Einbindung in den `implement`-Flow.

## Designentscheidungen (bestätigt)

| Thema | Entscheidung |
|------|--------------|
| Auth | **AWS Cognito** (SST-nativ, `sst.aws.CognitoUserPool`) |
| Credential-Storage | **AWS Secrets Manager** (ein Secret pro Projekt) |
| Vorgehen | Plan zuerst committen, dann inkrementell implementieren |

---

## 1. Öffentliches Cost-Dashboard

**Datenquelle:** AWS Cost Explorer (`ce:GetCostAndUsage`), Region `us-east-1`.

**Scoping auf dieses Projekt:** Filter `Tags{ Key: "sst:app", Values: ["jira-coding-agent"] }`.
SST taggt jede Ressource mit `sst:app` und `sst:stage`.

**Gruppierung:** zwei Dimensionen — `TAG sst:stage` × `DIMENSION SERVICE`
→ Matrix *Stage × AWS-Service* + Monats-Trend (MONTHLY, letzte 6 Monate inkl. MTD).

**Komponenten:**
- `web/app/lib/costs.server.ts` — CE-Query + Aggregation (erstellt).
- `web/app/routes/costs.tsx` — öffentliche Route, Tabelle je Stage mit Service-Positionen,
  Grand-Total, Monats-Trend.
- `sst.config.ts` — Web-Function erhält `permissions: ["ce:GetCostAndUsage", ...]`
  und `SST_APP_NAME` als Env.

**Voraussetzung (manuell, einmalig):** Cost-Allocation-Tags `sst:app`/`sst:stage`
in **Billing → Cost allocation tags** aktivieren. Vorher liefert CE alles als
`(untagged)`; Daten haben bis zu 24 h Latenz. Das Dashboard weist darauf hin.

**Rollenbasiert (Update 2026-06-05):** Das Cost-Dashboard ist jetzt **login-pflichtig**
und rollenabhängig (ersetzt das frühere „public"):
- **Admin** (Cognito-Gruppe `admin`, gelesen aus `cognito:groups` im IdToken):
  sieht die App-weiten Kosten (alle Stages × Service) **und** die Kosten **pro Projekt**.
- **Project Owner**: sieht nur die Kosten **seiner eigenen** Projekte.

**Pro-Projekt-Zurechnung (Schätzung):** AWS-Kosten sind nur nach `sst:app`/`sst:stage`
getaggt, nicht pro Projekt. Daher:
- Jeder Runner-Dispatch erhöht einen **Usage-Zähler** je Projekt/Monat (DynamoDB
  `USAGE#<projectId>` in der Runs-Tabelle).
- **Fargate/ECS-Kosten** werden je Monat proportional zur Runner-Nutzung verteilt.
- **Geteilte Infra** (alles außer Fargate) wird **gleichmäßig je Projekt** umgelegt.
- Klar als „estimated allocation" gekennzeichnet.

## 2. Signup mit E-Mail-Bestätigung (Cognito)

**Infra (`sst.config.ts`):**
- `sst.aws.CognitoUserPool("Auth", { usernames: ["email"] })`
  - `transform.userPool`: `autoVerifiedAttributes = ["email"]` (Cognito sendet
    Confirmation-Code per Mail), `adminCreateUserConfig.allowAdminCreateUserOnly = false`
    (Self-Signup erlaubt).
- `userPool.addClient("WebClient")` mit `explicitAuthFlows` inkl.
  `ALLOW_USER_PASSWORD_AUTH` + `ALLOW_REFRESH_TOKEN_AUTH`, **ohne** Client-Secret
  (Server-side Aufruf, vermeidet SECRET_HASH-Komplexität).
- Env an Web: `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`.

**App:**
- `web/app/lib/auth.server.ts` — `signUp`, `confirmSignUp`, `resendCode`, `login`,
  Session-Cookie-Helfer (`getUser`, `commitSession`, `destroySession`).
  Nutzt `@aws-sdk/client-cognito-identity-provider`. SignUp/ConfirmSignUp/InitiateAuth
  sind **public** Cognito-APIs (keine IAM-Permission nötig).
- `web/app/routes/signup.tsx` — Formular (E-Mail, Passwort) → `SignUp` →
  Redirect `/confirm?email=…`.
- `web/app/routes/confirm.tsx` — Code-Eingabe → `ConfirmSignUp`; „Code erneut senden".

Passwort-Policy: Cognito-Default (min. 8 Zeichen, Groß-/Kleinbuchstabe, Zahl, Sonderzeichen).

## 3. Login

- `web/app/routes/login.tsx` — `InitiateAuth(USER_PASSWORD_AUTH)` → Tokens →
  httpOnly-Session-Cookie (IdToken + E-Mail), Redirect.
- `web/app/routes/logout.tsx` — Cookie löschen.
- `UserNotConfirmedException` → Redirect nach `/confirm`.

## 4. (Folgeschritt) Projekt + GitHub-Repo + Credentials

Nicht Teil des ersten Durchstichs, hier zur Vollständigkeit:
- DynamoDB-Items `T#<userSub>#PROJECT` (Jira-Host/JQL, Repo-URL, Secret-ARN-Referenzen).
- Pro Projekt ein Secrets-Manager-Secret (`jira-coding-agent/<userSub>/<projectId>`)
  mit `JIRA_TOKEN` + `GITHUB_TOKEN`. UI schreibt Secret, speichert nur den ARN in der DB.
- `loadTenants()` (src/config.ts) liest Projekte+Secrets statt `TENANTS`-Env.
- `dispatchRunner()` (src/agent.ts) injiziert Repo + Token (aus Secrets Manager) in den
  Fargate-Runner → `revise → revised`, dann User setzt `implement` → Runner checkt das
  Repo aus, implementiert, öffnet PR.

## Reihenfolge der Umsetzung

1. ✅ Plan committen (dieses Dokument).
2. Cost-Dashboard (`costs.server.ts` ✅, `costs.tsx`, SST-Permissions/Env).
3. Cognito-Userpool + Client in `sst.config.ts`.
4. `auth.server.ts` + Routes `signup` / `confirm` / `login` / `logout`.
5. Navigation/Verlinkung, `web/package.json` Deps (`@aws-sdk/client-cost-explorer`,
   `@aws-sdk/client-cognito-identity-provider`).
6. (Folgeschritt) Projekt-/Credential-Verwaltung + Secrets Manager + Runner-Verdrahtung.

## Sicherheits-Notizen

- `.env.local`/`.env.dev` bleiben gitignored — keine Secrets im Repo.
- Session-Cookie `httpOnly`, `secure` in Prod, `sameSite=lax`.
- Cost-Dashboard öffentlich, aber rein aggregierte Kostenzahlen (keine ARNs/IDs/Secrets).
- Projekt-Credentials niemals in DynamoDB/Logs — nur in Secrets Manager (Folgeschritt).

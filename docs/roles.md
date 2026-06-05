# Rollen & Zugriff

Authentifizierung läuft über **AWS Cognito** (siehe [`plan-auth-and-cost-dashboard.md`](plan-auth-and-cost-dashboard.md)).
Es gibt zwei Rollen plus anonyme Besucher.

| Rolle | Bestimmt durch | Cost-Dashboard (`/costs`) | Projekte (`/projects`) |
|-------|----------------|---------------------------|------------------------|
| **Anonym** | nicht eingeloggt | kein Zugriff → Redirect auf `/login` | kein Zugriff → `/login` |
| **Project Owner** | jeder eingeloggte User | nur die Kosten **eigener** Projekte (geschätzt) | CRUD nur auf **eigene** Projekte |
| **Admin** | Cognito-Gruppe `admin` | **alle** App-Kosten (Stages × AWS-Service) **+ Kosten pro Projekt** (alle Owner) | (wie Owner; verwaltet eigene Projekte) |

## Wie die Rolle ermittelt wird

- **Owner vs. anonym:** über das Session-Cookie (`getUser`). Ohne gültige Session
  leiten geschützte Routen auf `/login` um.
- **Admin:** aus dem Cognito-IdToken-Claim `cognito:groups`. Enthält dieser
  `"admin"`, gilt der User als Admin (`isAdmin()` in `web/app/lib/auth.server.ts`).
  Die Gruppe wird in `sst.config.ts` als `aws.cognito.UserGroup("AdminGroup", { name: "admin" })`
  angelegt.

## Owner-Sicht auf Kosten

Projekte werden über den `ownerEmail` des Projekts dem eingeloggten User
zugeordnet. Ein Owner sieht im Cost-Dashboard ausschließlich Zeilen seiner
eigenen Projekte — keine App-Summen, keine fremden Projekte.

## Pro-Projekt-Kosten (Schätzung)

AWS-Kosten sind nur nach `sst:app`/`sst:stage` getaggt, nicht pro Projekt. Daher:

- Jeder Runner-Dispatch erhöht `USAGE#<projectId>` (Monat) in der Runs-Tabelle.
- **Fargate/ECS-Kosten** je Monat werden proportional zur Runner-Nutzung verteilt.
- **Geteilte Infra** (alles außer Fargate) wird gleichmäßig je Projekt umgelegt.

Die Werte sind als **Schätzung** gekennzeichnet (UI-Hinweis „estimated").

## Admin ernennen

Einen User in die `admin`-Gruppe aufnehmen:

```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username <email> \
  --group-name admin
```

`USER_POOL_ID` steht in den SST-Outputs (`userPool`). Der User muss sich danach
**neu einloggen**, damit das neue IdToken die Gruppe enthält.

## Admin entfernen

```bash
aws cognito-idp admin-remove-user-from-group \
  --user-pool-id <USER_POOL_ID> --username <email> --group-name admin
```

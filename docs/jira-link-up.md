# Jira-Zugriff einrichten (Link-up)

So verbindest du den Agent mit deinem Jira-Board. Für Jira **Cloud** nutzt der Agent
Basic-Auth mit `E-Mail : API-Token`.

## 1. API-Token erstellen

1. Einloggen und öffnen: <https://id.atlassian.com/manage-profile/security/api-tokens>
2. **Create API token** → Label vergeben (z. B. `jira-coding-agent`).
3. Token **sofort kopieren** — er wird nur einmal angezeigt.

> Tipp: Lege optional einen eigenen Bot-Account an, statt deinen persönlichen Account
> zu verwenden. Dann sind die Agent-Aktionen im Audit-Log klar zuzuordnen.

## 2. Die drei Werte sammeln

| Variable | Was | Beispiel |
|----------|-----|----------|
| `JIRA_HOST` | deine Site-Domain (ohne `https://`) | `deine-firma.atlassian.net` |
| `JIRA_EMAIL` | die E-Mail des Accounts, zu dem der Token gehört | `bot@deine-firma.de` |
| `JIRA_TOKEN` | das eben erstellte API-Token | `ATATT3xFfGF0...` |

## 3. In `.env.local` eintragen

```bash
cp .env.local.example .env.local
```

Dann ausfüllen:

```dotenv
JIRA_HOST=deine-firma.atlassian.net
JIRA_EMAIL=bot@deine-firma.de
JIRA_TOKEN=ATATT3xFfGF0...
ANTHROPIC_API_KEY=sk-ant-...
```

SST lädt `.env.local` automatisch — die Werte landen in der Cron-Lambda.
`.env.local` ist in `.gitignore`, wird also **nicht** committet.

## 4. Berechtigungen (Permissions)

Der Account braucht im Ziel-Projekt mindestens:

- **Browse Projects** — Stories per JQL lesen
- **Add Comments** — die revidierte Spec / generierte Implementierung als Kommentar posten
- **Edit Issues** — Labels setzen/entfernen
- **Transition Issues** — nur nötig, wenn `JIRA_DRIVE_STATUS=true` (native Workflow-Statuswechsel)

Vergeben werden diese über die Projektrolle des Accounts
(Project settings → People / Permissions).

## 5. Verbindung testen

Schnelltest mit `curl` (ersetze die Platzhalter):

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
  "https://$JIRA_HOST/rest/api/3/myself" | jq '{accountId, emailAddress}'
```

Kommt dein Account zurück, stimmen Host/E-Mail/Token. Board-Query testen:

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://$JIRA_HOST/rest/api/3/search/jql" \
  -d '{"jql":"ORDER BY updated DESC","maxResults":3,"fields":["summary","labels"]}' \
  | jq '.issues[] | {key, summary: .fields.summary, labels: .fields.labels}'
```

## 6. Labels vorbereiten

Jira-Labels dürfen **kein `#`** und keine Leerzeichen enthalten — der Agent nutzt
daher Klartext-Tokens. Setze an den Stories die passenden Labels, damit der Agent
sie aufgreift:

| Stufe | Label(s) | wird zu |
|-------|----------|---------|
| Revidieren | `revise` + `undone` | `revised` |
| Umsetzen | `ready` | `implemented` |
| Testen | (automatisch ab `implemented`) | `tested` / `tests-failed` |
| QA | (automatisch ab `tested`) | `qa-passed` + `done` / `qa-failed` |

Alle Label-Namen sind via `LABEL_*` in `.env.local` überschreibbar
(siehe `.env.local.example`).

## 7. Optional: native Jira-Workflows ansteuern

Statt (oder zusätzlich zu) Labels kann der Agent Issues über deinen echten
Workflow ziehen:

```dotenv
JIRA_DRIVE_STATUS=true
STATUS_IMPLEMENTED=In Review
STATUS_TESTED=In QA
STATUS_QA_PASSED=Done
```

Die Statusnamen müssen exakt zu den Spalten/Transitions deines Boards passen.
Details: [`features.md`](features.md#label--jira-workflow-mapping).

---

> **Jira Data Center / Server** (nicht Cloud): dort heißen die Tokens *Personal
> Access Tokens* und die Auth ist `Authorization: Bearer <PAT>` statt Basic-Auth.
> Der Agent ist aktuell auf Cloud (Basic-Auth) ausgelegt — für DC müsste der
> Auth-Header in `src/jira.ts` angepasst werden.

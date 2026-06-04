# Tenant isolation

The agent is multi-tenant: one deployment can serve several Jira sites / customers,
with **no data, credential, or compute bleed** between them. This doc explains how
isolation is enforced at each layer and how to operate it.

## What a tenant is

A tenant = one isolated unit of work with its own:

- Jira site + credentials (`jiraHost`, `jiraEmail`, `jiraToken`)
- board query (`jql`)
- target repository the coding agent works on (`targetRepo`)
- model (`model`, optional)

Defined in `src/config.ts` (`Tenant`), loaded by `loadTenants()`.

## Configuring tenants

**Single-tenant** (default) — just set `JIRA_*` in `.env.local`; the tenant id is
`default` (or `TENANT_ID`).

**Multi-tenant** — set `TENANTS` to a JSON array:

```jsonc
// .env.local — TENANTS='[…]'
[
  {
    "id": "acme",
    "jiraHost": "acme.atlassian.net",
    "jiraEmail": "bot@acme.com",
    "jiraToken": "ATATT-acme…",
    "targetRepo": "https://github.com/acme/app",
    "model": "claude-opus-4-8"
  },
  {
    "id": "globex",
    "jiraHost": "globex.atlassian.net",
    "jiraEmail": "bot@globex.com",
    "jiraToken": "ATATT-globex…",
    "targetRepo": "https://github.com/globex/web"
  }
]
```

Also set `TENANT_IDS=acme,globex` so the dashboard shows a tenant selector.

> **Production:** don't inline tokens in `TENANTS`. Resolve each tenant's
> `jiraToken` / GitHub token from a per-tenant secret (AWS Secrets Manager or SSM
> path like `/agent/<tenant>/jira-token`) at load time. See "Hardening" below.

## Isolation by layer

| Layer | How it's isolated | Where |
|-------|-------------------|-------|
| **Credentials** | Each tenant gets its own Jira client built from *its* auth; creds are never shared in a global. A runner task receives only one tenant's creds. | `createJira(auth)` in `src/jira.ts`; `dispatchRunner` in `src/agent.ts` |
| **Data (run log)** | Every DynamoDB item is keyed `T#<tenantId>#…`. Dashboard queries are scoped to one tenant's partition — a query can't return another tenant's runs. | `src/store.ts`, `web/app/lib/runs.server.ts` |
| **Processing** | The pipeline runs per tenant with isolated `Run`/client state; one tenant's failure is caught and never aborts another. | `runTenant()` in `src/agent.ts` |
| **Compute (code work)** | Each `#ready` story is dispatched to its **own Fargate task** — a separate microVM, no shared filesystem or process. Tenant creds + repo are injected per-task at `task.run()`, never baked into the image. | `sst.aws.Task` "Runner"; `runner/index.mjs` |
| **Network** | The runner clones only its tenant's repo using that tenant's token; egress via the VPC NAT. | `runner/index.mjs`, `sst.config.ts` (`Vpc`) |

### Why per-task compute matters

Running each story in its own ephemeral Fargate task means a tenant's generated code
executes in a microVM that is created for that task and destroyed after — it shares no
disk, memory, or env with any other tenant's run. This is the strongest isolation
short of separate AWS accounts.

## Threat model & guarantees

- ✅ Tenant A cannot read Tenant B's run log (key-prefix scoping).
- ✅ Tenant A's credentials are never present in Tenant B's task environment.
- ✅ A crash/exception in one tenant's pipeline doesn't stop the others.
- ✅ Generated/untrusted code runs in a throwaway microVM, not the agent's own host.
- ⚠️ **Dashboard has no auth yet** — anyone with the URL can switch the tenant
  selector and view any tenant's log. Add auth before exposing it (see TODO.md).
- ⚠️ Single shared `ANTHROPIC_API_KEY` by default — billing/quota is pooled. Use a
  per-tenant key if you need usage isolation (extend `createLlm`).

## Hardening levels (pick per compliance need)

1. **Logical (default, implemented):** key-prefix data scoping + per-task creds +
   per-task microVM. Good for most SaaS.
2. **Secret-store isolation:** per-tenant secrets in Secrets Manager/SSM with IAM
   policies scoped per tenant path; load lazily in `loadTenants()`.
3. **Network isolation:** per-tenant security groups / subnets, or egress allow-lists
   restricting each runner to its tenant's git host.
4. **Account isolation (strongest):** a separate AWS account (or SST stage) per
   tenant — full blast-radius separation. Trade-off: more ops + cost.

## Operating notes

- The transient `agent-dispatched` label prevents a `#ready` story from being
  dispatched twice while its runner is mid-flight; the runner clears it on
  success (after `implemented`) or failure (to allow retry).
- Tenants run sequentially in one cron tick today. For large fleets, parallelize
  `runAgent()` across tenants (bounded concurrency) — they're independent.

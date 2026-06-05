/**
 * English copy — the source of truth for the content dictionary.
 *
 * `Content = typeof en` (see `index.ts`), so `de.ts` is structurally
 * type-checked against this file: a missing or renamed key fails `tsc`.
 *
 * Only translatable prose lives here. Display metadata (Tailwind classes,
 * icon glyphs, tones, `src` paths, step numbers) and brand/hashtag tokens
 * (`#ready`, Jira, Claude Opus, Synapse, Human Override, PR, board IDs,
 * terminal lines) stay in the components.
 */
export const en = {
  meta: {
    title: "Agentic Coding with Jira — sp33c",
    description:
      "sp33c builds agentic coding with Jira: label a story #ready and an autonomous Claude Opus agent implements it, runs tests + QA, and opens a PR. Human Override keeps you in command.",
    ogTitle: "Agentic Coding with Jira — sp33c",
    ogDescription:
      "Agentic coding with Jira by sp33c — implement, test, QA, PR. Autonomy you can veto.",
  },

  nav: {
    links: [
      "How it works",
      "Human Override",
      "AI Models",
      "Use cases",
      "Synapse",
      "About",
    ],
    cta: "See the flow",
    github: "GitHub",
    toggleLabel: "Language",
    menuAria: "Toggle navigation",
  },

  hero: {
    badgeSuffix: "Agentic coding · Human Override",
    titleA: "Agentic coding.",
    titleB: "Driven by Jira.",
    leadP1: "Write the story. Label it ",
    leadP2:
      ". An autonomous Claude Opus agent picks it up, implements it, runs tests and QA, and opens a pull request — your spec becomes shipped code. With ",
    leadLink: "Human Override",
    leadP3: ", a human stays in command of every irreversible step.",
    ctaPrimary: "See how it works",
    ctaGhost: "Human Override",
    stats: [
      ["2 min", "cron cadence"],
      ["1 microVM", "per story, isolated"],
      ["100%", "PR-gated review"],
    ],
    visual: {
      board: "board: Kanban · agent run #284",
      story: "Add rate-limit headers to the public API",
      ac: "AC: return X-RateLimit-* on every 200/429; cover with tests.",
      connector: "agent implements →",
      implemented: "implemented · 4 files changed",
      testsPassed: "tests passed",
      qa: "QA: edge cases + regressions clean",
      openedPr: "opened PR",
    },
  },

  howItWorks: {
    tag: "How it works",
    heading: "A story in. A pull request out.",
    intro:
      "The whole pipeline is label-driven. You move a label; the agent does the rest and hands you a reviewable diff.",
    steps: [
      {
        title: "Write a Jira story",
        body: "A normal story on your Kanban board — summary, description, acceptance criteria. No special tooling, no new workflow to learn.",
      },
      {
        title: "Label it #ready",
        body: "Flip the label when the spec is good to build. That label is the trigger — the agent treats acceptance criteria as the contract.",
      },
      {
        title: "The agent picks it up",
        body: "A cron tick (every ~2 min) docks the board, finds #ready stories, and dispatches each to its own isolated Fargate microVM.",
      },
      {
        title: "Implement · test · QA",
        body: "Claude Opus clones the repo, writes the code, derives tests from the AC, then runs a QA gate for edge cases and regressions.",
      },
      {
        title: "Open a pull request",
        body: "Passing work lands on a branch and opens a PR, with a summary posted back to the Jira ticket. Everything is traceable.",
      },
      {
        title: "You review & merge",
        body: "Nothing ships without you. The human gate is the PR — approve, request changes, or send it back with #revise.",
      },
    ],
    reviseTitle: "Specs can be sharpened first",
    reviseP1: "Stories marked ",
    reviseP2: " + ",
    reviseP3:
      " get a refinement pass — the agent tightens acceptance criteria, then marks them ",
    reviseP4: " before any code is written.",
  },

  humanLoop: {
    badge: "Human Override",
    titleLead: "Autonomy you can ",
    titleAccent: "veto.",
    intro:
      "A man in the loop, by design. The agent does the relentless work — reading, revising, coding, testing — but a human owns every irreversible decision. Five checkpoints keep you in command without slowing the machine down.",
    touchpoints: [
      {
        title: "Approve the spec",
        body: "The agent rewrites each story into testable acceptance criteria. You read the revised spec before it goes anywhere.",
      },
      {
        title: "Open the gate",
        body: "Nothing gets built until a human labels it. The #ready label is your explicit go — autonomy starts only when you say so.",
      },
      {
        title: "Review the PR",
        body: "Every change lands as a pull request, never a direct push. You merge — or you don't. The agent ships nothing on its own.",
      },
      {
        title: "Override QA",
        body: "Test and QA gates run automatically, but their verdict is advisory. Your call beats the model's every time.",
      },
      {
        title: "Pull the cord",
        body: "Drop a label to pause, re-route, or kill a story mid-flight. The loop reacts on the next 2-minute tick.",
      },
    ],
    closingP1: "The agent is the workforce.",
    closingP2: "You stay the decision-maker.",
    closingNote: "ship at machine speed · approve at human judgement",
  },

  interfaces: {
    badge: "AI Interfaces",
    titleLead: "Plug in ",
    titleAccent: "any model.",
    intro:
      "The agent is model-agnostic. Run frontier Claude in the cloud, keep everything inside your AWS account with Bedrock, or go fully local with LM Studio — same pipeline, your choice of brain.",
    items: [
      {
        tag: "default",
        body: "Claude Opus drives the agent out of the box — the sharpest coding model for spec-to-PR work.",
      },
      {
        tag: "managed",
        body: "Route to Bedrock for Claude, Llama, or Mistral inside your own AWS account, VPC, and compliance boundary.",
      },
      {
        tag: "local",
        body: "Point the agent at a local LM Studio endpoint — fully offline. Your code and prompts never leave the building.",
      },
    ],
    calloutTitle: "Every agent runs isolated on AWS Fargate",
    calloutBody:
      "Each story is implemented in its own ephemeral Fargate microVM — separate compute, filesystem, and credentials. No shared state between runs or tenants.",
  },

  useCases: {
    badge: "Beyond coding",
    titleLead: "One agentic engine. ",
    titleAccent: "Any mission.",
    intro:
      "The same label-driven, human-in-the-loop loop that ships code can run investment research, data pipelines, and back-office workflows — then store and analyse everything it produces.",
    items: [
      {
        title: "Agentic coding",
        body: "The flagship: a Jira story labelled #ready becomes a tested, QA'd, reviewed pull request.",
      },
      {
        title: "Investing & capital markets",
        body: "Screen, research, and analyse opportunities — ethical investing and market intelligence, agents gathering and reasoning over the data.",
      },
      {
        title: "Workflows beyond",
        body: "Any label-driven workflow — ops, compliance, content, research. Model the states as labels and let agents drive them, human-gated.",
      },
      {
        title: "Store & analyse",
        body: "Every run and artifact is persisted — query it, dashboard it, and analyse outcomes over time to sharpen the next run.",
      },
    ],
  },

  dataConnectivity: {
    badge: "Data Connectivity",
    titleLead: "Synapse — ",
    titleAccent: "wired into your data.",
    introP1: "Agents are only as good as what they can reach. ",
    introName: "Synapse",
    introP2:
      " is the connective layer: plug in a source, it gets ingested, normalised, stored, and reasoned over — then delivered through any of the output interfaces below.",
    pipeline: ["Connect", "Ingest", "Normalise", "Store & Index", "Reason", "Deliver"],
    inputsHeading: "Plugged in — input connectors",
    connectors: [
      {
        title: "All kinds of databases",
        body: "SQL, NoSQL, and warehouses — read context and write results back to your system of record.",
      },
      {
        title: "APIs & webhooks",
        body: "Pull live data and push outcomes across the tools you already run.",
      },
      {
        title: "Object storage & files",
        body: "Ingest documents, datasets, and artifacts at any scale.",
      },
      {
        title: "Streaming & feeds",
        body: "React in near-real-time to events, queues, and market data.",
      },
    ],
    outputsHeading: "Delivered — output interfaces",
    outputsCount: "interfaces",
    outputs: [
      { title: "Pull requests", body: "Reviewed code changes opened on GitHub." },
      {
        title: "Jira write-back",
        body: "Comments, labels, and workflow transitions on the source story.",
      },
      {
        title: "Live dashboard",
        body: "Every run + event streamed to the Remix dashboard.",
      },
      {
        title: "Webhooks & Slack",
        body: "Push events and notifications to your channels.",
      },
      {
        title: "Database write-back",
        body: "Results persisted to Postgres, Snowflake, or BigQuery.",
      },
      { title: "File exports", body: "CSV / Parquet / JSON written to S3 or Blob." },
      {
        title: "REST / GraphQL API",
        body: "Query runs, artifacts, and analyses programmatically.",
      },
    ],
  },

  diagrams: {
    tag: "Architecture, in diagrams",
    heading: "No black box. Every gate is mapped.",
    intro:
      "These are the actual flow diagrams that ship in the repo — the same logic the agentic pipeline executes on each run.",
    tablistAria: "Flow diagrams",
    openFull: "Open full diagram",
    items: [
      {
        tab: "System flow",
        title: "The end-to-end pipeline",
        caption:
          "Authenticate → fetch the board → revise specs → execute #ready stories → label + open PR → report. The full label-driven loop the agent runs every cron tick.",
      },
      {
        tab: "Testing sub-flow",
        title: "The testing gate",
        caption:
          "After #implemented, the agent derives test cases from the acceptance criteria and judges the implementation — passing to #tested, failing to #tests-failed.",
      },
      {
        tab: "QA sub-flow",
        title: "The QA gate",
        caption:
          "A #tested story is validated for completeness, edge cases, and regressions — promoted to #qa-passed + #done, or sent back as #qa-failed.",
      },
    ],
  },

  features: {
    tag: "Capabilities",
    heading: "Built like infrastructure, not a demo.",
    intro:
      "Runs on SST / AWS — cron, DynamoDB run log, Fargate runner, and a Remix dashboard, linked together around an autonomous agent.",
    badge: "Agentic AI",
    items: [
      {
        title: "Agentic AI, end to end",
        body: "This is autonomous agentic AI — not autocomplete. Claude Opus plans, edits across files, runs commands, reads test output, and self-corrects until the acceptance criteria are met. Each #ready story runs the Claude Code CLI inside its own Fargate task: clone → code → test → PR.",
        bullets: ["agent orchestration", "tool use + self-correction", "Claude Code CLI"],
      },
      {
        title: "Jira workflow integration",
        body: "Label-driven by default. Optionally mirror outcomes onto your native Jira workflow — implemented → In Review, tested → In QA, qa-passed → Done — with JIRA_DRIVE_STATUS.",
        bullets: [],
      },
      {
        title: "Testing + QA sub-flows",
        body: "Two automated gates after implementation: a testing gate that derives cases from the AC, and a QA gate for edge cases and regressions.",
        bullets: ["#implemented → #tested", "#tested → #qa-passed + #done"],
      },
      {
        title: "Tenant isolation",
        body: "One deployment serves many Jira sites with no data, credential, or compute bleed. Run-log keys are tenant-prefixed; each story executes in its own throwaway microVM with only its tenant's creds.",
        bullets: ["key-prefixed run log", "per-task creds + microVM", "crash isolation per tenant"],
      },
      {
        title: "Live run dashboard",
        body: "A Remix dashboard visualizes runs and events per tenant, auto-refreshing every 15s so you can watch the agent work in real time.",
        bullets: [],
      },
      {
        title: "PR-gated, traceable",
        body: "Nothing merges autonomously. Work lands as a branch + PR with a summary posted back to the ticket — humans stay the final gate.",
        bullets: [],
      },
    ],
  },

  screenshots: {
    tag: "See it in motion",
    heading: "From the board to the dashboard.",
    intro:
      "Stories move across your Kanban board; the agent dashboard shows every run and event as it happens.",
    boardLabel: "your-team.atlassian.net · Kanban board",
    dashboardLabel: "agent dashboard · auto-refresh 15s",
    footnote:
      "Representative product mockups — swap in real screenshots when you deploy.",
    columns: ["Ready", "In Review", "In QA", "Done"],
    cards: [
      "Rate-limit headers on public API",
      "Paginate the audit log endpoint",
      "Webhook retry with backoff",
      "CSV export for invoices",
      "SSO logout redirect fix",
    ],
    dashboard: {
      liveRuns: "Live runs",
      tenant: "tenant: sp33c",
      notes: [
        "implementing · tests 8/12",
        "opened PR #318",
        "edge cases clean",
        "merged · qa-passed",
      ],
      stats: [
        ["12", "runs today"],
        ["3", "PRs opened"],
        ["0", "failures"],
      ],
    },
  },

  about: {
    tag: "Who builds this",
    headingLead: "Made by ",
    headingName: "sp33c",
    leadName: "Alex Fitterling",
    leadRest:
      " is an engineer and architect with deep expertise across Cyber Security, Security Architecture, AI, Cloud, and DevOps — designing and delivering secure, scalable solutions for private and public sector clients.",
    p2: "He has led cross-functional teams as a Solution Engineer, Security Architect, Product Owner, and Scrum Master — working across Switzerland, Singapore, Malaysia, and Germany.",
    p3a: "His focus on ",
    p3focus: "Agentic & Generative AI",
    p3b: " — AI agents, orchestration, and LLM-driven systems — is exactly what powers this project: an autonomous coding agent that turns a Jira backlog into reviewed, shipped code.",
    ctaVisit: "Visit sp33c.tech",
    ctaEmail: "info@sp33c.tech",
    focusTitle: "Focus areas",
    focus: [
      "Agentic & Generative AI",
      "AI Agents & Orchestration",
      "LLMs, RAG & Prompt Engineering",
      "Security Architecture & Cyber Security",
      "Zero Trust & IAM",
      "Cloud-native Engineering (AWS · Azure · GCP)",
      "Critical Infrastructure & KRITIS Energy",
      "AI for Ethical Investing & Capital Markets",
    ],
    location: "Nuremberg, Germany",
    locationSpread: "Across Switzerland · Singapore · Malaysia · Germany",
  },

  footer: {
    ctaHeading: "Your backlog is already the spec.",
    ctaBodyP1: "Point the agentic AI at a board, label a story ",
    ctaBodyP2: ", and review the PR it opens.",
    ctaPrimary: "Get the source",
    ctaGhost: "Revisit the flow",
    blurb:
      "sp33c builds agentic coding with Jira — an autonomous Claude Opus agent that turns stories into reviewed pull requests, with Human Override keeping you in command.",
    projectHeading: "Project",
    projectLinks: {
      repo: "GitHub repository",
      docs: "Documentation",
      diagram: "System flow diagram",
      site: "sp33c.tech",
    },
    contactHeading: "Contact",
    license: "Licensed under the",
    licenseName: "GNU General Public License v3.0",
    tagline: "Agentic coding with Jira · sp33c · Nuremberg",
  },

  deck: {
    sectionNavAria: "Section navigation",
    goToSection: "Go to section",
    prev: "Previous section",
    next: "Next section",
    nextLabel: "Next",
    hintP1: "Click anywhere · press ",
    hintP2: " · or scroll to explore",
  },
};

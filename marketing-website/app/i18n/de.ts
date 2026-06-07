/**
 * German copy. Typed as {@link Content} so `tsc` proves it has exactly the
 * same keys as `en.ts` — a missing or extra field is a compile error.
 *
 * Brand/product terms stay English by design (Jira, Claude Opus, Pull Request,
 * PR, Human Override, Synapse, hashtag labels), the surrounding prose is German.
 */
import type { Content } from "~/i18n/index";

export const de: Content = {
  meta: {
    title: "Agentic",
    description:
      "sp33c baut agentisches Coding mit Jira: Versehen Sie eine Story mit #ready, und ein autonomer Claude-Opus-Agent implementiert sie, führt Tests + QA aus und öffnet einen PR. Human Override behält die Kontrolle.",
    ogTitle: "Agentic — agentisches Coding, gesteuert von Jira",
    ogDescription:
      "Agentisches Coding mit Jira von sp33c — implementieren, testen, QA, PR. Autonomie, die Sie per Veto stoppen.",
  },

  nav: {
    links: [
      "So funktioniert's",
      "Human Override",
      "KI-Modelle",
      "Anwendungsfälle",
      "Synapse",
      "FAQ",
      "Über uns",
    ],
    pricing: "Preise",
    cta: "Den Ablauf ansehen",
    start: "Loslegen",
    github: "GitHub",
    toggleLabel: "Sprache",
    menuAria: "Navigation umschalten",
  },

  hero: {
    badgeSuffix: "Agentic Coding · Human Override",
    titleA: "Agentisches Coding.",
    titleB: "Gesteuert von Jira.",
    leadP1: "Schreiben Sie die Story. Versehen Sie sie mit ",
    leadP2:
      ". Ein autonomer Claude-Opus-Agent übernimmt sie, implementiert sie, führt Tests und QA aus und öffnet einen Pull Request — aus Ihrer Spezifikation wird ausgelieferter Code. Mit ",
    leadLink: "Human Override",
    leadP3: " behält ein Mensch die Kontrolle über jeden unumkehrbaren Schritt.",
    ctaPrimary: "So funktioniert's",
    ctaGhost: "Human Override",
    ctaPricing: "Preise",
    stats: [
      ["2 Min.", "Cron-Takt"],
      ["1 microVM", "pro Story, isoliert"],
      ["100 %", "PR-geprüft"],
    ],
    visual: {
      board: "Board: Kanban · Agent-Lauf #284",
      story: "Rate-Limit-Header zur öffentlichen API hinzufügen",
      ac: "AK: X-RateLimit-* bei jedem 200/429 zurückgeben; mit Tests abdecken.",
      connector: "Agent implementiert →",
      implemented: "implementiert · 4 Dateien geändert",
      testsPassed: "Tests bestanden",
      qa: "QA: Edge-Cases + Regressionen sauber",
      openedPr: "PR geöffnet",
    },
  },

  howItWorks: {
    tag: "So funktioniert's",
    heading: "Eine Story rein. Ein Pull Request raus.",
    intro:
      "Die gesamte Pipeline ist label-gesteuert. Sie verschieben ein Label; den Rest erledigt der Agent und übergibt Ihnen ein prüfbares Diff.",
    steps: [
      {
        title: "Jira-Story schreiben",
        body: "Eine normale Story auf Ihrem Kanban-Board — Zusammenfassung, Beschreibung, Akzeptanzkriterien. Kein Spezial-Tooling, kein neuer Workflow zu lernen.",
      },
      {
        title: "Mit #ready labeln",
        body: "Setzen Sie das Label, sobald die Spezifikation baureif ist. Dieses Label ist der Auslöser — der Agent behandelt die Akzeptanzkriterien als Vertrag.",
      },
      {
        title: "Der Agent übernimmt",
        body: "Ein Cron-Takt (alle ~2 Min.) dockt am Board an, findet #ready-Stories und schickt jede in ihre eigene isolierte Fargate-microVM.",
      },
      {
        title: "Implementieren · Testen · QA",
        body: "Claude Opus klont das Repo, schreibt den Code, leitet Tests aus den AK ab und durchläuft dann ein QA-Gate für Edge-Cases und Regressionen.",
      },
      {
        title: "Pull Request öffnen",
        body: "Bestandene Arbeit landet auf einem Branch und öffnet einen PR, mit einer Zusammenfassung zurück im Jira-Ticket. Alles ist nachvollziehbar.",
      },
      {
        title: "Sie prüfen & mergen",
        body: "Nichts geht ohne Sie live. Das menschliche Gate ist der PR — freigeben, Änderungen anfordern oder mit #revise zurückschicken.",
      },
    ],
    reviseTitle: "Specs lassen sich vorab schärfen",
    reviseP1: "Mit ",
    reviseP2: " + ",
    reviseP3:
      " markierte Stories durchlaufen einen Verfeinerungslauf — der Agent schärft die Akzeptanzkriterien und markiert sie dann als ",
    reviseP4: ", bevor Code geschrieben wird.",
  },

  humanLoop: {
    badge: "Human Override",
    titleLead: "Autonomie, die Sie per ",
    titleAccent: "Veto stoppen.",
    intro:
      "Ein Mensch in der Schleife, von Grund auf. Der Agent leistet die unermüdliche Arbeit — lesen, überarbeiten, programmieren, testen — doch ein Mensch verantwortet jede unumkehrbare Entscheidung. Fünf Kontrollpunkte halten Sie am Steuer, ohne die Maschine zu bremsen.",
    touchpoints: [
      {
        title: "Spec freigeben",
        body: "Der Agent schreibt jede Story in testbare Akzeptanzkriterien um. Sie lesen die überarbeitete Spec, bevor irgendetwas passiert.",
      },
      {
        title: "Das Gate öffnen",
        body: "Es wird nichts gebaut, bevor ein Mensch labelt. Das #ready-Label ist Ihr ausdrückliches Go — Autonomie startet erst, wenn Sie es sagen.",
      },
      {
        title: "Den PR prüfen",
        body: "Jede Änderung landet als Pull Request, nie als direkter Push. Sie mergen — oder eben nicht. Der Agent liefert nichts von allein aus.",
      },
      {
        title: "QA überstimmen",
        body: "Test- und QA-Gates laufen automatisch, doch ihr Urteil ist beratend. Ihre Entscheidung schlägt jedes Mal die des Modells.",
      },
      {
        title: "Die Reißleine ziehen",
        body: "Setzen Sie ein Label, um eine Story mitten im Lauf zu pausieren, umzuleiten oder zu stoppen. Die Schleife reagiert beim nächsten 2-Minuten-Takt.",
      },
    ],
    closingP1: "Der Agent ist die Belegschaft.",
    closingP2: "Sie bleiben der Entscheider.",
    closingNote: "in Maschinengeschwindigkeit liefern · nach menschlichem Urteil freigeben",
  },

  cognition: {
    tag: "Kontrollierte Kognition",
    titleLead: "Ein unermüdlicher Verstand. ",
    titleAccent: "An Ihrer Leine.",
    intro:
      "Jeder Lauf ist eine geschlossene kognitive Schleife — wahrnehmen, interpretieren, entscheiden, handeln, lernen. In ihrem Zentrum sitzt der Cognition Core: das Master-Brain, das Eingaben aus jedem Modul bündelt — und der eine Core, mit dem Sie interagieren. Er verankert jeden Durchlauf an einem Ziel, bleibt innerhalb der Grenzen, die Sie setzen, denkt in Maschinengeschwindigkeit und nie über die Linien hinaus.",
    coreLabel: "Cognition Core",
    coreTagline: "der Core, mit dem Sie interagieren",
    centerLines: ["Ziel /", "Kontext /", "Aufgabe"],
    stages: [
      {
        name: "Wahrnehmen",
        body: "Liest die Jira-Story, das Repo und die Akzeptanzkriterien — den vollständigen Zustand der Welt, in der gehandelt wird.",
      },
      {
        name: "Interpretieren",
        body: "Verwandelt rohen Kontext in Bedeutung: was die Spezifikation wirklich verlangt und was die Codebasis bereits leistet.",
      },
      {
        name: "Schlussfolgern / Entscheiden",
        body: "Plant die Änderung, wägt Trade-offs ab und wählt den kürzesten Weg zu einem bestandenen Pull Request.",
      },
      {
        name: "Handeln",
        body: "Schreibt den Code, führt die Tests aus und öffnet den PR — Arbeit, kein Geschwätz, in einer isolierten microVM.",
      },
      {
        name: "Lernen / Aktualisieren",
        body: "Führt Test-, QA- und Review-Feedback in den nächsten Durchlauf zurück — geschärft bei jedem #revise.",
      },
    ],
    boundaryLabel: "Human-Override-Grenze",
    boundaryTitle: "Die Schleife läuft innerhalb Ihrer Linien.",
    boundaryBody:
      "Labels öffnen das Gate, der Pull Request ist die Wand, und Ihr Veto stoppt die Schleife beim nächsten 2-Minuten-Takt. Autonomie ist der Motor; Ihre Grenze ist das Chassis.",
  },

  interfaces: {
    badge: "KI-Schnittstellen",
    titleLead: "Binden Sie ",
    titleAccent: "jedes Modell ein.",
    intro:
      "Der Agent ist modellagnostisch. Lassen Sie Frontier-Claude in der Cloud laufen, halten Sie mit Bedrock alles in Ihrem AWS-Konto, oder gehen Sie mit LM Studio voll lokal — dieselbe Pipeline, Ihre Wahl des Gehirns.",
    items: [
      {
        tag: "Standard",
        body: "Claude Opus steuert den Agenten von Haus aus — das schärfste Coding-Modell für Spec-zu-PR-Arbeit.",
      },
      {
        tag: "Managed",
        body: "Leiten Sie zu Bedrock für Claude, Llama oder Mistral innerhalb Ihres eigenen AWS-Kontos, VPC und Compliance-Rahmens.",
      },
      {
        tag: "Lokal",
        body: "Richten Sie den Agenten auf einen lokalen LM-Studio-Endpunkt — voll offline. Ihr Code und Ihre Prompts verlassen nie das Haus.",
      },
    ],
    calloutTitle: "Jeder Agent läuft isoliert auf AWS Fargate",
    calloutBody:
      "Jede Story wird in ihrer eigenen kurzlebigen Fargate-microVM implementiert — getrennte Compute-, Dateisystem- und Credential-Umgebung. Kein geteilter Zustand zwischen Läufen oder Mandanten.",
  },

  useCases: {
    badge: "Über Coding hinaus",
    titleLead: "Eine agentische Engine. ",
    titleAccent: "Jede Mission.",
    intro:
      "Dieselbe label-gesteuerte Human-in-the-Loop-Schleife, die Code ausliefert, kann Investment-Recherche, Daten-Pipelines, Retrieval-Augmented Generation und komplexe LLM-Query-Workflows betreiben — und dann alles Erzeugte speichern und analysieren.",
    items: [
      {
        title: "Agentisches Coding",
        body: "Das Flaggschiff: Eine mit #ready gelabelte Jira-Story wird zu einem getesteten, QA-geprüften, reviewten Pull Request.",
      },
      {
        title: "RAG & komplexe LLM-Queries",
        body: "Haystack- und LangChain-Pipelines laufen auf isolierten Fargate-Tasks, sodass Agenten Domänenkontext abrufen, Prompts anreichern und über mehrstufige Fragen schlussfolgern können.",
      },
      {
        title: "Investment & Kapitalmärkte",
        body: "Chancen screenen, recherchieren und analysieren — ethisches Investieren und Marktintelligenz, mit Agenten, die Daten sammeln und über sie schlussfolgern.",
      },
      {
        title: "Workflows darüber hinaus",
        body: "Jeder label-gesteuerte Workflow — Ops, Compliance, Content, Recherche. Modellieren Sie die Zustände als Labels und lassen Sie Agenten sie steuern, menschlich kontrolliert.",
      },
      {
        title: "Speichern & analysieren",
        body: "Jeder Lauf und jedes Artefakt wird persistiert — abfragen, im Dashboard anzeigen und Ergebnisse über die Zeit analysieren, um den nächsten Lauf zu schärfen.",
      },
    ],
  },

  dataConnectivity: {
    badge: "Datenanbindung",
    titleLead: "Synapse — ",
    titleAccent: "in Ihre Daten verdrahtet.",
    introP1: "Agenten sind nur so gut wie das, was sie erreichen können. ",
    introName: "Synapse",
    introP2:
      " ist die verbindende Schicht: Binden Sie eine Quelle an, sie wird ingestiert, normalisiert, für Retrieval indiziert und mit Haystack + LangChain auf Fargate durchdacht — und dann über jede der Ausgabe-Schnittstellen unten ausgeliefert.",
    pipeline: ["Anbinden", "Ingestieren", "Normalisieren", "Speichern & Indizieren", "Schlussfolgern", "Ausliefern"],
    inputsHeading: "Angebunden — Eingangs-Konnektoren",
    connectors: [
      {
        title: "Datenbanken aller Art",
        body: "SQL, NoSQL und Warehouses — Kontext lesen und Ergebnisse zurück in Ihr System of Record schreiben.",
      },
      {
        title: "APIs & Webhooks",
        body: "Live-Daten ziehen und Ergebnisse über die Tools verteilen, die Sie bereits betreiben.",
      },
      {
        title: "Object Storage & Dateien",
        body: "Dokumente, Datensätze und Artefakte in jeder Größenordnung ingestieren.",
      },
      {
        title: "Streaming & Feeds",
        body: "Nahezu in Echtzeit auf Events, Queues und Marktdaten reagieren.",
      },
    ],
    outputsHeading: "Ausgeliefert — Ausgabe-Schnittstellen",
    outputsCount: "Schnittstellen",
    outputs: [
      { title: "Pull Requests", body: "Reviewte Code-Änderungen, auf GitHub geöffnet." },
      {
        title: "Jira-Rückschreibung",
        body: "Kommentare, Labels und Workflow-Übergänge an der Ausgangs-Story.",
      },
      {
        title: "Live-Dashboard",
        body: "Jeder Lauf + jedes Event ins Remix-Dashboard gestreamt.",
      },
      {
        title: "Webhooks & Slack",
        body: "Events und Benachrichtigungen in Ihre Kanäle pushen.",
      },
      {
        title: "Datenbank-Rückschreibung",
        body: "Ergebnisse in Postgres, Snowflake oder BigQuery persistiert.",
      },
      { title: "Datei-Exporte", body: "CSV / Parquet / JSON nach S3 oder Blob geschrieben." },
      {
        title: "REST- / GraphQL-API",
        body: "Läufe, Artefakte und Analysen programmatisch abfragen.",
      },
    ],
  },

  diagrams: {
    tag: "Architektur, in Diagrammen",
    heading: "Keine Blackbox. Jedes Gate ist abgebildet.",
    intro:
      "Dies sind die tatsächlichen Ablaufdiagramme aus dem Repo — dieselbe Logik, die die agentische Pipeline bei jedem Lauf ausführt.",
    tablistAria: "Ablaufdiagramme",
    openFull: "Vollständiges Diagramm öffnen",
    items: [
      {
        tab: "System-Ablauf",
        title: "Die Ende-zu-Ende-Pipeline",
        caption:
          "Authentifizieren → Board abrufen → Specs überarbeiten → #ready-Stories ausführen → labeln + PR öffnen → berichten. Die vollständige label-gesteuerte Schleife, die der Agent bei jedem Cron-Takt durchläuft.",
      },
      {
        tab: "Test-Subflow",
        title: "Das Test-Gate",
        caption:
          "Nach #implemented leitet der Agent Testfälle aus den Akzeptanzkriterien ab und bewertet die Implementierung — bestanden zu #tested, gescheitert zu #tests-failed.",
      },
      {
        tab: "QA-Subflow",
        title: "Das QA-Gate",
        caption:
          "Eine #tested-Story wird auf Vollständigkeit, Edge-Cases und Regressionen validiert — befördert zu #qa-passed + #done oder als #qa-failed zurückgeschickt.",
      },
    ],
  },

  features: {
    tag: "Fähigkeiten",
    heading: "Gebaut wie Infrastruktur, nicht wie ein Demo.",
    intro:
      "Läuft auf SST / AWS — Cron, DynamoDB-Run-Log, Fargate-Runner und ein Remix-Dashboard, rund um einen autonomen Agenten verbunden.",
    badge: "Agentic AI",
    items: [
      {
        title: "Agentic AI, Ende zu Ende",
        body: "Das ist autonome agentische KI — kein Autocomplete. Claude Opus plant, editiert über Dateien hinweg, führt Befehle aus, liest Test-Ausgaben und korrigiert sich selbst, bis die Akzeptanzkriterien erfüllt sind. Jede #ready-Story führt die Claude Code CLI in ihrer eigenen Fargate-Task aus: clone → code → test → PR.",
        bullets: ["Agent-Orchestrierung", "Tool-Nutzung + Selbstkorrektur", "Claude Code CLI"],
      },
      {
        title: "Jira-Workflow-Integration",
        body: "Standardmäßig label-gesteuert. Optional spiegeln Sie Ergebnisse auf Ihren nativen Jira-Workflow — implemented → In Review, tested → In QA, qa-passed → Done — per JIRA_DRIVE_STATUS.",
        bullets: [],
      },
      {
        title: "Test- + QA-Subflows",
        body: "Zwei automatische Gates nach der Implementierung: ein Test-Gate, das Fälle aus den AK ableitet, und ein QA-Gate für Edge-Cases und Regressionen.",
        bullets: ["#implemented → #tested", "#tested → #qa-passed + #done"],
      },
      {
        title: "Mandanten-Isolation",
        body: "Ein Deployment bedient viele Jira-Sites ohne Daten-, Credential- oder Compute-Vermischung. Run-Log-Keys sind mandantenpräfigiert; jede Story läuft in ihrer eigenen Wegwerf-microVM mit ausschließlich den Credentials ihres Mandanten.",
        bullets: ["präfigiertes Run-Log", "Credentials + microVM pro Task", "Crash-Isolation pro Mandant"],
      },
      {
        title: "Live-Run-Dashboard",
        body: "Ein Remix-Dashboard visualisiert Läufe und Events pro Mandant und aktualisiert sich alle 15 s automatisch, sodass Sie dem Agenten in Echtzeit bei der Arbeit zusehen.",
        bullets: [],
      },
      {
        title: "PR-gegated, nachvollziehbar",
        body: "Nichts merged autonom. Arbeit landet als Branch + PR mit einer Zusammenfassung zurück im Ticket — Menschen bleiben das letzte Gate.",
        bullets: [],
      },
    ],
  },

  pricing: {
    tag: "Preise",
    heading: "Preismodelle für jeden Bereitstellungsweg.",
    intro:
      "Wählen Sie zwischen Pay-per-use und Full-Usage-Flat-Rate-Modellen. Kontaktieren Sie uns für individuelle Preise.",
    plans: [
      {
        name: "Pay-per-use-Modell",
        price: "Kontaktieren Sie uns",
        cadence: "verbrauchsbasierte Abrechnung",
        description:
          "Verbrauchsabhängiges Modell, bei dem Sie nur für tatsächlich ausgeführte Last zahlen.",
        included: [
          "Abrechnung nach tatsächlicher Nutzung",
          "Alle Kernfunktionen des Coding-Workflows",
          "Elastische Skalierung bei schwankender Last",
        ],
        excluded: ["Kein fixer monatlicher Ausgabenrahmen"],
      },
      {
        name: "On-Prem Mixed Hybrid Modell",
        price: "Kontaktieren Sie uns",
        cadence: "Full-Usage-Flat-Rate",
        description:
          "Hybrides Bereitstellungsmodell aus Ihrer On-Prem-Umgebung und gemanagten Cloud-Services.",
        included: [
          "On-Prem + Cloud-Architektur",
          "Alle Kernfunktionen des Coding-Workflows",
          "Planbare monatliche Abrechnung",
        ],
        excluded: ["Kein reines Pay-per-use-Billing"],
      },
      {
        name: "Cloud-basiertes Modell",
        price: "Kontaktieren Sie uns",
        cadence: "Full-Usage-Flat-Rate",
        description:
          "Vollständig gemanagte Cloud-Bereitstellung mit festen monatlichen Konditionen.",
        included: [
          "Gemanagte Cloud-Operations",
          "Alle Kernfunktionen des Coding-Workflows",
          "Planbare monatliche Abrechnung",
        ],
        excluded: ["Keine On-Prem-Residency-Option"],
      },
    ],
    matrixHeading: "Feature-Abdeckung: was drin ist und was nicht",
    matrixIntro:
      "Alle aktuell auf dieser Website gezeigten Features sind unten aufgelistet. Ein Häkchen bedeutet enthalten; ein Kreuz bedeutet nicht enthalten.",
    featureColumn: "Feature",
    inLabel: "Drin",
    outLabel: "Raus",
  },

  screenshots: {
    tag: "In Bewegung sehen",
    heading: "Vom Board zum Dashboard.",
    intro:
      "Stories wandern über Ihr Kanban-Board; das Agent-Dashboard zeigt jeden Lauf und jedes Event, sobald es passiert.",
    boardLabel: "your-team.atlassian.net · Kanban-Board",
    dashboardLabel: "Agent-Dashboard · Auto-Refresh 15 s",
    footnote:
      "Repräsentative Produkt-Mockups — beim Deployment durch echte Screenshots ersetzen.",
    columns: ["Ready", "In Review", "In QA", "Done"],
    cards: [
      "Rate-Limit-Header an öffentlicher API",
      "Audit-Log-Endpunkt paginieren",
      "Webhook-Retry mit Backoff",
      "CSV-Export für Rechnungen",
      "SSO-Logout-Redirect-Fix",
    ],
    dashboard: {
      liveRuns: "Live-Läufe",
      tenant: "Mandant: sp33c",
      notes: [
        "implementiert · Tests 8/12",
        "PR #318 geöffnet",
        "Edge-Cases sauber",
        "gemerged · qa-passed",
      ],
      stats: [
        ["12", "Läufe heute"],
        ["3", "PRs geöffnet"],
        ["0", "Fehlschläge"],
      ],
    },
  },

  faq: {
    tag: "FAQ",
    heading: "Fragen, die sich lohnen.",
    intro:
      "Die ehrlichen Antworten — was der Agent ist, was nicht, und wo Sie weiterhin ins Spiel kommen.",
    items: [
      {
        q: "Ersetzt das einen Entwickler?",
        a: "Nein — und das ist auch nicht das Ziel. Der Agent ist ein Kraftverstärker, kein Stellenabbau. Er schreibt Code, führt Tests aus und öffnet Pull Requests, doch jede unumkehrbare Entscheidung gehört einem Menschen, der das System versteht. Sie brauchen weiterhin einen Security-Architekten, der Threat-Model und Leitplanken setzt, einen Security-Operations-Engineer, der beobachtet, was ausgeliefert wird, und reagiert, wenn sich etwas bewegt, und einen erfahrenen Cloud-native-Engineer, der die Architektur verantwortet, die Diffs prüft und die Fehlerfälle erkennt, die ein Modell nicht sieht. Der Agent leistet die unermüdliche Arbeit; qualifizierte Menschen tragen Urteilsvermögen, Sicherheitslage und Verantwortung.",
      },
      {
        q: "Zahle ich für einen Entwickler oder für das Tool?",
        a: "Sie zahlen nur für das Tool. Kein Dienstleister, kein Seat, kein Gehalt. Es ist ein hocheffizientes Instrument, und wie jedes Instrument belohnt es Meisterschaft: Der Wert liegt in Ihrem Kopf — darin, wie gut Sie die Spezifikation formulieren und die Arbeit organisieren. Je schärfer Ihre Akzeptanzkriterien und je besser Sie die Schleife orchestrieren, desto mehr gibt es zurück. Je effizienter Sie es steuern, desto effizienter wird es für Sie.",
      },
      {
        q: "Ersetzt das das Team?",
        a: "Manche würden Ja sagen. Das stimmt nicht — Ihr Team hat einfach andere Arbeit. Die Menschen, die früher das Ergebnis von Hand produziert haben, rücken in der Kette nach oben: in die Planung, in die Architektur, in das Skizzieren des Produkts selbst. Halten Sie Ihre Leute. Mensch plus KI ist das stärkste Team, das es gibt. KI ist nicht hier, um uns zu ersetzen; sie ist hier, um von uns genutzt zu werden — und nur Menschen können das.",
      },
    ],
  },

  about: {
    tag: "Wer das baut",
    headingLead: "Gemacht von ",
    headingName: "sp33c",
    leadName: "Alex Fitterling",
    leadRest:
      " ist Ingenieur und Architekt mit tiefer Expertise in Cyber Security, Security-Architektur, KI, Cloud und DevOps — er entwirft und liefert sichere, skalierbare Lösungen für Kunden aus dem privaten und öffentlichen Sektor.",
    p2: "Er hat als Solution Engineer, Security Architect, Product Owner und Scrum Master cross-funktionale Teams geführt — über die Schweiz, Singapur, Malaysia und Deutschland hinweg.",
    p3a: "Sein Fokus auf ",
    p3focus: "Agentic & Generative AI",
    p3b: " — KI-Agenten, Orchestrierung und LLM-getriebene Systeme — ist genau das, was dieses Projekt antreibt: ein autonomer Coding-Agent, der ein Jira-Backlog in reviewten, ausgelieferten Code verwandelt.",
    ctaVisit: "sp33c.tech besuchen",
    ctaEmail: "info@sp33c.tech",
    focusTitle: "Fokusbereiche",
    focus: [
      "Agentic & Generative AI",
      "KI-Agenten & Orchestrierung",
      "LLMs, RAG & Prompt Engineering",
      "Security-Architektur & Cyber Security",
      "Zero Trust & IAM",
      "Cloud-native Engineering (AWS · Azure · GCP)",
      "Kritische Infrastruktur & KRITIS Energie",
      "KI für ethisches Investieren & Kapitalmärkte",
    ],
    location: "Nürnberg, Deutschland",
    locationSpread: "Über die Schweiz · Singapur · Malaysia · Deutschland",
  },

  footer: {
    ctaHeading: "Ihr Backlog ist bereits die Spec.",
    ctaBodyP1: "Richten Sie die agentische KI auf ein Board, versehen Sie eine Story mit ",
    ctaBodyP2: ", und prüfen Sie den PR, den sie öffnet.",
    ctaPrimary: "Den Quellcode holen",
    ctaGhost: "Den Ablauf erneut ansehen",
    blurb:
      "sp33c baut agentisches Coding mit Jira — ein autonomer Claude-Opus-Agent, der Stories in reviewte Pull Requests verwandelt, mit Human Override, das Sie am Steuer hält.",
    projectHeading: "Projekt",
    projectLinks: {
      repo: "GitHub-Repository",
      docs: "Dokumentation",
      diagram: "System-Ablaufdiagramm",
      pricing: "Preise",
      site: "sp33c.tech",
    },
    contactHeading: "Kontakt",
    license: "Lizenziert unter der",
    licenseName: "GNU General Public License v3.0",
    tagline: "Agentisches Coding mit Jira · sp33c · Nürnberg",
  },

  deck: {
    sectionNavAria: "Abschnitts-Navigation",
    goToSection: "Zu Abschnitt",
    prev: "Vorheriger Abschnitt",
    next: "Nächster Abschnitt",
    nextLabel: "Weiter",
    hintP1: "Irgendwohin klicken · ",
    hintP2: " drücken · oder scrollen zum Erkunden",
  },
};

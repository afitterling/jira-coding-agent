/**
 * Simplified Chinese (zh-CN) copy. Typed as {@link Content} so `tsc` proves it
 * has exactly the same keys as `en.ts` — a missing or extra field is a compile
 * error.
 *
 * Brand/product terms stay English by design (Jira, Claude Opus, Pull Request,
 * PR, Human Override, Synapse, hashtag labels), the surrounding prose is
 * Simplified Chinese.
 */
import type { Content } from "~/i18n/index";

export const zh: Content = {
  meta: {
    title: "Agentic",
    description:
      "sp33c 用 Jira 打造智能体编程：给一个 Story 打上 #ready 标签，一个自主的 Claude Opus 智能体便会实现它、运行测试与 QA，并开启一个 PR。Human Override 让你始终掌控全局。",
    ogTitle: "Agentic — 由 Jira 驱动的智能体编程",
    ogDescription:
      "由 sp33c 打造、用 Jira 驱动的智能体编程 — 实现、测试、QA、PR。你可以一票否决的自主能力。",
  },

  nav: {
    links: [
      "工作原理",
      "Human Override",
      "AI 模型",
      "应用场景",
      "Synapse",
      "FAQ",
      "关于我们",
    ],
    pricing: "定价",
    cta: "查看流程",
    github: "GitHub",
    toggleLabel: "语言",
    menuAria: "切换导航",
  },

  hero: {
    badgeSuffix: "智能体编程 · Human Override",
    titleA: "智能体编程。",
    titleB: "由 Jira 驱动。",
    leadP1: "写下 Story，给它打上 ",
    leadP2:
      " 标签。一个自主的 Claude Opus 智能体便会接手、实现它，运行测试与 QA，并开启一个 pull request — 你的规格变成已交付的代码。借助 ",
    leadLink: "Human Override",
    leadP3: "，人始终掌控每一个不可逆的步骤。",
    ctaPrimary: "查看工作原理",
    ctaGhost: "Human Override",
    ctaPricing: "定价",
    stats: [
      ["2 min", "cron 节奏"],
      ["1 microVM", "每个 Story 独立隔离"],
      ["100%", "PR 强制评审"],
    ],
    visual: {
      board: "board: Kanban · agent run #284",
      story: "为公共 API 添加限流响应头",
      ac: "AC: 每个 200/429 都返回 X-RateLimit-*；并以测试覆盖。",
      connector: "智能体实现 →",
      implemented: "已实现 · 修改 4 个文件",
      testsPassed: "测试通过",
      qa: "QA: 边界情况 + 回归均无问题",
      openedPr: "已开启 PR",
    },
  },

  howItWorks: {
    tag: "工作原理",
    heading: "一个 Story 进来，一个 pull request 出去。",
    intro:
      "整条流水线由标签驱动。你移动一个标签，剩下的交给智能体，它会交给你一份可评审的 diff。",
    steps: [
      {
        title: "写一个 Jira Story",
        body: "你 Kanban 看板上的一个普通 Story — 摘要、描述、验收标准。无需特殊工具，无需学习新的工作流。",
      },
      {
        title: "打上 #ready 标签",
        body: "当规格已经可以开始构建时翻转这个标签。该标签就是触发器 — 智能体把验收标准当作契约。",
      },
      {
        title: "智能体接手",
        body: "一次 cron 节拍（约每 2 分钟）会对接看板，找出 #ready 的 Story，并把每一个分派到各自独立隔离的 Fargate microVM。",
      },
      {
        title: "实现 · 测试 · QA",
        body: "Claude Opus 克隆仓库、编写代码、从 AC 推导出测试，然后运行一道针对边界情况和回归的 QA 关卡。",
      },
      {
        title: "开启一个 pull request",
        body: "通过的工作落到一个分支并开启一个 PR，同时把摘要回写到 Jira 工单。一切都可追溯。",
      },
      {
        title: "你来评审与合并",
        body: "没有你，什么都不会上线。人这一关就是 PR — 批准、请求修改，或用 #revise 打回。",
      },
    ],
    reviseTitle: "规格可以先打磨",
    reviseP1: "被标记为 ",
    reviseP2: " + ",
    reviseP3:
      " 的 Story 会经过一轮精炼 — 智能体收紧验收标准，然后把它们标记为 ",
    reviseP4: "，之后才会写任何代码。",
  },

  humanLoop: {
    badge: "Human Override",
    titleLead: "你可以 ",
    titleAccent: "一票否决的自主能力。",
    intro:
      "从设计之初就有人在回路之中。智能体承担不知疲倦的工作 — 阅读、修订、编码、测试 — 但每一个不可逆的决定都由人来掌握。五个检查点让你始终掌控全局，同时不拖慢机器。",
    touchpoints: [
      {
        title: "批准规格",
        body: "智能体把每个 Story 改写成可测试的验收标准。在它走向任何环节之前，你先读到修订后的规格。",
      },
      {
        title: "打开关卡",
        body: "在人打上标签之前，什么都不会被构建。#ready 标签就是你明确的放行信号 — 自主只有在你说可以时才开始。",
      },
      {
        title: "评审 PR",
        body: "每一处改动都以 pull request 落地，绝不直接推送。你来合并 — 或者不合并。智能体绝不擅自交付任何东西。",
      },
      {
        title: "否决 QA",
        body: "测试和 QA 关卡会自动运行，但它们的判定仅供参考。你的决定每次都压过模型。",
      },
      {
        title: "拉下急停拉绳",
        body: "打一个标签，即可在中途暂停、改道或终止一个 Story。回路会在下一次 2 分钟节拍时作出反应。",
      },
    ],
    closingP1: "智能体是劳动力。",
    closingP2: "你始终是决策者。",
    closingNote: "以机器速度交付 · 以人的判断批准",
  },

  cognition: {
    tag: "受控认知",
    titleLead: "一颗不知疲倦的头脑。 ",
    titleAccent: "牵在你手中的缰绳上。",
    intro:
      "每一次运行都是一个闭合的认知回路 — 感知、解释、决策、行动、学习。其核心是 cognition core：融合每个模块输入的主脑 — 也是你唯一与之交互的核心。它把每一轮锚定到一个目标上，始终被你设定的边界所约束，以机器速度思考，且从不越过界线思考。",
    coreLabel: "Cognition Core",
    coreTagline: "你与之交互的核心",
    centerLines: ["目标 /", "上下文 /", "任务目标"],
    stages: [
      {
        name: "感知",
        body: "读取 Jira Story、仓库以及验收标准 — 它必须据以行动的全部世界状态。",
      },
      {
        name: "解释",
        body: "把原始上下文转化为含义：规格究竟在要求什么，以及代码库已经做了什么。",
      },
      {
        name: "推理 / 决策",
        body: "规划改动、权衡取舍，并选择通往一个通过的 pull request 的最短路径。",
      },
      {
        name: "行动",
        body: "编写代码、运行测试并开启 PR — 在一个隔离的 microVM 内做事，而非闲谈。",
      },
      {
        name: "学习 / 更新",
        body: "把测试、QA 与评审反馈折回下一轮 — 每一次 #revise 都让它更锋利。",
      },
    ],
    boundaryLabel: "Human Override 边界",
    boundaryTitle: "回路在你的界线内运行。",
    boundaryBody:
      "标签打开关卡，pull request 是那堵墙，而你的否决会在下一次 2 分钟节拍时停下回路。自主是引擎；你的边界是底盘。",
  },

  interfaces: {
    badge: "AI 接口",
    titleLead: "接入 ",
    titleAccent: "任何模型。",
    intro:
      "智能体与模型无关。在云端运行前沿的 Claude，用 Bedrock 把一切留在你的 AWS 账户内，或用 LM Studio 完全本地化 — 同一条流水线，由你选择大脑。",
    items: [
      {
        tag: "默认",
        body: "Claude Opus 开箱即用地驱动智能体 — 用于规格到 PR 工作的最锋利的编程模型。",
      },
      {
        tag: "托管",
        body: "在你自己的 AWS 账户、VPC 与合规边界内，路由到 Bedrock 以使用 Claude、Llama 或 Mistral。",
      },
      {
        tag: "本地",
        body: "把智能体指向一个本地的 LM Studio 端点 — 完全离线。你的代码和提示词绝不离开你的场所。",
      },
    ],
    calloutTitle: "每个智能体都在 AWS Fargate 上隔离运行",
    calloutBody:
      "每个 Story 都在各自临时的 Fargate microVM 内实现 — 独立的算力、文件系统和凭据。运行之间或租户之间不共享任何状态。",
  },

  useCases: {
    badge: "不止于编程",
    titleLead: "一个智能体引擎。 ",
    titleAccent: "任何使命。",
    intro:
      "同一条交付代码的、由标签驱动、人在回路的回路，也能运行投资研究、数据流水线、检索增强生成，以及复杂的 LLM 查询工作流 — 然后存储并分析它产出的一切。",
    items: [
      {
        title: "智能体编程",
        body: "旗舰能力：一个被打上 #ready 标签的 Jira Story，变成一个经过测试、QA 和评审的 pull request。",
      },
      {
        title: "RAG 与复杂 LLM 查询",
        body: "Haystack + LangChain 流水线在隔离的 Fargate 任务上运行，让智能体能够检索领域上下文、增强提示词，并跨多步问题进行推理。",
      },
      {
        title: "投资与资本市场",
        body: "筛选、研究并分析机会 — 道德投资与市场情报，由智能体收集数据并据以推理。",
      },
      {
        title: "更广的工作流",
        body: "任何由标签驱动的工作流 — 运维、合规、内容、研究。把状态建模为标签，让智能体在人的把关下驱动它们。",
      },
      {
        title: "存储与分析",
        body: "每一次运行和每一件产物都会被持久化 — 查询它、做成仪表盘，并随时间分析结果，以打磨下一次运行。",
      },
    ],
  },

  dataConnectivity: {
    badge: "数据连接",
    titleLead: "Synapse — ",
    titleAccent: "接入你的数据。",
    introP1: "智能体的能力上限取决于它能触及什么。 ",
    introName: "Synapse",
    introP2:
      " 就是那一层连接：接入一个数据源，它便会被摄取、规范化、为检索建立索引，并由 Fargate 上的 Haystack + LangChain 进行推理 — 然后通过下方任一输出接口交付。",
    pipeline: ["连接", "摄取", "规范化", "存储与索引", "推理", "交付"],
    inputsHeading: "已接入 — 输入连接器",
    connectors: [
      {
        title: "各类数据库",
        body: "SQL、NoSQL 与数据仓库 — 读取上下文，并把结果写回你的记录系统。",
      },
      {
        title: "API 与 webhook",
        body: "拉取实时数据，并把结果推送到你已经在用的工具上。",
      },
      {
        title: "对象存储与文件",
        body: "以任意规模摄取文档、数据集与产物。",
      },
      {
        title: "流式与订阅源",
        body: "近乎实时地对事件、队列和市场数据作出反应。",
      },
    ],
    outputsHeading: "已交付 — 输出接口",
    outputsCount: "个接口",
    outputs: [
      { title: "Pull request", body: "在 GitHub 上开启的、经过评审的代码改动。" },
      {
        title: "Jira 回写",
        body: "在源 Story 上的评论、标签与工作流转换。",
      },
      {
        title: "实时仪表盘",
        body: "每一次运行 + 每个事件都流式传输到 Remix 仪表盘。",
      },
      {
        title: "Webhook 与 Slack",
        body: "把事件和通知推送到你的频道。",
      },
      {
        title: "数据库回写",
        body: "结果持久化到 Postgres、Snowflake 或 BigQuery。",
      },
      { title: "文件导出", body: "把 CSV / Parquet / JSON 写入 S3 或 Blob。" },
      {
        title: "REST / GraphQL API",
        body: "以编程方式查询运行、产物和分析结果。",
      },
    ],
  },

  diagrams: {
    tag: "架构，用图说话",
    heading: "没有黑盒。每一道关卡都画了出来。",
    intro:
      "这些是仓库中实际随附的流程图 — 与智能体流水线每次运行所执行的逻辑完全相同。",
    tablistAria: "流程图",
    openFull: "打开完整图",
    items: [
      {
        tab: "系统流程",
        title: "端到端流水线",
        caption:
          "认证 → 拉取看板 → 修订规格 → 执行 #ready 的 Story → 打标签 + 开启 PR → 汇报。智能体在每次 cron 节拍时所运行的完整、由标签驱动的回路。",
      },
      {
        tab: "测试子流程",
        title: "测试关卡",
        caption:
          "在 #implemented 之后，智能体从验收标准推导出测试用例并评判实现 — 通过则到 #tested，失败则到 #tests-failed。",
      },
      {
        tab: "QA 子流程",
        title: "QA 关卡",
        caption:
          "一个 #tested 的 Story 会在完整性、边界情况和回归方面接受验证 — 晋级为 #qa-passed + #done，或作为 #qa-failed 被打回。",
      },
    ],
  },

  features: {
    tag: "能力",
    heading: "按基础设施来打造，而非一个演示。",
    intro:
      "运行于 SST / AWS — cron、DynamoDB 运行日志、Fargate 执行器，以及一个 Remix 仪表盘，围绕一个自主智能体串联在一起。",
    badge: "Agentic AI",
    items: [
      {
        title: "端到端的 Agentic AI",
        body: "这是自主的智能体 AI — 不是自动补全。Claude Opus 进行规划、跨文件编辑、运行命令、读取测试输出，并自我纠正，直到验收标准被满足。每个 #ready 的 Story 都在各自的 Fargate 任务内运行 Claude Code CLI：克隆 → 编码 → 测试 → PR。",
        bullets: ["智能体编排", "工具使用 + 自我纠正", "Claude Code CLI"],
      },
      {
        title: "Jira 工作流集成",
        body: "默认由标签驱动。可选地把结果镜像到你原生的 Jira 工作流 — implemented → In Review、tested → In QA、qa-passed → Done — 通过 JIRA_DRIVE_STATUS。",
        bullets: [],
      },
      {
        title: "测试 + QA 子流程",
        body: "实现之后有两道自动关卡：一道从 AC 推导用例的测试关卡，以及一道针对边界情况和回归的 QA 关卡。",
        bullets: ["#implemented → #tested", "#tested → #qa-passed + #done"],
      },
      {
        title: "租户隔离",
        body: "一套部署服务多个 Jira 站点，没有数据、凭据或算力的串扰。运行日志的键带租户前缀；每个 Story 都在各自一次性的 microVM 内执行，仅持有其所属租户的凭据。",
        bullets: ["带键前缀的运行日志", "每任务的凭据 + microVM", "按租户的崩溃隔离"],
      },
      {
        title: "实时运行仪表盘",
        body: "一个 Remix 仪表盘按租户可视化运行与事件，每 15s 自动刷新，让你能实时看着智能体工作。",
        bullets: [],
      },
      {
        title: "PR 把关，可追溯",
        body: "没有任何东西会自主合并。工作以分支 + PR 落地，并把摘要回写到工单 — 人始终是最后一道关卡。",
        bullets: [],
      },
    ],
  },

  pricing: {
    tag: "定价",
    heading: "面向每一条部署路径的定价模式。",
    intro:
      "在按用量付费和全用量统一费率模式之间选择。如需定制化定价，请联系我们。",
    plans: [
      {
        name: "按用量付费模式",
        price: "联系我们",
        cadence: "按用量计费",
        description:
          "计量式定价，你只为实际运行的工作负载付费。",
        included: [
          "仅为实际用量付费",
          "全部核心编程工作流功能",
          "面向波动需求的弹性伸缩",
        ],
        excluded: ["无固定的月度支出上限"],
      },
      {
        name: "本地混合部署模式",
        price: "联系我们",
        cadence: "全用量统一费率",
        description:
          "将你的本地环境与托管云服务相结合的混合部署。",
        included: [
          "本地 + 云架构",
          "全部核心编程工作流功能",
          "可预测的月度计费",
        ],
        excluded: ["不提供纯按用量计费"],
      },
      {
        name: "基于云的模式",
        price: "联系我们",
        cadence: "全用量统一费率",
        description:
          "完全托管的云部署，采用固定的月度商务条款。",
        included: [
          "托管的云运维",
          "全部核心编程工作流功能",
          "可预测的月度计费",
        ],
        excluded: ["不提供本地驻留选项"],
      },
    ],
    matrixHeading: "功能覆盖：哪些包含、哪些不包含",
    matrixIntro:
      "本网站当前展示的所有功能均列于下方。对勾表示包含；叉号表示不包含。",
    featureColumn: "功能",
    inLabel: "包含",
    outLabel: "不含",
  },

  screenshots: {
    tag: "看它运转起来",
    heading: "从看板到仪表盘。",
    intro:
      "Story 在你的 Kanban 看板上流转；智能体仪表盘实时展示发生的每一次运行和每个事件。",
    boardLabel: "your-team.atlassian.net · Kanban 看板",
    dashboardLabel: "智能体仪表盘 · 自动刷新 15s",
    footnote:
      "示意性的产品样图 — 部署时替换为真实截图。",
    columns: ["Ready", "In Review", "In QA", "Done"],
    cards: [
      "公共 API 的限流响应头",
      "为审计日志端点分页",
      "带退避的 Webhook 重试",
      "发票的 CSV 导出",
      "SSO 注销跳转修复",
    ],
    dashboard: {
      liveRuns: "实时运行",
      tenant: "tenant: sp33c",
      notes: [
        "实现中 · 测试 8/12",
        "已开启 PR #318",
        "边界情况无问题",
        "已合并 · qa-passed",
      ],
      stats: [
        ["12", "今日运行"],
        ["3", "已开 PR"],
        ["0", "失败"],
      ],
    },
  },

  faq: {
    tag: "FAQ",
    heading: "值得一问的问题。",
    intro:
      "诚实的答案 — 关于这个智能体是什么、不是什么，以及哪里仍然需要你。",
    items: [
      {
        q: "这会取代一名开发者吗？",
        a: "不会 — 而且它也并不打算如此。智能体是一个力量倍增器，而非一个编制名额。它编写代码、运行测试并开启 pull request，但每一个不可逆的决定，仍然属于一个理解系统的人。你仍然需要一位安全架构师来设定威胁模型和护栏，需要一位安全运营工程师来盯着交付了什么并在情况有变时作出响应，还需要一位资深的云原生工程师来对架构负责、评审 diff，并发现模型看不到的失败模式。智能体承担不知疲倦的工作；有技能的人掌握判断、安全态势与问责。",
      },
      {
        q: "我是为一名开发者付费，还是为这个工具付费？",
        a: "你只为工具付费。没有承包商、没有席位、没有薪水。它是一件高效的工具，而和任何工具一样，它回报精通：价值就在你的头脑里 — 在于你把规格框定得多好、把工作组织得多好。你的验收标准越锋利、你对回路编排得越好，它回报得就越多。你越擅长驾驭它，它对你就越高效。",
      },
      {
        q: "这会取代整个团队吗？",
        a: "有些人会说会。事实并非如此 — 你的团队只是有了不同的工作。那些过去亲手产出成果的人，会沿着价值链向上移动：进入规划、进入架构、进入勾勒产品本身。留住你的人。人加 AI 是存在过的最强团队。AI 来到这里不是为了取代我们；它是为了被我们所用 — 而只有人能去运用它。",
      },
    ],
  },

  about: {
    tag: "谁打造了它",
    headingLead: "由 ",
    headingName: "sp33c",
    leadName: "Alex Fitterling",
    leadRest:
      " 是一名工程师和架构师，在网络安全、安全架构、AI、云和 DevOps 领域拥有深厚的专长 — 为私营和公共部门客户设计并交付安全、可扩展的解决方案。",
    p2: "他曾以 Solution Engineer、Security Architect、Product Owner 和 Scrum Master 的身份带领跨职能团队 — 工作足迹遍及瑞士、新加坡、马来西亚和德国。",
    p3a: "他对 ",
    p3focus: "Agentic & Generative AI",
    p3b: " 的专注 — AI 智能体、编排以及 LLM 驱动的系统 — 正是驱动这个项目的东西：一个把 Jira backlog 变成经过评审、已交付代码的自主编程智能体。",
    ctaVisit: "Visit sp33c.tech",
    ctaEmail: "info@sp33c.tech",
    focusTitle: "专注领域",
    focus: [
      "Agentic & Generative AI",
      "AI 智能体与编排",
      "LLM、RAG 与提示词工程",
      "安全架构与网络安全",
      "Zero Trust 与 IAM",
      "云原生工程 (AWS · Azure · GCP)",
      "关键基础设施与 KRITIS 能源",
      "面向道德投资与资本市场的 AI",
    ],
    location: "德国，纽伦堡",
    locationSpread: "遍及瑞士 · 新加坡 · 马来西亚 · 德国",
  },

  footer: {
    ctaHeading: "你的 backlog 本身就是规格。",
    ctaBodyP1: "把智能体 AI 指向一个看板，给一个 Story 打上 ",
    ctaBodyP2: " 标签，然后评审它开启的 PR。",
    ctaPrimary: "获取源代码",
    ctaGhost: "再看一遍流程",
    blurb:
      "sp33c 用 Jira 打造智能体编程 — 一个把 Story 变成经过评审的 pull request 的自主 Claude Opus 智能体，由 Human Override 让你掌控全局。",
    projectHeading: "项目",
    projectLinks: {
      repo: "GitHub 仓库",
      docs: "文档",
      diagram: "系统流程图",
      pricing: "定价",
      site: "sp33c.tech",
    },
    contactHeading: "联系",
    license: "许可于",
    licenseName: "GNU General Public License v3.0",
    tagline: "用 Jira 进行智能体编程 · sp33c · 纽伦堡",
  },

  deck: {
    sectionNavAria: "章节导航",
    goToSection: "前往章节",
    prev: "上一章节",
    next: "下一章节",
    nextLabel: "下一个",
    hintP1: "点击任意处 · 按 ",
    hintP2: " · 或滚动以探索",
  },
};

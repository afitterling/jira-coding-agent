/**
 * Malay (Bahasa Melayu, ms-MY) copy. Typed as {@link Content} so `tsc` proves it
 * has exactly the same keys as `en.ts` — a missing or extra field is a compile error.
 *
 * Brand/product terms stay English by design (Jira, Claude Opus, Pull Request,
 * PR, Human Override, Synapse, hashtag labels), the surrounding prose is Bahasa Melayu.
 */
import type { Content } from "~/i18n/index";

export const ms: Content = {
  meta: {
    title: "Agentic",
    description:
      "sp33c membina pengekodan agentik dengan Jira: labelkan sesuatu story dengan #ready, dan ejen Claude Opus yang autonomi akan melaksanakannya, menjalankan ujian + QA, serta membuka satu PR. Human Override memastikan anda kekal memegang kawalan.",
    ogTitle: "Agentic — pengekodan agentik, dipacu oleh Jira",
    ogDescription:
      "Pengekodan agentik dengan Jira oleh sp33c — laksana, uji, QA, PR. Autonomi yang boleh anda veto.",
  },

  nav: {
    links: [
      "Cara ia berfungsi",
      "Human Override",
      "Model AI",
      "Kes penggunaan",
      "Synapse",
      "FAQ",
      "Tentang kami",
    ],
    pricing: "Harga",
    cta: "Lihat alirannya",
    github: "GitHub",
    toggleLabel: "Bahasa",
    menuAria: "Togol navigasi",
  },

  hero: {
    badgeSuffix: "Pengekodan agentik · Human Override",
    titleA: "Pengekodan agentik.",
    titleB: "Dipacu oleh Jira.",
    leadP1: "Tulis story itu. Labelkan ia dengan ",
    leadP2:
      ". Ejen Claude Opus yang autonomi akan mengambilnya, melaksanakannya, menjalankan ujian dan QA, serta membuka satu pull request — spesifikasi anda menjadi kod yang dihantar. Dengan ",
    leadLink: "Human Override",
    leadP3: ", seorang manusia kekal memegang kawalan ke atas setiap langkah yang tidak boleh diundur.",
    ctaPrimary: "Cara ia berfungsi",
    ctaGhost: "Human Override",
    ctaPricing: "Harga",
    stats: [
      ["2 min", "kadens cron"],
      ["1 microVM", "setiap story, terasing"],
      ["100%", "semakan berpagar PR"],
    ],
    visual: {
      board: "board: Kanban · agent run #284",
      story: "Tambah header had kadar ke API awam",
      ac: "AC: kembalikan X-RateLimit-* pada setiap 200/429; liputi dengan ujian.",
      connector: "ejen melaksanakan →",
      implemented: "dilaksanakan · 4 fail diubah",
      testsPassed: "ujian lulus",
      qa: "QA: kes hujung + regresi bersih",
      openedPr: "PR dibuka",
    },
  },

  howItWorks: {
    tag: "Cara ia berfungsi",
    heading: "Satu story masuk. Satu pull request keluar.",
    intro:
      "Keseluruhan saluran ini dipacu oleh label. Anda mengalihkan satu label; ejen melakukan selebihnya dan menyerahkan kepada anda satu diff yang boleh disemak.",
    steps: [
      {
        title: "Tulis satu story Jira",
        body: "Satu story biasa pada board Kanban anda — ringkasan, penerangan, kriteria penerimaan. Tiada perkakas khas, tiada aliran kerja baharu untuk dipelajari.",
      },
      {
        title: "Labelkan ia #ready",
        body: "Tukar label apabila spesifikasi sudah sedia untuk dibina. Label itu ialah pencetus — ejen menganggap kriteria penerimaan sebagai kontrak.",
      },
      {
        title: "Ejen mengambilnya",
        body: "Satu detik cron (setiap ~2 min) mendok pada board, mencari story #ready, dan menghantar setiap satu ke microVM Fargate terasingnya sendiri.",
      },
      {
        title: "Laksana · Uji · QA",
        body: "Claude Opus mengklon repo, menulis kod, menerbitkan ujian daripada AC, kemudian menjalankan pagar QA untuk kes hujung dan regresi.",
      },
      {
        title: "Buka satu pull request",
        body: "Kerja yang lulus mendarat pada satu cabang dan membuka satu PR, dengan ringkasan disiarkan semula ke tiket Jira. Segalanya boleh dijejaki.",
      },
      {
        title: "Anda semak & gabung",
        body: "Tiada apa-apa dihantar tanpa anda. Pagar manusia ialah PR — luluskan, minta perubahan, atau hantar semula dengan #revise.",
      },
    ],
    reviseTitle: "Spesifikasi boleh ditajamkan terlebih dahulu",
    reviseP1: "Story yang ditandakan ",
    reviseP2: " + ",
    reviseP3:
      " menjalani satu pusingan penghalusan — ejen mengetatkan kriteria penerimaan, kemudian menandakannya ",
    reviseP4: " sebelum sebarang kod ditulis.",
  },

  humanLoop: {
    badge: "Human Override",
    titleLead: "Autonomi yang boleh anda ",
    titleAccent: "veto.",
    intro:
      "Seorang manusia dalam gelung, secara reka bentuk. Ejen melakukan kerja yang tidak kenal lelah — membaca, menyemak semula, mengekod, menguji — tetapi seorang manusia memiliki setiap keputusan yang tidak boleh diundur. Lima titik semak memastikan anda memegang kawalan tanpa memperlahankan mesin.",
    touchpoints: [
      {
        title: "Luluskan spesifikasi",
        body: "Ejen menulis semula setiap story menjadi kriteria penerimaan yang boleh diuji. Anda membaca spesifikasi yang disemak semula sebelum ia ke mana-mana.",
      },
      {
        title: "Buka pagar",
        body: "Tiada apa-apa dibina sehingga seorang manusia melabelkannya. Label #ready ialah keizinan jelas anda — autonomi bermula hanya apabila anda berkata begitu.",
      },
      {
        title: "Semak PR",
        body: "Setiap perubahan mendarat sebagai satu pull request, tidak pernah sebagai push terus. Anda menggabungkannya — atau tidak. Ejen tidak menghantar apa-apa secara sendiri.",
      },
      {
        title: "Atasi QA",
        body: "Pagar ujian dan QA berjalan secara automatik, tetapi keputusannya hanya bersifat nasihat. Keputusan anda mengatasi keputusan model setiap kali.",
      },
      {
        title: "Tarik tali kecemasan",
        body: "Letakkan satu label untuk menjeda, mengubah laluan, atau menghentikan satu story di pertengahan jalan. Gelung bertindak balas pada detik 2-minit yang berikutnya.",
      },
    ],
    closingP1: "Ejen ialah tenaga kerjanya.",
    closingP2: "Anda kekal sebagai pembuat keputusan.",
    closingNote: "hantar pada kelajuan mesin · luluskan pada pertimbangan manusia",
  },

  cognition: {
    tag: "Kognisi terkawal",
    titleLead: "Minda yang tidak kenal lelah. ",
    titleAccent: "Pada tali anda.",
    intro:
      "Setiap larian ialah satu gelung kognitif tertutup — menanggap, mentafsir, memutuskan, bertindak, belajar. Di tengahnya terletak cognition core: master brain yang menggabungkan input daripada setiap modul — dan satu-satunya core yang anda berinteraksi dengannya. Ia menambat setiap pusingan kepada satu objektif, kekal berpagar dalam sempadan yang anda tetapkan, berfikir pada kelajuan mesin, dan tidak pernah berfikir di luar garisan.",
    coreLabel: "Cognition Core",
    coreTagline: "core yang anda berinteraksi dengannya",
    centerLines: ["Matlamat /", "Konteks /", "Objektif Tugas"],
    stages: [
      {
        name: "Menanggap",
        body: "Membaca story Jira, repo, dan kriteria penerimaan — keseluruhan keadaan dunia yang ia mesti bertindak ke atasnya.",
      },
      {
        name: "Mentafsir",
        body: "Mengubah konteks mentah menjadi makna: apa yang sebenarnya diminta oleh spesifikasi, dan apa yang sudah dilakukan oleh pangkalan kod.",
      },
      {
        name: "Menaakul / Memutuskan",
        body: "Merancang perubahan, menimbang pertukaran, dan memilih laluan terpendek ke satu pull request yang lulus.",
      },
      {
        name: "Bertindak",
        body: "Menulis kod, menjalankan ujian, dan membuka PR — kerja, bukan cakap-cakap, di dalam satu microVM terasing.",
      },
      {
        name: "Belajar / Mengemas kini",
        body: "Memasukkan semula maklum balas ujian, QA, dan semakan ke dalam pusingan seterusnya — ditajamkan pada setiap #revise.",
      },
    ],
    boundaryLabel: "Sempadan Human Override",
    boundaryTitle: "Gelung berjalan di dalam garisan anda.",
    boundaryBody:
      "Label membuka pagar, pull request ialah dindingnya, dan veto anda menghentikan gelung pada detik 2-minit yang berikutnya. Autonomi ialah enjinnya; sempadan anda ialah casisnya.",
  },

  interfaces: {
    badge: "Antara Muka AI",
    titleLead: "Pasangkan ",
    titleAccent: "sebarang model.",
    intro:
      "Ejen ini agnostik model. Jalankan Claude frontier dalam awan, simpan segalanya di dalam akaun AWS anda dengan Bedrock, atau pergi sepenuhnya tempatan dengan LM Studio — saluran yang sama, otak pilihan anda.",
    items: [
      {
        tag: "lalai",
        body: "Claude Opus memacu ejen secara terus dari kotak — model pengekodan paling tajam untuk kerja spec-ke-PR.",
      },
      {
        tag: "terurus",
        body: "Halakan ke Bedrock untuk Claude, Llama, atau Mistral di dalam akaun AWS, VPC, dan sempadan pematuhan anda sendiri.",
      },
      {
        tag: "tempatan",
        body: "Halakan ejen ke satu titik akhir LM Studio tempatan — sepenuhnya luar talian. Kod dan prompt anda tidak pernah meninggalkan bangunan.",
      },
    ],
    calloutTitle: "Setiap ejen berjalan terasing pada AWS Fargate",
    calloutBody:
      "Setiap story dilaksanakan dalam microVM Fargate efemeralnya sendiri — pengkomputeran, sistem fail, dan kelayakan yang berasingan. Tiada keadaan dikongsi antara larian atau penyewa.",
  },

  useCases: {
    badge: "Melangkaui pengekodan",
    titleLead: "Satu enjin agentik. ",
    titleAccent: "Sebarang misi.",
    intro:
      "Gelung dipacu-label, manusia-dalam-gelung yang sama yang menghantar kod boleh menjalankan penyelidikan pelaburan, saluran data, retrieval-augmented generation, dan aliran kerja pertanyaan LLM yang kompleks — kemudian menyimpan dan menganalisis segala yang dihasilkannya.",
    items: [
      {
        title: "Pengekodan agentik",
        body: "Yang utama: satu story Jira yang dilabelkan #ready menjadi satu pull request yang diuji, di-QA, dan disemak.",
      },
      {
        title: "RAG & pertanyaan LLM kompleks",
        body: "Saluran Haystack + LangChain berjalan pada tugas Fargate terasing supaya ejen boleh mendapatkan konteks domain, memperkaya prompt, dan menaakul merentas soalan berbilang langkah.",
      },
      {
        title: "Pelaburan & pasaran modal",
        body: "Tapis, selidik, dan analisis peluang — pelaburan beretika dan perisikan pasaran, dengan ejen mengumpul dan menaakul ke atas data.",
      },
      {
        title: "Aliran kerja melangkaui",
        body: "Sebarang aliran kerja dipacu-label — ops, pematuhan, kandungan, penyelidikan. Modelkan keadaan sebagai label dan biarkan ejen memacunya, dipagar oleh manusia.",
      },
      {
        title: "Simpan & analisis",
        body: "Setiap larian dan artifak dikekalkan — tanyakannya, paparkannya dalam papan pemuka, dan analisis hasil dari semasa ke semasa untuk menajamkan larian seterusnya.",
      },
    ],
  },

  dataConnectivity: {
    badge: "Kesalinghubungan Data",
    titleLead: "Synapse — ",
    titleAccent: "diwayarkan ke dalam data anda.",
    introP1: "Ejen hanya sebaik apa yang boleh dicapainya. ",
    introName: "Synapse",
    introP2:
      " ialah lapisan penghubung: pasangkan satu sumber, ia diserap masuk, dinormalkan, diindeks untuk perolehan, dan ditaakulkan oleh Haystack + LangChain pada Fargate — kemudian dihantar melalui mana-mana antara muka output di bawah.",
    pipeline: ["Hubungkan", "Serap", "Normalkan", "Simpan & Indeks", "Taakul", "Hantar"],
    inputsHeading: "Dipasang — penyambung input",
    connectors: [
      {
        title: "Pelbagai jenis pangkalan data",
        body: "SQL, NoSQL, dan gudang — baca konteks dan tulis hasil semula ke sistem rekod anda.",
      },
      {
        title: "API & webhook",
        body: "Tarik data langsung dan tolak hasil merentas alat yang sudah anda jalankan.",
      },
      {
        title: "Storan objek & fail",
        body: "Serap masuk dokumen, set data, dan artifak pada sebarang skala.",
      },
      {
        title: "Penstriman & suapan",
        body: "Bertindak balas hampir masa nyata terhadap peristiwa, baris gilir, dan data pasaran.",
      },
    ],
    outputsHeading: "Dihantar — antara muka output",
    outputsCount: "antara muka",
    outputs: [
      { title: "Pull request", body: "Perubahan kod yang disemak dibuka pada GitHub." },
      {
        title: "Tulis balik Jira",
        body: "Komen, label, dan peralihan aliran kerja pada story sumber.",
      },
      {
        title: "Papan pemuka langsung",
        body: "Setiap larian + peristiwa distrim ke papan pemuka Remix.",
      },
      {
        title: "Webhook & Slack",
        body: "Tolak peristiwa dan pemberitahuan ke saluran anda.",
      },
      {
        title: "Tulis balik pangkalan data",
        body: "Hasil dikekalkan ke Postgres, Snowflake, atau BigQuery.",
      },
      { title: "Eksport fail", body: "CSV / Parquet / JSON ditulis ke S3 atau Blob." },
      {
        title: "API REST / GraphQL",
        body: "Tanyakan larian, artifak, dan analisis secara aturcara.",
      },
    ],
  },

  diagrams: {
    tag: "Seni bina, dalam gambar rajah",
    heading: "Tiada kotak hitam. Setiap pagar dipetakan.",
    intro:
      "Inilah gambar rajah aliran sebenar yang dihantar dalam repo — logik yang sama yang dilaksanakan oleh saluran agentik pada setiap larian.",
    tablistAria: "Gambar rajah aliran",
    openFull: "Buka gambar rajah penuh",
    items: [
      {
        tab: "Aliran sistem",
        title: "Saluran hujung-ke-hujung",
        caption:
          "Sahkan → ambil board → semak semula spesifikasi → laksana story #ready → label + buka PR → lapor. Gelung dipacu-label penuh yang dijalankan ejen pada setiap detik cron.",
      },
      {
        tab: "Sub-aliran ujian",
        title: "Pagar ujian",
        caption:
          "Selepas #implemented, ejen menerbitkan kes ujian daripada kriteria penerimaan dan menilai pelaksanaan — lulus ke #tested, gagal ke #tests-failed.",
      },
      {
        tab: "Sub-aliran QA",
        title: "Pagar QA",
        caption:
          "Satu story #tested disahkan untuk kelengkapan, kes hujung, dan regresi — dinaikkan ke #qa-passed + #done, atau dihantar semula sebagai #qa-failed.",
      },
    ],
  },

  features: {
    tag: "Keupayaan",
    heading: "Dibina seperti infrastruktur, bukan demo.",
    intro:
      "Berjalan pada SST / AWS — cron, log larian DynamoDB, pelari Fargate, dan papan pemuka Remix, dihubungkan bersama di sekeliling satu ejen autonomi.",
    badge: "Agentic AI",
    items: [
      {
        title: "Agentic AI, hujung ke hujung",
        body: "Ini ialah AI agentik autonomi — bukan autolengkap. Claude Opus merancang, menyunting merentas fail, menjalankan arahan, membaca output ujian, dan membetulkan dirinya sendiri sehingga kriteria penerimaan dipenuhi. Setiap story #ready menjalankan Claude Code CLI di dalam tugas Fargatenya sendiri: clone → code → test → PR.",
        bullets: ["orkestra ejen", "penggunaan alat + pembetulan diri", "Claude Code CLI"],
      },
      {
        title: "Integrasi aliran kerja Jira",
        body: "Dipacu-label secara lalai. Secara pilihan, cerminkan hasil pada aliran kerja Jira asli anda — implemented → In Review, tested → In QA, qa-passed → Done — dengan JIRA_DRIVE_STATUS.",
        bullets: [],
      },
      {
        title: "Sub-aliran ujian + QA",
        body: "Dua pagar automatik selepas pelaksanaan: satu pagar ujian yang menerbitkan kes daripada AC, dan satu pagar QA untuk kes hujung dan regresi.",
        bullets: ["#implemented → #tested", "#tested → #qa-passed + #done"],
      },
      {
        title: "Pengasingan penyewa",
        body: "Satu pengerahan melayan banyak tapak Jira tanpa lompahan data, kelayakan, atau pengkomputeran. Kunci log larian diawalan dengan penyewa; setiap story dilaksanakan dalam microVM pakai-buangnya sendiri dengan hanya kelayakan penyewanya.",
        bullets: ["log larian berawalan kunci", "kelayakan + microVM setiap tugas", "pengasingan ranap setiap penyewa"],
      },
      {
        title: "Papan pemuka larian langsung",
        body: "Satu papan pemuka Remix menggambarkan larian dan peristiwa setiap penyewa, menyegar semula secara automatik setiap 15s supaya anda boleh memerhati ejen bekerja dalam masa nyata.",
        bullets: [],
      },
      {
        title: "Berpagar PR, boleh dijejaki",
        body: "Tiada apa-apa digabungkan secara autonomi. Kerja mendarat sebagai cabang + PR dengan ringkasan disiarkan semula ke tiket — manusia kekal sebagai pagar terakhir.",
        bullets: [],
      },
    ],
  },

  pricing: {
    tag: "Harga",
    heading: "Model harga untuk setiap laluan pengerahan.",
    intro:
      "Pilih antara model bayar-ikut-guna dan model kadar rata guna-penuh. Hubungi kami untuk harga yang disesuaikan.",
    plans: [
      {
        name: "Model bayar-ikut-guna",
        price: "Hubungi Kami",
        cadence: "pengebilan berasaskan penggunaan",
        description:
          "Harga bermeter di mana anda hanya membayar untuk beban kerja yang anda jalankan.",
        included: [
          "Bayar hanya untuk penggunaan sebenar",
          "Semua ciri teras aliran kerja pengekodan",
          "Penskalaan anjal untuk permintaan berubah-ubah",
        ],
        excluded: ["Tiada had perbelanjaan bulanan tetap"],
      },
      {
        name: "Model hibrid campuran on-prem",
        price: "Hubungi Kami",
        cadence: "kadar rata guna-penuh",
        description:
          "Pengerahan hibrid yang menggabungkan persekitaran on-prem anda dengan perkhidmatan awan terurus.",
        included: [
          "Seni bina on-prem + awan",
          "Semua ciri teras aliran kerja pengekodan",
          "Pengebilan bulanan yang boleh diramal",
        ],
        excluded: ["Tiada pengebilan bayar-ikut-guna tulen"],
      },
      {
        name: "Model berasaskan awan",
        price: "Hubungi Kami",
        cadence: "kadar rata guna-penuh",
        description:
          "Pengerahan awan yang terurus sepenuhnya dengan terma komersial bulanan yang tetap.",
        included: [
          "Operasi awan terurus",
          "Semua ciri teras aliran kerja pengekodan",
          "Pengebilan bulanan yang boleh diramal",
        ],
        excluded: ["Tiada pilihan residensi on-prem"],
      },
    ],
    matrixHeading: "Liputan ciri: apa yang termasuk dan apa yang tidak",
    matrixIntro:
      "Semua ciri yang dipersembahkan pada laman web ini disenaraikan di bawah. Tanda semak bermaksud ciri itu termasuk; tanda silang bermaksud ia tidak termasuk.",
    featureColumn: "Ciri",
    inLabel: "Termasuk",
    outLabel: "Tidak",
  },

  screenshots: {
    tag: "Lihat ia bergerak",
    heading: "Dari board ke papan pemuka.",
    intro:
      "Story bergerak merentas board Kanban anda; papan pemuka ejen menunjukkan setiap larian dan peristiwa sebaik ia berlaku.",
    boardLabel: "your-team.atlassian.net · board Kanban",
    dashboardLabel: "papan pemuka ejen · auto-segar 15s",
    footnote:
      "Mockup produk yang mewakili — gantikan dengan tangkapan skrin sebenar apabila anda mengerah.",
    columns: ["Ready", "In Review", "In QA", "Done"],
    cards: [
      "Header had kadar pada API awam",
      "Halamankan titik akhir log audit",
      "Cuba semula webhook dengan backoff",
      "Eksport CSV untuk invois",
      "Pembetulan ubah hala log keluar SSO",
    ],
    dashboard: {
      liveRuns: "Larian langsung",
      tenant: "tenant: sp33c",
      notes: [
        "melaksanakan · ujian 8/12",
        "membuka PR #318",
        "kes hujung bersih",
        "digabungkan · qa-passed",
      ],
      stats: [
        ["12", "larian hari ini"],
        ["3", "PR dibuka"],
        ["0", "kegagalan"],
      ],
    },
  },

  faq: {
    tag: "FAQ",
    heading: "Soalan yang berbaloi ditanya.",
    intro:
      "Jawapan yang jujur — tentang apa itu ejen, apa yang ia bukan, dan di mana anda masih diperlukan.",
    items: [
      {
        q: "Adakah ini menggantikan seorang pembangun?",
        a: "Tidak — dan ia tidak cuba berbuat demikian. Ejen ialah pengganda daya, bukan bilangan kepala. Ia menulis kod, menjalankan ujian, dan membuka pull request, tetapi setiap keputusan yang tidak boleh diundur masih milik seorang manusia yang memahami sistem itu. Anda masih mahukan seorang arkitek keselamatan untuk menetapkan model ancaman dan pagar pelindung, seorang jurutera operasi keselamatan untuk memerhati apa yang dihantar dan bertindak balas apabila sesuatu bergerak, dan seorang jurutera cloud-native kanan untuk memiliki seni bina, menyemak diff, dan menangkap mod kegagalan yang tidak dapat dilihat oleh model. Ejen melakukan kerja yang tidak kenal lelah; orang yang mahir memiliki pertimbangan, postur keselamatan, dan akauntabiliti.",
      },
      {
        q: "Adakah saya membayar untuk seorang pembangun, atau untuk alat itu?",
        a: "Anda membayar untuk alat itu — sahaja. Tiada kontraktor, tiada kerusi, tiada gaji. Ia ialah instrumen yang sangat cekap, dan seperti mana-mana instrumen ia memberi ganjaran kepada kemahiran: nilainya hidup di dalam kepala anda, dalam betapa baiknya anda merangka spesifikasi dan menyusun kerja. Semakin tajam kriteria penerimaan anda dan semakin baik anda mengorkestra gelung, semakin banyak ia memberi balik. Semakin cekap anda memacunya, semakin cekap ia menjadi untuk anda.",
      },
      {
        q: "Adakah ini menggantikan pasukan?",
        a: "Sesetengah pihak akan berhujah ya. Ia tidak benar — pasukan anda hanya mempunyai kerja yang berbeza. Orang yang dahulunya menghasilkan output dengan tangan naik ke atas rantai: ke dalam perancangan, ke dalam seni bina, ke dalam melakar produk itu sendiri. Pegang erat-erat orang anda. Manusia tambah AI ialah pasukan paling kuat yang ada. AI bukan di sini untuk menggantikan kita; ia di sini untuk dimanfaatkan oleh kita — dan hanya manusia boleh melakukan pemanfaatan itu.",
      },
    ],
  },

  about: {
    tag: "Siapa yang membina ini",
    headingLead: "Dibuat oleh ",
    headingName: "sp33c",
    leadName: "Alex Fitterling",
    leadRest:
      " ialah seorang jurutera dan arkitek dengan kepakaran mendalam merentas Cyber Security, Security Architecture, AI, Cloud, dan DevOps — mereka bentuk dan menyampaikan penyelesaian yang selamat dan boleh diskala untuk pelanggan sektor swasta dan awam.",
    p2: "Beliau telah mengetuai pasukan rentas fungsi sebagai Solution Engineer, Security Architect, Product Owner, dan Scrum Master — bekerja merentas Switzerland, Singapura, Malaysia, dan Jerman.",
    p3a: "Fokus beliau pada ",
    p3focus: "Agentic & Generative AI",
    p3b: " — ejen AI, orkestra, dan sistem dipacu-LLM — adalah tepat apa yang menggerakkan projek ini: satu ejen pengekodan autonomi yang menukar backlog Jira menjadi kod yang disemak dan dihantar.",
    ctaVisit: "Lawati sp33c.tech",
    ctaEmail: "info@sp33c.tech",
    focusTitle: "Bidang fokus",
    focus: [
      "Agentic & Generative AI",
      "Ejen AI & Orkestra",
      "LLM, RAG & Prompt Engineering",
      "Security Architecture & Cyber Security",
      "Zero Trust & IAM",
      "Cloud-native Engineering (AWS · Azure · GCP)",
      "Infrastruktur Kritikal & KRITIS Energy",
      "AI untuk Pelaburan Beretika & Pasaran Modal",
    ],
    location: "Nuremberg, Jerman",
    locationSpread: "Merentas Switzerland · Singapura · Malaysia · Jerman",
  },

  footer: {
    ctaHeading: "Backlog anda sudah pun menjadi spesifikasi.",
    ctaBodyP1: "Halakan AI agentik pada satu board, labelkan satu story ",
    ctaBodyP2: ", dan semak PR yang dibukanya.",
    ctaPrimary: "Dapatkan sumber",
    ctaGhost: "Lawati semula aliran",
    blurb:
      "sp33c membina pengekodan agentik dengan Jira — satu ejen Claude Opus autonomi yang menukar story menjadi pull request yang disemak, dengan Human Override memastikan anda kekal memegang kawalan.",
    projectHeading: "Projek",
    projectLinks: {
      repo: "Repositori GitHub",
      docs: "Dokumentasi",
      diagram: "Gambar rajah aliran sistem",
      pricing: "Harga",
      site: "sp33c.tech",
    },
    contactHeading: "Hubungi",
    license: "Dilesenkan di bawah",
    licenseName: "GNU General Public License v3.0",
    tagline: "Pengekodan agentik dengan Jira · sp33c · Nuremberg",
  },

  deck: {
    sectionNavAria: "Navigasi bahagian",
    goToSection: "Ke bahagian",
    prev: "Bahagian sebelumnya",
    next: "Bahagian seterusnya",
    nextLabel: "Seterusnya",
    hintP1: "Klik di mana-mana · tekan ",
    hintP2: " · atau tatal untuk meneroka",
  },
};

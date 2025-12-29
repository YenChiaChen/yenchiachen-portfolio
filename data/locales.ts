
const zhTW = {
  nav: {
    about: '關於',
    skills: '技術',
    projects: '專案',
    blog: '筆記',
    awards: '獲獎',
    experience: '經歷',
    contact: '聯絡',
  },
  hero: {
    role: '機器學習 x 全端 x 運動員',
    name_first: '陳彥家',
    name_last: '',
    value_prop: '以運動員的紀律，打造 <span class="text-seal font-medium italic">智慧介面</span> 與系統工藝。',
    credentials: {
      academic: { label: '學術學位', value: '資訊工程碩士', sub: '國立台灣科技大學' },
      award: { label: '體育經驗', value: '20年+ 網球選手', sub: '台北代表隊' },
      exp: { label: '實戰經驗', value: '6年+ 產品級開發', sub: 'ML 與全端系統' }
    },
    scroll: '向下探索'
  },
  about: {
    index: '索引 01 — 個人檔案',
    philosophy_label: '核心哲學',
    philosophy_quote: '「追求卓越，成功自然會找上門。」',
    badge: '關於我',
    title: "極致過程的實踐者",
    intro: "我畢業於國立台灣科技大學 <span class=\"text-seal font-semibold\">資工碩士班</span>。<br /><br />從小到大，我的生活是一場無止盡的跨界探索：參加過網球、桌球、羽球、游泳校隊；進過美術班、數資班、圍棋班；學過鋼琴、木琴、吉他與小提琴；爬過玉山、合歡山、中橫與南橫。<br /><br />這些經歷讓我深信，<span class=\"text-seal font-semibold\">重視「過程體驗」遠大於結果，使我能全神貫注於不斷迭代的優化與自我要求上</span>。對我而言，<span class=\"text-seal font-semibold\">卓越的成果只是專注與自律後的必然產物</span>。在我的經驗中，結果通常都會很不錯 :>",
    pillars: {
      foundation: {
        title: "學術領域",
        desc: "專注於 <span class=\"text-seal\">深度學習效能預測</span> 與資料複雜度分析，能在模型訓練前預測效能，且誤差僅 <span class=\"text-seal\">10%</span> 以內。"
      },
      discipline: {
        title: "實戰經驗",
        desc: "涵蓋 CMS/ERP、Zero Trust RBAC、K8s 導入、NLP 股票輿情及交通肇事責任 AI 分析系統。"
      },
      impact: {
        title: "關於網球",
        desc: "小學時，我在垃圾車撿到一把網球拍，拖著媽媽說要去加入網球隊，就這樣成為體保生，成為台北市代表隊，現在則是我的人生避風港<3"
      },
      vision: {
        title: "平衡之美",
        desc: "因為有平日，假日才會開心ฅ^•ﻌ•^ฅ"
      }
    },
    action: '檢視作品',
    archives: '精選檔案',
    status: '開放合作洽談 — 2024'
  },
  skills: {
    title: '技能樹',
    index: '02 — 技能',
    categories: {
      ml: '機器學習',
      frontend: '前端',
      backend: '後端與架構'
    }
  },
  projects: {
    index: '03 — 精選作品',
    title: '工藝與 <span class="italic text-sub">體驗。</span>',
    sub: '透過詳實的案例研究，在嚴謹的工程與以人為本的設計哲學之間架起橋樑。',
    categories: {
      all: '全部',
      web: 'Web 應用',
      mobile: '行動 App',
      ai: 'AI / Bot',
      brand: '品牌識別'
    },
    loading: '正在調閱檔案...',
    case_study_label: '案例研究',
    tech_stack: '技術堆疊',
    role_label: '擔綱角色',
    role_value: '技術領軍 / UX 設計',
    end_archive: '專案檔案閱覽結束',
    close: '關閉案例'
  },
  blog: {
    title: '工程日誌',
    sub: '/ 共享智慧',
    index: '03 — 筆記',
    categories: {
      all: '全部',
      frontend: '前端',
      backend: '後端',
      ml: '機器學習',
      security: '資安'
    },
    loading: '正在調閱手稿...',
    reading_mode: '閱讀模式',
    end: '傳輸結束',
    back: '返回日誌',
    read_article: '閱讀全文',
  },
  experience: {
    index: '04 — 時間軸',
    title: '職涯 <br/> 旅程。',
    sub: '一段持續精進的過程，從基礎研究走向架構領導者。',
    items: [
      { role: "全端工程師 (自由職業)", company: "個人工作室", period: "2021 – 至今", desc: ["專精於高效能 Web 應用的 React 與 TypeScript 生態系。", "交付具備複雜資料視覺化的生產級 ESG 平台。", "提供 SEO 優化與零信任安全架構顧問服務。"] },
      { role: "共同創辦人 & CTO", company: "Homie Studio", period: "2019 – 2021", desc: ["主導技術策略與產品路線圖規劃。", "帶領獲獎金融科技產品 (PP-Bank).", "管理敏捷開發週期與跨部門協作。"] },
      { role: "研發工程師", company: "至上電子", period: "2016 – 2018", desc: ["使用 C# .NET 架構開發內部 ERP/MIS 系統。", "現代化舊有程式碼庫，將可維護性提升 40%。", "優化高流量交易的資料庫查詢。"] }
    ]
  },
  awards: {
    title: '榮譽與獲獎',
    items: [
      { year: "2020", title: "金獎 (冠軍)", organization: "華南金控金融科技競賽", description: "API 實證組全國第一。主導金融服務架構設計與產品級 API 實作。" },
      { year: "2020", title: "第一名 (冠軍)", organization: "LINE Chatbot 對話機器人設計大賽", description: "開發「Shooly」，一個創新的水電服務預約機器人。" },
      { year: "2019-2020", title: "創業賽事常勝軍", organization: "經濟部 / 科技部 / 教育部", description: "獲選「創業歸故里」決賽團隊、FITI 激勵計畫全國 40 強、教育部 U-Start 補助，專注於創新技術轉商。" },
      { year: "2019", title: "第二名", organization: "中科智慧創新創業競賽", description: "開發線上智慧展覽館，讓使用者能在網站上身歷其境探索各種展覽。" },
      { year: "2019-2021", title: "網球成就", organization: "全大運 / 台科精誠盃", description: "十二年體保生生涯，曾獲台北市冠軍、大專盃團體第三、台科精誠盃男單冠軍，並擔任台科大網球隊隊長。" },
      { year: "2019-2021", title: "培育與研究計畫", organization: "資策會 / 台灣科技大學 / 竹科 / 中科", description: "入選資策會數位沙盒研究計畫，並受多個科學園區育成中心培育。" }
    ]
  },
  academic: {
    title: '研究基石',
    items: [
      { title: "碩士論文：CNN 效能預測", desc: "提出一個基於資料複雜度即可估算 CNN 準確率的框架，無需完整訓練。" },
      { title: "資安日誌異常偵測 (鎧俠 KIOXIA)", desc: "建立深度學習模型偵測系統日誌異常，用於零信任架構實作。" },
      { title: "容器基礎設施分析 (集保中心)", desc: "針對高負載金融系統進行 K8s、VM 與 Bare Metal 的效能權衡分析。" },
      { title: "事故肇責預測 (HGIGA)", desc: "基於 NLP 文本探勘事故報告，協助判定法律責任的輔助系統。" }
    ]
  },
  contact: {
    title: '讓我們 <span class="italic text-sub">聊聊。</span>',
    desc: '我目前開放新的合作機會。無論是對我的研究有疑問、專案提案，或者只是想討論哪支網球拍最好打，我都隨時歡迎。',
    copy: '複製 Email 地址',
    copied: '已複製',
    locations: ['台北', 'LinkedIn', 'GitHub']
  }
};

const en = {
  nav: {
    about: 'About',
    skills: 'Skills',
    projects: 'Projects',
    blog: 'Notes',
    awards: 'Awards',
    experience: 'Experience',
    contact: 'Contact',
  },
  hero: {
    role: 'ML x Full Stack x Athlete',
    name_first: 'Yen-Chia',
    name_last: 'Chen',
    value_prop: 'Building <span class="text-seal font-medium italic">intelligent interfaces</span> and system craft with an athlete’s discipline.',
    credentials: {
      academic: { label: 'Academic', value: 'M.S. in CS', sub: 'Natl. Taiwan Univ. of Sci & Tech' },
      award: { label: 'Athletics', value: '20Y+ Tennis Player', sub: 'Taipei Representative Team' },
      exp: { label: 'Experience', value: '6Y+ Production', sub: 'ML & Full-stack Systems' }
    },
    scroll: 'Scroll to Explore'
  },
  about: {
    index: 'Index 01 — Profile',
    philosophy_label: 'Core Philosophy',
    philosophy_quote: '“Pursue excellence, and success will follow.”',
    badge: 'About Me',
    title: "A Practitioner of the Ultimate Process",
    intro: "I graduated from the <span class=\"text-seal font-semibold\">M.S. program in Computer Science</span> at NTUST.<br /><br />Since childhood, my life has been an endless cross-disciplinary exploration: from being on varsity teams for tennis, table tennis, badminton, and swimming; to attending art, math, and Go gifted classes; to playing piano, xylophone, guitar, and violin. I’ve even summited Jade Mountain and trekked across the Central and Southern Cross-Island Highways.<br /><br />These experiences have shaped my belief: <span class=\"text-seal font-semibold\">valuing the \"process experience\" far more than the result allows me to focus entirely on iterative optimization and self-discipline</span>. To me, <span class=\"text-seal font-semibold\">excellence is simply the inevitable byproduct of focus and discipline</span>. In my experience, the results usually turn out quite well :>",
    pillars: {
      foundation: {
        title: "Academic",
        desc: "Research at NTUST focused on <span class=\"text-seal\">DL Performance Prediction</span> and data complexity. Predicting model performance prior to training with an error margin within <span class=\"text-seal\">10%</span>."
      },
      discipline: {
        title: "Experience",
        desc: "Covers CMS/ERP, Zero Trust RBAC, K8s implementation, NLP for stock sentiment, and AI-based traffic accident liability analysis."
      },
      impact: {
        title: "Tennis Life",
        desc: "In elementary school, I found a tennis racket in a garbage truck and begged my mom to let me join the team. That's how I became a student-athlete and joined the Taipei representative team. Now, it remains my sanctuary <3"
      },
      vision: {
        title: "Balance",
        desc: "It is because of the hard work on weekdays that the weekends feel so rewarding ฅ^•ﻌ•^ฅ"
      }
    },
    action: 'View Work',
    archives: 'Selected Archives',
    status: 'Open for Collaboration — 2025'
  },
  skills: {
    title: 'Skill Tree',
    index: '02 — Skills',
    categories: {
      ml: 'Machine Learning',
      frontend: 'Frontend',
      backend: 'Backend & Arch'
    }
  },
  projects: {
    index: '03 — Selected Works',
    title: 'Craft & <span class="italic text-sub">Experience.</span>',
    sub: 'Bridging rigorous engineering and human-centric design through detailed case studies.',
    categories: {
      all: 'All',
      web: 'Web App',
      mobile: 'Mobile',
      ai: 'AI / Bot',
      brand: 'Branding'
    },
    loading: 'Retrieving files...',
    case_study_label: 'Case Study',
    tech_stack: 'Tech Stack',
    role_label: 'Role',
    role_value: 'Tech Lead / UX Design',
    end_archive: 'End of Archive',
    close: 'Close'
  },
  blog: {
    title: 'Dev Log',
    sub: '/ Shared Wisdom',
    index: '03 — Notes',
    categories: {
      all: 'All',
      frontend: 'Frontend',
      backend: 'Backend',
      ml: 'ML',
      security: 'Security'
    },
    loading: 'Retrieving manuscripts...',
    reading_mode: 'Reading Mode',
    end: 'End of Transmission',
    back: 'Back to Log',
    read_article: 'Read More',
  },
  experience: {
    index: '04 — Timeline',
    title: 'Career <br/> Journey.',
    sub: 'A continuous process of refinement, from foundational research to architectural leadership.',
    items: [
      { role: "Full Stack Engineer (Freelance)", company: "Personal Studio", period: "2021 – Present", desc: ["Specialized in React & TypeScript for high-performance web applications.", "Delivered production-grade ESG platforms with complex data visualization.", "Consulting for SEO and Zero Trust security architectures."] },
      { role: "Co-Founder & CTO", company: "Homie Studio", period: "2019 – 2021", desc: ["Led technical strategy and product roadmap.", "Spearheaded the award-winning Fintech product 'PP-Bank'.", "Managed agile development cycles and cross-functional collaboration."] },
      { role: "R&D Engineer", company: "Supreme Electronics", period: "2016 – 2018", desc: ["Developed internal ERP/MIS systems using C# .NET.", "Modernized legacy codebases, improving maintainability by 40%.", "Optimized database queries for high-volume transactions."] }
    ]
  },
  awards: {
    title: 'Honors & Recognition',
    items: [
      { year: "2020", title: "Gold Award (Champion)", organization: "Hua Nan FinTech Competition", description: "1st place in the API Integration Track. Led financial architecture design and production-grade API implementation." },
      { year: "2020", title: "1st Place (Champion)", organization: "LINE Chatbot Design Competition", description: "Developed 'Shooly', an innovative chatbot for booking plumbing and electrical services." },
      { year: "2019-2020", title: "Entrepreneurship Series", organization: "MoEA / MoST / MoE", description: "Finalist in 'Startup Hometown', Top 40 in FITI program, and MoE U-Start Grant recipient." },
      { year: "2019", title: "Runner-up (2nd Place)", organization: "CTSP Smart Innovation Competition", description: "Developed an AI-driven virtual exhibition hall for immersive online touring experiences." },
      { year: "2019-2021", title: "Athletic Excellence", organization: "National Intercollegiate Games", description: "12 years as a competitive athlete. Taipei City Champion, 3rd in National Intercollegiate Games (Team), and NTUST Tennis Captain." },
      { year: "2019-2021", title: "Incubation & Research", organization: "III / NTUST / STSP / CTSP", description: "Selected for III Digital Sandbox Research Project and incubated across multiple National Science Parks." }
    ]
  },
  academic: {
    title: 'Research Foundation',
    items: [
      { title: "Master's Thesis: CNN Perf. Prediction", desc: "A framework to estimate CNN accuracy based on data complexity without full training." },
      { title: "Log Anomaly Detection (KIOXIA)", desc: "Deep learning models to detect system log anomalies for Zero Trust implementation." },
      { title: "Container Infra Analysis (TDCC)", desc: "Performance trade-off analysis of K8s, VM, and Bare Metal for high-load financial systems." },
      { title: "Accident Liability Prediction (HGIGA)", desc: "NLP-based system to assist legal liability determination from accident reports." }
    ]
  },
  contact: {
    title: 'Let\'s <span class="italic text-sub">Talk.</span>',
    desc: 'I am currently open to new opportunities. Whether it\'s a research inquiry, a project proposal, or just a chat about which tennis racket feels the best, feel free to reach out.',
    copy: 'Copy Email',
    copied: 'Copied',
    locations: ['Taipei', 'LinkedIn', 'GitHub']
  }
};

export const translations = {
  'zh-TW': zhTW,
  'en': en
};

export type Language = keyof typeof translations;

export const content = zhTW;

import fs from 'node:fs';
import path from 'node:path';
import { writeIndex } from './build-index.mjs';

const OUT = 'public/threads';

// 極簡 frontmatter 解析（大致仿照 utils/markdownLoader 的行為，但多了續行處理，
// 因為 markdownLoader 本身沒有處理跨行 value 的邏輯）
// 修正：real data 中 master-thesis.md 的 title 因來源檔案手動換行而跨兩行
// （`title: Data Complexity-aware Deep Model Performance\nForecasting`），
// 若不處理續行會被截斷成不完整標題，故補上「無冒號的行併入前一個字串 key」的續行邏輯。
function parse(text) {
  const clean = text.replace(/^﻿/, '').trimStart();
  const m = clean.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if (!m) return { meta: {}, body: clean };
  const meta = {};
  let lastKey = null;
  m[1].split(/\r?\n/).forEach(line => {
    line = line.trim(); if (!line || line.startsWith('#')) return;
    const i = line.indexOf(':');
    if (i < 0) {
      // 續行：沒有冒號的行，併入前一個字串型 key（例如換行的 title）
      if (lastKey && typeof meta[lastKey] === 'string') meta[lastKey] += ' ' + line;
      return;
    }
    const k = line.slice(0, i).trim(); let v = line.slice(i + 1).trim();
    if (v.startsWith('[') && v.endsWith(']')) meta[k] = v.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    else meta[k] = v.replace(/^['"]|['"]$/g, '');
    lastKey = k;
  });
  return { meta, body: m[2] };
}

const slugFromFile = f => path.basename(f, '.md');
function write(id, obj) {
  const dir = path.join(OUT, id);
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'post.json'), JSON.stringify(obj, null, 2));
}

// 1) 專案與文章推測日期（作者之後於後台微調）。key = 檔名 slug。
const DATES = {
  // 專案
  'master-thesis': '2025-06-01',
  'ppbank': '2020-08-01',
  'shooly': '2020-05-01',
  'lili': '2019-11-01',
  'constructing-an-enterprise-grade-cloud-native-headless-cms': '2023-09-01',
  'adaptive-zero-trust-architecture-via-deep-learning-log-analysis': '2024-03-01',
  'kubernetes-migration-strategy-and-hpa-latency-analysis': '2023-12-01',
  'semantic-reasoning-for-traffic-liability-determination-from-unstructured-text-to-automated-legal-attribution': '2024-06-01',
  'financial-sentiment-quantification-platform-via-heterogeneous-text-mining': '2023-05-01',
  'addressing-imbalance-in-UNSW': '2022-11-01',
  'neural-extractive-text-summarization-with-syntactic-compression': '2022-06-01',
  'flight-route-network-analysis-via-link-prediction-and-optimization': '2022-03-01',
  'vision-transformer-image-recognition-with-pure-attention': '2021-12-01',
  // 文章
  'long-text-to-image-converter-for-financial-reports': '2024-01-15',
  'applications-of-machine-learning-in-healthcare-research': '2023-10-01',
  'reconfigurable-process-element-design-for-edge-ai': '2023-08-01',
  'opportunity-and-challenge-of-ai-technique-on-satellite-remote-sensing': '2023-06-01',
  'the-future-of-computer-interfaces-in-metaverse': '2022-09-01',
  'machine-learning-enabled-minimal-latency-wireless-networking-for-emerging-ai-applications': '2023-03-01',
  'winograd-architecture-design-for-edge-ai-accelerator': '2023-01-01',
};

function migrateDir(srcDir, typeTag) {
  if (!fs.existsSync(srcDir)) return 0;
  let n = 0;
  for (const f of fs.readdirSync(srcDir).filter(x => x.endsWith('.md'))) {
    const slug = slugFromFile(f);
    const { meta, body } = parse(fs.readFileSync(path.join(srcDir, f), 'utf8'));
    const date = DATES[slug] || '2023-01-01';
    const id = `${date.replace(/-/g, '')}-${slug}`;
    const tags = [typeTag, ...(Array.isArray(meta.tags) ? meta.tags : [])];
    write(id, {
      id, date, title: meta.title || slug, tags, status: 'done',
      body, cover: undefined, replies: [],
      // imageUrl 為外部 URL；放進 body 開頭當封面圖，保留不破圖
    });
    if (meta.imageUrl) {
      const p = path.join(OUT, id, 'post.json');
      const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
      obj.cover = meta.imageUrl;              // threadImageUrl 對 http 開頭原樣輸出
      fs.writeFileSync(p, JSON.stringify(obj, null, 2));
    }
    n++;
  }
  return n;
}

// 2) 經歷（內嵌自 locales zh-TW）
const EXPERIENCE = [
  { date: '2021-01-01', role: '全端工程師', company: '個人工作室', desc: ['精通 TypeScript / React / Go 生態系。', '為上市公司提供 ESG 平台、CMS 後台與品牌形象網站開發。', '對我而言，寫 Code 是冥想的一種。'] },
  { date: '2019-01-01', role: '共同創辦人 & CTO', company: 'Homie Studio', desc: ['負責 Swift / Java 行動應用開發。', '研發多款獲獎產品，包含金融與居家服務 App。', '曾經有過連續 56 小時在線 Debug 的紀錄。'] },
  { date: '2016-01-01', role: '研發工程師', company: '至上電子', desc: ['使用 C# / .NET / MySQL 構建企業基礎設施。', '開發與維護內部 MIS 與 ERP 系統。'] },
  { date: '2017-09-01', role: '學士 / 碩士', company: '臺灣科技大學', desc: ['專研 C++ / Python 與深度學習應用。', '主導多項產學合作與資安國際論文發表。'] },
];
// 3) 獎項（內嵌自 locales zh-TW）
const AWARDS = [
  { date: '2020-11-01', title: '金獎（冠軍）', org: '華南金控金融科技競賽', desc: 'API 實證組全國第一。主導金融服務架構設計與產品級 API 實作。' },
  { date: '2020-06-01', title: '第一名（冠軍）', org: 'LINE Chatbot 對話機器人設計大賽', desc: '開發「Shooly」，一個創新的水電服務預約機器人。' },
  { date: '2020-01-01', title: '創業賽事常勝軍', org: '經濟部 / 科技部 / 教育部', desc: '創業歸故里決賽、FITI 全國 40 強、教育部 U-Start 補助。' },
  { date: '2019-05-01', title: '第二名', org: '中科智慧創新創業競賽', desc: '開發線上智慧展覽館。' },
  { date: '2019-01-01', title: '網球成就', org: '全大運 / 台科精誠盃', desc: '十二年體保生生涯，台北市冠軍、台科精誠盃男單冠軍，台科大網球隊隊長。' },
];

function migrateExperience() {
  EXPERIENCE.forEach((e, i) => {
    const id = `${e.date.replace(/-/g, '')}-exp-${i}`;
    write(id, { id, date: e.date, title: `${e.role}｜${e.company}`, tags: ['經歷'], status: 'done',
      body: e.desc.map(d => `- ${d}`).join('\n'), replies: [] });
  });
  return EXPERIENCE.length;
}
function migrateAwards() {
  AWARDS.forEach((a, i) => {
    const id = `${a.date.replace(/-/g, '')}-award-${i}`;
    write(id, { id, date: a.date, title: a.title, tags: ['獎項'], status: 'done',
      body: `**${a.org}**\n\n${a.desc}`, replies: [] });
  });
  return AWARDS.length;
}

const counts = {
  projects: migrateDir('public/projects', '作品'),
  posts: migrateDir('public/posts', '文章'),
  experience: migrateExperience(),
  awards: migrateAwards(),
};
const idx = writeIndex();
console.log('遷移完成', counts, '→ index 共', idx.length, '則');

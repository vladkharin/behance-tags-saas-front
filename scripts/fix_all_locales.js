import fs from "fs";

const enPath = "./src/locales/en.json";
const ruPath = "./src/locales/ru.json";

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));

// 1. Dashboard Header
ru.dashboard.header = {
  robot: "РОБОТ",
  robotOff: "ВЫКЛЮЧЕН",
  robotActive24h: "АКТИВЕН (24Ч)",
  robotActive3d: "АКТИВЕН (3 ДН)",
  robotActive7d: "АКТИВЕН (7 ДН)",
  fuel: "ТОПЛИВО: {{count}} ТЕГОВ",
  topUp: "ПОПОЛНИТЬ",
  viewOnBehance: "Посмотреть на Behance",
  shareReport: "Поделиться отчетом",
  videoGuide: "Видео-гид",
  deleteProject: "Удалить проект",
  updateBtn: "ОБНОВИТЬ ПОЗИЦИИ",
  updateBtnPending: "⏳ В ОЧЕРЕДИ",
  updateBtnProcessing: "🤖 СКАНИРОВАНИЕ..."
};

en.dashboard.header = {
  robot: "ROBOT",
  robotOff: "OFF",
  robotActive24h: "ACTIVE (24H)",
  robotActive3d: "ACTIVE (3D)",
  robotActive7d: "ACTIVE (7D)",
  fuel: "FUEL: {{count}} TAGS",
  topUp: "TOP UP",
  viewOnBehance: "View on Behance",
  shareReport: "Share Report",
  videoGuide: "Video Tour",
  deleteProject: "Delete Project",
  updateBtn: "UPDATE RANKINGS",
  updateBtnPending: "⏳ QUEUED",
  updateBtnProcessing: "🤖 SCANNING..."
};

// 2. Dashboard Metrics
ru.dashboard.metrics = {
  verdictSubtitle: "РЕЗУЛЬТАТ ПРОВЕРКИ ТЕГОВ В ПОИСКЕ BEHANCE",
  verdictTop10: "🔥 {{top10}} из {{total}} тегов в ТОП-10 выдачи!",
  verdictChecked: "📊 Проверено {{total}} тегов",
  copyTagsForBehance: "Скопировать теги для Behance",
  top10CardTitle: "В ТОП-10 (Дают просмотры)",
  top10CardSubtitle: "Кейс на первых местах в выдаче",
  potentialCardTitle: "На подходе (11-30 место)",
  potentialCardSubtitle: "Близко к ТОПу, есть потенциал роста",
  lostCardTitle: "Вне поиска (Не находит)",
  lostCardSubtitle: "По этим тегам трафик не идет",
  behanceStats: "Статистика кейса на Behance:",
  testedTitle: "Проверено {{count}} тегов",
  top10Title: "В ТОП-10 (Дают просмотры)",
  top10Subtitle: "Кейс на первых местах в выдаче",
  potentialTitle: "На подходе (11-30 место)",
  potentialSubtitle: "Близко к ТОПу, есть потенциал роста",
  lostTitle: "Вне поиска (Не находит)",
  lostSubtitle: "По этим тегам трафик не идет",
  statsViews: "Просмотры",
  statsLikes: "Лайки",
  statsComments: "Комменты",
  statsPrefix: "Статистика кейса на Behance:"
};

en.dashboard.metrics = {
  verdictSubtitle: "BEHANCE SEARCH TAGS AUDIT RESULT",
  verdictTop10: "🔥 {{top10}} of {{total}} tags in TOP-10 search results!",
  verdictChecked: "📊 Checked {{total}} tags",
  copyTagsForBehance: "Copy tags for Behance",
  top10CardTitle: "IN TOP-10 (Drive views)",
  top10CardSubtitle: "Case is on the first search places",
  potentialCardTitle: "On the approach (11-30 rank)",
  potentialCardSubtitle: "Close to TOP, high growth potential",
  lostCardTitle: "Outside search (Not found)",
  lostCardSubtitle: "No organic search traffic here yet",
  behanceStats: "Behance project stats:",
  testedTitle: "Checked {{count}} tags",
  top10Title: "IN TOP-10 (Drive views)",
  top10Subtitle: "Case is on the first search places",
  potentialTitle: "On the approach (11-30 rank)",
  potentialSubtitle: "Close to TOP, high growth potential",
  lostTitle: "Outside search (Not found)",
  lostSubtitle: "No organic search traffic here yet",
  statsViews: "Views",
  statsLikes: "Likes",
  statsComments: "Comments",
  statsPrefix: "Behance project stats:"
};

// 3. Sidebar
ru.sidebar = {
  monitoredCases: "КЕЙСЫ НА МОНИТОРИНГЕ ({{current}}/{{max}})",
  newProject: "НОВЫЙ ПРОЕКТ",
  newProjectBtn: "＋ Новый проект",
  addProjectBtn: "＋ Добавить проект",
  adminPanel: "ПАНЕЛЬ УПРАВЛЕНИЯ",
  plansBtn: "ТАРИФЫ",
  upgradeBtn: "UPGRADE",
  profileBtn: "ЛИЧНЫЙ КАБИНЕТ",
  adminBtn: "Панель администратора",
  logoutBtn: "ВЫЙТИ",
  limitBadge: "Лимит исчерпан"
};

en.sidebar = {
  monitoredCases: "MONITORED CASES ({{current}}/{{max}})",
  newProject: "NEW PROJECT",
  newProjectBtn: "＋ New Project",
  addProjectBtn: "＋ Add Project",
  adminPanel: "ADMIN PANEL",
  plansBtn: "PLANS",
  upgradeBtn: "UPGRADE",
  profileBtn: "PERSONAL ACCOUNT",
  adminBtn: "Admin Panel",
  logoutBtn: "LOG OUT",
  limitBadge: "Limit Reached"
};

// 4. Matrix & Charts
ru.dashboard.matrix.copyDropdown = "Скопировать теги";
ru.dashboard.matrix.copyComma = "Через запятую (для Behance)";
ru.dashboard.matrix.copyExcel = "Столбцом для Excel";
ru.dashboard.matrix.copyHashtags = "С хэштегами (#tag)";
ru.dashboard.matrix.copyQuotes = 'В кавычках ("tag")';
ru.dashboard.matrix.copyOnlyTop10 = "Только ТОП-10 (через запятую)";
ru.dashboard.matrix.copyTop10Excel = "Только ТОП-10 (столбцом для Excel)";

en.dashboard.matrix.copyDropdown = "Copy Tags";
en.dashboard.matrix.copyComma = "Comma-separated (for Behance)";
en.dashboard.matrix.copyExcel = "Column for Excel / Sheets";
en.dashboard.matrix.copyHashtags = "With hashtags (#tag)";
en.dashboard.matrix.copyQuotes = 'In quotes ("tag")';
en.dashboard.matrix.copyOnlyTop10 = "TOP-10 only (comma-separated)";
en.dashboard.matrix.copyTop10Excel = "TOP-10 only (column for Excel)";

ru.dashboard.chart.historyPaywallTitle = "История позиций по дням";
ru.dashboard.chart.historyPaywallSubtitle = "Графики истории изменений за 14 дней доступны на тарифах Daily Fresh и Pro Stream";
ru.dashboard.chart.learnMore = "Узнать больше";

en.dashboard.chart.historyPaywallTitle = "Position History by Day";
en.dashboard.chart.historyPaywallSubtitle = "14-day position history charts are available on Daily Fresh & Pro Stream plans";
en.dashboard.chart.learnMore = "Learn More";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8");
console.log("All locale keys successfully synchronized!");

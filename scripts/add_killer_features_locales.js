import fs from "fs";

const ruPath = "./src/locales/ru.json";
const enPath = "./src/locales/en.json";

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

// 1. Plan feature
ru.plans.features.telegramAlerts = "📲 Telegram-бот утренних отчетов 24/7";
en.plans.features.telegramAlerts = "📲 Daily Telegram Rank Alerts Bot";

// 2. Profile Telegram section
ru.profile.telegram = {
  title: "Telegram-уведомления (Pro Stream)",
  connected: "Бот подключен",
  disconnected: "Бот не подключен",
  connectBtn: "Подключить @BeRankedAlertsBot",
  connectedDesc: "Утренняя сводка позиций отправляется ежедневно в 09:00 МСК.",
  proOnlyDesc: "Доступно на тарифе Pro Stream. Получайте уведомления о взлетах в ТОП-10 и падениях прямо в Telegram.",
  upgradeBtn: "Перейти на Pro Stream (890 ₽)",
  morningDigest: "Утренний дайджест позиций (09:00)",
  top10Alert: "Уведомление о выходе в ТОП-10",
  rankDropAlert: "Предупреждение о падении позиций"
};

en.profile.telegram = {
  title: "Telegram Rank Alerts (Pro Stream)",
  connected: "Bot connected",
  disconnected: "Bot not connected",
  connectBtn: "Connect @BeRankedAlertsBot",
  connectedDesc: "Daily position summary delivered every morning at 09:00.",
  proOnlyDesc: "Available on Pro Stream plan. Receive alerts on TOP-10 breakthroughs and rank drops directly in Telegram.",
  upgradeBtn: "Upgrade to Pro Stream ($8.99)",
  morningDigest: "Morning Position Digest (09:00)",
  top10Alert: "Instant TOP-10 Breakthrough Alert",
  rankDropAlert: "Rank Drop Warning Alert"
};

// 3. Share Stories / Flex Card Modal
ru.dashboard.shareModal = {
  title: "Генератор карточек для соцсетей",
  subtitle: "Поделитесь результатами и попаданием в ТОП-10 в Instagram Stories, Telegram или LinkedIn",
  formatStories: "📱 Stories (9:16)",
  formatPost: "📸 Квадрат (1:1)",
  formatBanner: "📊 Баннер (16:9)",
  downloadBtn: "Скачать изображение (HD)",
  copiedToast: "Карточка скопирована в буфер обмена! 📸",
  verifiedBadge: "Проверено через BeRanked",
  topRankedHeading: "ТОП ПОЗИЦИИ В ПОИСКЕ",
  caseRankedTop: "КЕЙС В ТОП-10 ВЫДАЧИ BEHANCE"
};

en.dashboard.shareModal = {
  title: "Social Share & Stories Generator",
  subtitle: "Flex your TOP-10 Behance rankings in Instagram Stories, Telegram, or LinkedIn",
  formatStories: "📱 Stories (9:16)",
  formatPost: "📸 Post (1:1)",
  formatBanner: "📊 Banner (16:9)",
  downloadBtn: "Download Image (HD)",
  copiedToast: "Card copied to clipboard! 📸",
  verifiedBadge: "Verified by BeRanked",
  topRankedHeading: "TOP BEHANCE SEARCH RANKS",
  caseRankedTop: "CASE IN BEHANCE SEARCH TOP-10"
};

fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8");
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
console.log("Locales for Telegram alerts & Flex Stories cards added!");

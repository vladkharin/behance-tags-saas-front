import fs from "fs";

const ruPath = "./src/locales/ru.json";
const enPath = "./src/locales/en.json";

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

// 1. Dashboard Statuses
ru.dashboard.status = {
  pending: "В очереди",
  scraping: "Парсинг...",
  checking: "Проверка...",
  idle: "Готов"
};

en.dashboard.status = {
  pending: "Queued",
  scraping: "Fetching...",
  checking: "Checking...",
  idle: "Ready"
};

// 2. Dashboard Demo & Stats & Meta
ru.dashboard.demo = {
  badge: "ДЕМО-РЕЖИМ",
  restricted: "В демо-режиме функции анализа ограничены. Добавьте свой проект для полной работы."
};

en.dashboard.demo = {
  badge: "DEMO MODE",
  restricted: "In demo mode, analysis features are restricted. Add your own project for full access."
};

ru.dashboard.stats = {
  views: "Просмотры",
  likes: "Лайки",
  comments: "Комменты"
};

en.dashboard.stats = {
  views: "Views",
  likes: "Likes",
  comments: "Comments"
};

ru.dashboard.meta = {
  plan: "Тариф",
  update: "Авто-обновление",
  balance: "Баланс тегов"
};

en.dashboard.meta = {
  plan: "Plan",
  update: "Auto-update",
  balance: "Tag Balance"
};

ru.dashboard.emptyState = {
  title: "Начните мониторинг",
  subtitle: "Вставьте ссылку на кейс и узнайте свои позиции в поиске Behance за секунды",
  demoBtn: "Посмотреть на демо-проекте"
};

en.dashboard.emptyState = {
  title: "Start Monitoring",
  subtitle: "Paste your case URL and discover your Behance search rankings in seconds",
  demoBtn: "Try Interactive Demo"
};

// 3. Toasts
ru.dashboard.toasts.importSuccess = "Кейс успешно добавлен и запущен на анализ! 🎉";
ru.dashboard.toasts.importError = "Не удалось добавить кейс. Проверьте ссылку.";
ru.dashboard.toasts.refreshSent = "Запрос на сканирование отправлен!";
ru.dashboard.toasts.scheduleEnabled = "Авто-обновление включено";
ru.dashboard.toasts.scheduleDisabled = "Авто-обновление выключено";

en.dashboard.toasts.importSuccess = "Case imported successfully and queued for analysis! 🎉";
en.dashboard.toasts.importError = "Failed to import case. Please check URL.";
en.dashboard.toasts.refreshSent = "Rank scan request sent!";
en.dashboard.toasts.scheduleEnabled = "Auto-update enabled";
en.dashboard.toasts.scheduleDisabled = "Auto-update disabled";

// 4. Sidebar & Footer keys
ru.sidebar.logout = "Выйти";
en.sidebar.logout = "Log Out";

ru.footer.help = "Инструкция";
ru.footer.terms = "Оферта";
ru.footer.privacy = "Конфиденциальность";
ru.footer.refund = "Возврат";

en.footer.help = "Manual & Help";
en.footer.terms = "Terms of Service";
en.footer.privacy = "Privacy Policy";
en.footer.refund = "Refund Policy";

ru.dashboard.metrics.tags = "тегов";
en.dashboard.metrics.tags = "tags";

// 5. Help Page
en.help = {
  title: "How It Works",
  back: "← Back",
  updated: "Guide updated for 2026",
  steps: {
    step1Title: "1. Paste your Behance project link",
    step1Desc: "Copy URL from browser address bar (e.g. behance.net/gallery/123456/Project) and paste into BeRanked.",
    step2Title: "2. Automatic robot analysis",
    step2Desc: "Our scraper retrieves all tags and queries Behance search engine to detect your exact rankings across all keywords.",
    step3Title: "3. Track dynamics & optimize",
    step3Desc: "Monitor growth on charts, replace underperforming tags, and climb into the TOP-10 search results to attract paying clients."
  }
};

// 6. Privacy Page
en.privacy = {
  title: "Privacy Policy",
  updated: "Effective Date: July 15, 2026",
  back: "← Back to Home",
  intro: "This Privacy Policy defines how BeRanked collects, stores, and protects personal data provided by users of the service.",
  section1Title: "1. General Provisions",
  section1Text: "We respect user privacy and comply with global data protection standards (GDPR-aligned). We never sell personal data to third parties.",
  section2Title: "2. Data We Collect",
  section2Text: "We only collect essential data: email address for account authentication and publicly accessible Behance project URLs provided by users.",
  section3Title: "3. Data Security",
  section3Text: "All network traffic is encrypted using TLS/SSL. Passwords and sensitive authentication tokens are hashed using industry-standard cryptographic algorithms.",
  requisites: {
    title: "Operator Information",
    name: "Vladislav Kharin (Individual Entrepreneur)",
    email: "dom.craft.digital@gmail.com",
    inn: "Tax ID: 563811937786"
  }
};

// 7. Refund Policy
en.refund = {
  title: "Refund Policy",
  updated: "Effective Date: July 15, 2026",
  back: "← Back",
  intro: "You may cancel your paid subscription or request a refund at any time in accordance with the terms below.",
  section1Title: "1. Eligibility for Refunds",
  section1Text: "If you encountered technical malfunctions that prevented you from using the service, or made an unintended duplicate payment, you are eligible for a 100% full refund within 14 days of purchase.",
  stepsTitle: "2. How to Request a Refund",
  stepsDesc: "If you made an accidental payment or experienced service issues, follow these steps:",
  step1: "1. Email our support team at dom.craft.digital@gmail.com.",
  step2: "2. State your registered account email and transaction date.",
  step3: "3. Our team will review your request and process the refund within 24 hours.",
  footer: {
    timeline: "Processing Time: Funds are returned to your original payment method within 5–10 business days depending on your bank.",
    warning: "Notice: Refunds are issued for the full amount paid. We do not charge processing cancellation fees."
  }
};

// 8. Offer & Terms of Service
en.offer = {
  title: "Public Offer & Terms of Service",
  updated: "Effective Date: July 15, 2026",
  back: "← Back",
  warning: "Please read these Terms carefully. Registering an account or purchasing subscription services constitutes your unconditional acceptance of this Agreement.",
  section1Title: "1. Subject of the Agreement",
  section1Text: "The Contractor provides the Customer with access to the BeRanked cloud software for monitoring search rankings of publicly available creative portfolios.",
  section2Title: "2. Service Conditions",
  section2Text: "The service is provided on an 'as-is' and 'as-available' basis. The Contractor guarantees 100% account safety and does not require or store client Behance passwords.",
  requisites: {
    title: "Contractor Information",
    name: "Vladislav Kharin",
    inn: "Tax ID: 563811937786",
    email: "dom.craft.digital@gmail.com"
  }
};

fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8");
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
console.log("Full audit fixes applied to ru.json and en.json!");

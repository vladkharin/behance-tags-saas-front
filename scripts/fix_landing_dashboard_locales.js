import fs from "fs";

const ruPath = "./src/locales/ru.json";
const enPath = "./src/locales/en.json";

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

// 1. Landing Guides & Nav
ru.landing.nav.guides = "📚 Гайды";
en.landing.nav.guides = "📚 Guides";

ru.landing.guides = {
  badge: "📚 База знаний",
  title: "Полезные SEO-гайды для дизайнеров",
  subtitle: "Практические статьи о продвижении кейсов, подборе тегов и алгоритмах поиска.",
  allArticles: "Все статьи ({{count}})",
  readGuide: "Читать гайд ➔"
};

en.landing.guides = {
  badge: "📚 Knowledge Base",
  title: "Actionable SEO Guides for Designers",
  subtitle: "Practical articles on portfolio growth, tag optimization, and Behance search algorithms.",
  allArticles: "All Articles ({{count}})",
  readGuide: "Read Guide ➔"
};

// 2. Dashboard Dialogs
ru.dashboard.dialogs.fuelTitle = "Недостаточно тегов Fuel";
ru.dashboard.dialogs.fuelMessage = "Для сканирования требуется {{required}} тегов. Ваш текущий баланс: {{balance}}. Пополните баланс тегов!";
ru.dashboard.dialogs.fuelConfirm = "Пополнить баланс";
ru.dashboard.dialogs.fuelCancel = "Отмена";

ru.dashboard.dialogs.deleteTitle = "Удаление кейса";
ru.dashboard.dialogs.deleteMessageFree = "Вы уверены, что хотите удалить проект \"{{title}}\"? На бесплатном тарифе замена кейса доступна раз в 7 дней.";
ru.dashboard.dialogs.deleteMessagePro = "Вы уверены, что хотите удалить проект \"{{title}}\"?";
ru.dashboard.dialogs.deleteConfirm = "Да, удалить";
ru.dashboard.dialogs.deleteCancel = "Отмена";

en.dashboard.dialogs.fuelTitle = "Insufficient Fuel Credits";
en.dashboard.dialogs.fuelMessage = "Scanning requires {{required}} tags. Your current balance is {{balance}}. Top up your tag balance to continue!";
en.dashboard.dialogs.fuelConfirm = "Top Up Fuel";
en.dashboard.dialogs.fuelCancel = "Cancel";

en.dashboard.dialogs.deleteTitle = "Delete Project";
en.dashboard.dialogs.deleteMessageFree = "Are you sure you want to delete project \"{{title}}\"? On the Free plan, project slot can be changed once every 7 days.";
en.dashboard.dialogs.deleteMessagePro = "Are you sure you want to delete project \"{{title}}\"?";
en.dashboard.dialogs.deleteConfirm = "Yes, Delete";
en.dashboard.dialogs.deleteCancel = "Cancel";

// 3. Additional Dashboard Toasts
ru.dashboard.toasts.demoChartNotice = "В демо-режиме отображаются демонстрационные данные графика";
ru.dashboard.toasts.demoRobotNotice = "В демо-режиме робот включен по умолчанию";
ru.dashboard.toasts.scheduleError = "Не удалось изменить расписание робота";
ru.dashboard.toasts.demoCustomTagsAdded = "Кастомные теги добавлены в демо-матрицу!";
ru.dashboard.toasts.customTagsAdded = "Добавлено {{count}} тегов в анализ! 🚀";
ru.dashboard.toasts.customTagsError = "Не удалось добавить кастомные теги";
ru.dashboard.toasts.demoTagAdded = "Тег #{{tag}} добавлен в демо!";
ru.dashboard.toasts.tagAdded = "Рекомендованный тег #{{tag}} добавлен в мониторинг! 🚀";
ru.dashboard.toasts.tagAddError = "Не удалось добавить рекомендованный тег";
ru.dashboard.toasts.demoTagRemoved = "Тег #{{tag}} удален из демо";
ru.dashboard.toasts.tagRemoved = "Тег #{{tag}} удален из мониторинга кейса";
ru.dashboard.toasts.tagRemoveError = "Ошибка при удалении тега";
ru.dashboard.toasts.demoCannotDelete = "Демо-проект нельзя удалить";
ru.dashboard.toasts.deleteSuccess = "Проект успешно удален";
ru.dashboard.toasts.deleteError = "Ошибка при удалении проекта";

en.dashboard.toasts.demoChartNotice = "Interactive demo shows sample ranking timeline data";
en.dashboard.toasts.demoRobotNotice = "Auto-update robot is active by default in demo mode";
en.dashboard.toasts.scheduleError = "Failed to update robot schedule";
en.dashboard.toasts.demoCustomTagsAdded = "Custom tags added to demo matrix!";
en.dashboard.toasts.customTagsAdded = "Added {{count}} tags to analysis! 🚀";
en.dashboard.toasts.customTagsError = "Failed to add custom tags";
en.dashboard.toasts.demoTagAdded = "Tag #{{tag}} added to demo!";
en.dashboard.toasts.tagAdded = "Recommended tag #{{tag}} added to tracking! 🚀";
en.dashboard.toasts.tagAddError = "Failed to add recommended tag";
en.dashboard.toasts.demoTagRemoved = "Tag #{{tag}} removed from demo";
en.dashboard.toasts.tagRemoved = "Tag #{{tag}} removed from tracking";
en.dashboard.toasts.tagRemoveError = "Failed to remove tag";
en.dashboard.toasts.demoCannotDelete = "Demo project cannot be deleted";
en.dashboard.toasts.deleteSuccess = "Project deleted successfully";
en.dashboard.toasts.deleteError = "Failed to delete project";

fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8");
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
console.log("Landing and Dashboard extra locale keys written!");

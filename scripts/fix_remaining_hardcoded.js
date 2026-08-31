import fs from "fs";

const ruPath = "./src/locales/ru.json";
const enPath = "./src/locales/en.json";

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

// 1. Auth check spam
ru.auth.checkSpamNote = "Проверьте папку «Входящие» и «Спам»";
en.auth.checkSpamNote = "Check your Inbox and Spam folders";

// 2. Matrix Headings
ru.dashboard.matrix.allTagsHeading = "Все теги ({{count}})";
ru.dashboard.matrix.top10Heading = "ТОП-10 ТЕГИ ({{count}})";
ru.dashboard.matrix.deleteTagTooltip = "Удалить #{{tag}}";

en.dashboard.matrix.allTagsHeading = "All Tags ({{count}})";
en.dashboard.matrix.top10Heading = "TOP-10 TAGS ({{count}})";
en.dashboard.matrix.deleteTagTooltip = "Remove #{{tag}}";

// 3. Share card
ru.dashboard.share = {
  downloadSuccess: "Карточка отчета успешно скачана! 📸",
  downloadError: "Не удалось сгенерировать PNG файл"
};

en.dashboard.share = {
  downloadSuccess: "Share card downloaded successfully! 📸",
  downloadError: "Failed to generate PNG image"
};

// 4. Video animation stages
ru.onboarding.videoModal.stage2Scanning = "Робот сканирует поиск Behance...";
ru.onboarding.videoModal.stage2Searching = "Проверка позиций среди 500,000+ конкурирующих проектов";
ru.onboarding.videoModal.stage3Results = "Результаты сканирования:";
ru.onboarding.videoModal.stage3Visibility = "Индекс видимости: 85% 🔥";
ru.onboarding.videoModal.stage4Reach = "+350% Охватов на Behance";
ru.onboarding.videoModal.stage4Desc = "Теги вышли в ТОП-10 поиска. Копируйте готовый список в кейс!";
ru.onboarding.videoModal.stage4CopyBtn = "Скопировать для Behance";

en.onboarding.videoModal.stage2Scanning = "Robot scanning Behance search...";
en.onboarding.videoModal.stage2Searching = "Auditing ranks across 500,000+ competing projects";
en.onboarding.videoModal.stage3Results = "Rank Scan Results:";
en.onboarding.videoModal.stage3Visibility = "Visibility Index: 85% 🔥";
en.onboarding.videoModal.stage4Reach = "+350% Behance Reach";
en.onboarding.videoModal.stage4Desc = "Tags skyrocketed to TOP-10 search. Copy optimized list to your case!";
en.onboarding.videoModal.stage4CopyBtn = "Copy tags for Behance";

fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8");
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
console.log("Remaining hardcoded translations added to locales!");

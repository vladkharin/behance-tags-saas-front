import fs from "fs";

const ruPath = "./src/locales/ru.json";
const enPath = "./src/locales/en.json";

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

const ruExtra = {
  stepPrefix: "Шаг 0{{num}}",
  howItWorks: "💡 Как это работает:",
  customVideoBtn: "+ Вставить собственную ссылку на видео (YouTube / Loom)",
  customVideoPlaceholder: "Вставьте ссылку на YouTube (например: https://www.youtube.com/embed/...)",
  closeBtn: "Понятно, хочу попробовать! 🚀"
};

const enExtra = {
  stepPrefix: "Step 0{{num}}",
  howItWorks: "💡 How it works:",
  customVideoBtn: "+ Add custom video URL (YouTube / Loom)",
  customVideoPlaceholder: "Paste YouTube embed URL (e.g. https://www.youtube.com/embed/...)",
  closeBtn: "Got it, let's try! 🚀"
};

Object.assign(ru.onboarding.videoModal, ruExtra);
Object.assign(en.onboarding.videoModal, enExtra);

fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8");
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
console.log("Video modal locale keys successfully added!");

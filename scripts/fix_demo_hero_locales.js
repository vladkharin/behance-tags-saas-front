import fs from "fs";

const ruPath = "./src/locales/ru.json";
const enPath = "./src/locales/en.json";

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

ru.landing.hero.badgeTop10 = "↑ ТОП-10 (8 тегов)";
en.landing.hero.badgeTop10 = "↑ TOP-10 (8 tags)";

ru.dashboard.demo.bannerText = "Вы находитесь в интерактивном Демо-режиме (Smart Watch UI/UX Case).";
en.dashboard.demo.bannerText = "You are exploring in interactive Demo Mode (Smart Watch UI/UX Case).";

fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8");
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
console.log("Demo banner and hero badge localized!");

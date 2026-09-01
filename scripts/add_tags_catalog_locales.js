import fs from "fs";

const ruPath = "./src/locales/ru.json";
const enPath = "./src/locales/en.json";

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

ru.footer.tagsCatalog = "ТОП теги по нишам";
en.footer.tagsCatalog = "Tags Catalog";

ru.landing.nav.tagsCatalog = "Каталог тегов";
en.landing.nav.tagsCatalog = "Tags Directory";

fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8");
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8");
console.log("Locale keys for tags catalog added!");

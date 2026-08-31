import fs from "fs";
import path from "path";

const ruPath = "./src/locales/ru.json";
const enPath = "./src/locales/en.json";

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

// Flatten object to dot-notation keys
function flattenObj(obj, prefix = "") {
  let res = {};
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      Object.assign(res, flattenObj(val, key));
    } else {
      res[key] = val;
    }
  }
  return res;
}

const ruFlat = flattenObj(ru);
const enFlat = flattenObj(en);

console.log("Total RU keys:", Object.keys(ruFlat).length);
console.log("Total EN keys:", Object.keys(enFlat).length);

// 1. Missing in EN
const missingInEn = Object.keys(ruFlat).filter((k) => enFlat[k] === undefined);
console.log("\n--- Keys in RU but MISSING in EN ---");
console.log(missingInEn);

// 2. Missing in RU
const missingInRu = Object.keys(enFlat).filter((k) => ruFlat[k] === undefined);
console.log("\n--- Keys in EN but MISSING in RU ---");
console.log(missingInRu);

// 3. Russian text inside en.json (Cyrillic characters in values)
const cyrillicPattern = /[а-яА-ЯёЁ]/;
const untranslatedInEn = [];

for (const [k, v] of Object.entries(enFlat)) {
  if (typeof v === "string" && cyrillicPattern.test(v)) {
    untranslatedInEn.push({ key: k, value: v });
  }
}

console.log("\n--- Cyrillic (Untranslated) strings found in en.json ---");
console.log(untranslatedInEn);

// 4. Scan all .tsx/.ts files for t("...") calls and check if they exist in ruFlat and enFlat
function scanFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && file !== ".git") {
        results = results.concat(scanFiles(fullPath));
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

const allCodeFiles = scanFiles("./src");
const tCallRegex = /t\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g;
const missingInLocales = [];

for (const file of allCodeFiles) {
  const content = fs.readFileSync(file, "utf8");
  let match;
  while ((match = tCallRegex.exec(content)) !== null) {
    const key = match[1];
    if (ruFlat[key] === undefined || enFlat[key] === undefined) {
      missingInLocales.push({ file: path.relative(".", file), key, missingInRu: ruFlat[key] === undefined, missingInEn: enFlat[key] === undefined });
    }
  }
}

console.log("\n--- Keys used in code with t() but MISSING in locale files ---");
console.log(missingInLocales);

import fs from "fs";
import path from "path";

function scanDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && file !== ".git" && file !== "__tests__") {
        results = results.concat(scanDir(fullPath));
      }
    } else if (file.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

const cyrillicRegex = /[а-яА-ЯёЁ]{3,}/;
const files = scanDir("./src");
const findings = [];

for (const file of files) {
  // Skip guidesData.ts which is intended to have rich article content
  if (file.includes("guidesData")) continue;

  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    // Ignore comments
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;

    if (cyrillicRegex.test(line)) {
      findings.push({
        file: path.relative(".", file),
        line: idx + 1,
        text: trimmed
      });
    }
  });
}

console.log("Found hardcoded Cyrillic strings in JSX/TSX files:");
console.log(JSON.stringify(findings, null, 2));

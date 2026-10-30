import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSitemapEntries, getPageMetadata } from "../dist-ssr/entry-server.js";

const entries = getSitemapEntries();
const sitemap = await readFile("dist/sitemap.xml", "utf8");
const titles = new Set();
for (const entry of entries) {
  const file = path.join("dist", entry.path.slice(1), "index.html");
  const html = await readFile(file, "utf8");
  const expected = getPageMetadata(entry.path);
  const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  assert.equal(canonical.length, 1, `${entry.path}: expected exactly one canonical`);
  assert.equal(canonical[0][1], expected.canonical, `${entry.path}: wrong canonical`);
  assert.ok(sitemap.includes(`<loc>${expected.canonical}</loc>`), `${entry.path}: missing from sitemap`);
  assert.ok(!titles.has(expected.title), `${entry.path}: duplicate title`);
  titles.add(expected.title);
  assert.ok(html.includes('<meta name="robots" content="index, follow"'), `${entry.path}: not indexable`);
  const body = html.slice(html.indexOf("<body>")).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.match(body, /<h1\b/, `${entry.path}: no heading without JavaScript`);
  assert.ok(body.length > 1000, `${entry.path}: empty public content`);
  if (entry.path !== "/") {
    assert.equal(await readFile(path.join("dist", `${entry.path.slice(1)}.html`), "utf8"), html);
  }
  if (entry.path === "/guides") {
    for (const guide of entries.filter(item => item.path.startsWith("/guides/"))) {
      assert.ok(body.includes(`href="${guide.path}"`), `Missing crawlable guide link: ${guide.path}`);
    }
  }
}
assert.equal((sitemap.match(/<loc>/g) || []).length, entries.length);
assert.ok(!sitemap.includes("/auth") && !sitemap.includes("/admin") && !sitemap.includes("/demo"));
assert.ok(!(await readFile("dist/index.html", "utf8")).includes('"aggregateRating"'), "Do not publish an unverified rating");
for (const route of ["auth", "demo", "admin", "404"]) {
  const html = await readFile(`dist/${route}.html`, "utf8");
  assert.ok(html.includes('content="noindex, follow"'), `${route}: must not be indexed`);
}
assert.ok((await readFile("dist/404.html", "utf8")).includes("Страница не найдена"));
console.log(`SEO checks passed: ${entries.length} pages with unique titles, correct canonicals, real HTML and matching sitemap.`);

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getSitemapEntries, getPageMetadata, renderMetadata, renderSitemap, renderPage } from "../dist-ssr/entry-server.js";

const dist = path.resolve("dist");
const template = await readFile(path.join(dist, "index.html"), "utf8");
const headPattern = /<!-- SEO_META_START -->[\s\S]*?<!-- SEO_META_END -->/;
if (!headPattern.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error("Prerender markers are missing from the built HTML template");
}

for (const entry of getSitemapEntries()) {
  const markup = await renderPage(entry.path);
  if (!markup.includes("<h1") || !markup.includes("BeRanked")) {
    throw new Error(`Missing public page content: ${entry.path}`);
  }
  const head = renderMetadata(getPageMetadata(entry.path));
  const html = template
    .replace(headPattern, () => `<!-- SEO_META_START -->\n    ${head}\n    <!-- SEO_META_END -->`)
    .replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`);
  const directory = path.join(dist, entry.path.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), html);
  if (entry.path !== "/") {
    // Check $uri.html before directories to avoid a trailing-slash redirect.
    await writeFile(path.join(dist, `${entry.path.slice(1)}.html`), html);
  }
  console.log(`Prerendered ${entry.path}`);
}

const sitemap = renderSitemap();
await writeFile(path.join(dist, "sitemap.xml"), sitemap);
await writeFile(path.resolve("public/sitemap.xml"), sitemap);
console.log(`Generated sitemap with ${getSitemapEntries().length} canonical URLs`);

// App-only routes remain client-rendered, with their own noindex HTML shell.
for (const route of ["/auth", "/demo", "/admin", "/404"]) {
  const metadata = renderMetadata(getPageMetadata(route));
  const content = route === "/404" ? await renderPage(route) : "";
  const html = template
    .replace(headPattern, () => `<!-- SEO_META_START -->\n    ${metadata}\n    <!-- SEO_META_END -->`)
    .replace('<div id="root"></div>', () => `<div id="root">${content}</div>`);
  await writeFile(path.join(dist, `${route.slice(1)}.html`), html);
  if (route !== "/404") {
    const directory = path.join(dist, route.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), html);
  }
}

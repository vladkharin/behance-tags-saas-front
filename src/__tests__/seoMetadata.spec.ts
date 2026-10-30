import { describe, expect, it } from "vitest";
import { GUIDES_ARTICLES } from "../data/guidesData";
import { NICHE_TAGS_DATA } from "../data/nicheTagsData";
import { getPageMetadata, getSitemapEntries, renderMetadata, renderSitemap, SITE_URL } from "../seo/metadata";

describe("Search metadata", () => {
  it("gives each public page its own canonical, title and description", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const entry of getSitemapEntries()) {
      const page = getPageMetadata(entry.path);
      expect(page.canonical).toBe(`${SITE_URL}${entry.path}`);
      expect(page.robots).toBe("index, follow");
      expect(titles.has(page.title)).toBe(false);
      expect(descriptions.has(page.description)).toBe(false);
      titles.add(page.title); descriptions.add(page.description);
    }
  });

  it("normalizes trailing slashes and excludes filters and fragments from canonicals", () => {
    expect(getPageMetadata("/tags/ui-ux-design/?utm_source=test#tags").canonical).toBe(`${SITE_URL}/tags/ui-ux-design`);
    expect(getPageMetadata("/?utm_source=test").canonical).toBe(`${SITE_URL}/`);
  });

  it("uses actual guide and niche content in both languages", () => {
    const guide = GUIDES_ARTICLES[0]; const niche = NICHE_TAGS_DATA[0];
    expect(getPageMetadata(`/guides/${guide.slug}`).description).toBe(guide.excerpt);
    expect(getPageMetadata(`/guides/${guide.slug}`, "en-US").title).toContain(guide.titleEn);
    expect(getPageMetadata(`/tags/${niche.slug}`, "en").description).toBe(niche.metaDescEn);
  });

  it("keeps authentication, demo, admin and missing pages out of the index", () => {
    for (const path of ["/auth", "/demo", "/admin", "/admin/users", "/tags/missing", "/guides/missing"]) {
      expect(getPageMetadata(path).robots).toBe("noindex, follow");
    }
  });

  it("builds the sitemap from current content rather than obsolete guide slugs", () => {
    const entries = getSitemapEntries(); const paths = entries.map(entry => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.filter(path => path.startsWith("/guides/"))).toEqual(GUIDES_ARTICLES.map(article => `/guides/${article.slug}`));
    expect(paths.filter(path => path.startsWith("/tags/"))).toEqual(NICHE_TAGS_DATA.map(niche => `/tags/${niche.slug}`));
    expect(renderSitemap()).not.toContain("how-behance-search-algorithm-works-2026");
    for (const entry of entries) expect(renderSitemap()).toContain(`<loc>${SITE_URL}${entry.path}</loc>`);
  });

  it("escapes page data before inserting it into static HTML", () => {
    const html = renderMetadata({ ...getPageMetadata("/"), title: '<script>"bad"</script>', description: '" /><img src=x onerror="bad"> & more' });
    expect(html).not.toContain("<script>"); expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;&quot;bad&quot;&lt;/script&gt;");
    expect(html).toContain("&amp; more");
  });
});

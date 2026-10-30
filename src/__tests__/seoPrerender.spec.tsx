// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderPage } from "../entry-server";
import { GUIDES_ARTICLES } from "../data/guidesData";

describe("Public HTML without browser APIs", () => {
  it("renders the actual landing page and omits the unverified review rating", async () => {
    expect(typeof window).toBe("undefined");
    const html = await renderPage("/");
    expect(html).toContain("<h1");
    expect(html).toContain("Выводите свои кейсы в ТОП поиска Behance");
    expect(html).not.toContain("aggregateRating");
  });

  it("renders the guide body and crawlable article links", async () => {
    const article = GUIDES_ARTICLES[0];
    const detail = await renderPage(`/guides/${article.slug}`);
    expect(detail).toContain(article.title);
    expect(detail).toContain('id="intro"');
    const list = await renderPage("/guides");
    for (const guide of GUIDES_ARTICLES) expect(list).toContain(`href="/guides/${guide.slug}"`);
  });

  it("rejects application routes and unknown pages during static generation", async () => {
    await expect(renderPage("/demo")).rejects.toThrow("non-public");
    await expect(renderPage("/admin")).rejects.toThrow("non-public");
    await expect(renderPage("/guides/missing")).rejects.toThrow("non-public");
  });

  it("renders a real not-found page without redirecting to the landing page", async () => {
    const html = await renderPage("/404");
    expect(html).toContain("Страница не найдена");
    expect(html).toContain('href="/tags"');
    expect(html).not.toContain("Выводите свои кейсы");
  });
});

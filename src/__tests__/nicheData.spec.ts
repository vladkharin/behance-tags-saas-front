import { describe, it, expect } from "vitest";
import { NICHE_TAGS_DATA } from "../data/nicheTagsData";
import { GUIDES_ARTICLES } from "../data/guidesData";

describe("Static SEO Data Integrity", () => {
  describe("NICHE_TAGS_DATA", () => {
    it("should have at least 5 curated niche categories", () => {
      expect(NICHE_TAGS_DATA.length).toBeGreaterThanOrEqual(5);
    });

    it("should have unique slugs for all niche categories", () => {
      const slugs = NICHE_TAGS_DATA.map((c) => c.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it("should have valid non-empty fields in every category", () => {
      NICHE_TAGS_DATA.forEach((cat) => {
        expect(cat.slug).toBeTruthy();
        expect(cat.nameRu).toBeTruthy();
        expect(cat.nameEn).toBeTruthy();
        expect(cat.titleRu).toBeTruthy();
        expect(cat.titleEn).toBeTruthy();
        expect(cat.metaDescRu).toBeTruthy();
        expect(cat.metaDescEn).toBeTruthy();
        expect(cat.tags.length).toBeGreaterThan(0);
        expect(cat.combos.length).toBeGreaterThan(0);
        expect(cat.guideRu.algorithmTips.length).toBeGreaterThan(0);
        expect(cat.guideEn.algorithmTips.length).toBeGreaterThan(0);
      });
    });

    it("every tag in each category should have volume, difficulty and description", () => {
      NICHE_TAGS_DATA.forEach((cat) => {
        cat.tags.forEach((tagItem) => {
          expect(tagItem.tag).toBeTruthy();
          expect(["HIGH", "MEDIUM", "GOLD"]).toContain(tagItem.volume);
          expect(["EASY", "MEDIUM", "HARD"]).toContain(tagItem.difficulty);
          expect(tagItem.descriptionRu).toBeTruthy();
          expect(tagItem.descriptionEn).toBeTruthy();
        });
      });
    });
  });

  describe("GUIDES_ARTICLES", () => {
    it("should have at least 5 in-depth guides", () => {
      expect(GUIDES_ARTICLES.length).toBeGreaterThanOrEqual(5);
    });

    it("should have unique slugs across all guides", () => {
      const slugs = GUIDES_ARTICLES.map((g) => g.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it("every guide should contain required titles, summaries and contentHtml", () => {
      GUIDES_ARTICLES.forEach((guide) => {
        expect(guide.slug).toMatch(/^[a-z0-9-]+$/);
        expect(guide.title).toBeTruthy();
        expect(guide.titleEn).toBeTruthy();
        expect(guide.excerpt).toBeTruthy();
        expect(guide.excerptEn).toBeTruthy();
        expect(guide.contentHtml).toBeTruthy();
        expect(guide.contentHtmlEn).toBeTruthy();
        expect(guide.readTime).toBeTruthy();
        expect(guide.readTimeEn).toBeTruthy();
      });
    });
  });
});

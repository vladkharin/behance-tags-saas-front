import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Link, MemoryRouter } from "react-router-dom";
import { PageMetadata } from "../components/PageMetadata";
import { i18n } from "../test/setup";
import { NICHE_TAGS_DATA } from "../data/nicheTagsData";

describe("Metadata during navigation", () => {
  beforeEach(async () => { document.head.innerHTML = ""; await i18n.changeLanguage("ru"); });
  afterEach(() => { cleanup(); document.head.innerHTML = ""; });

  it("updates and restores metadata without accumulating duplicate tags", () => {
    render(<MemoryRouter><PageMetadata /><Link to="/tags/ui-ux-design">Niche</Link><Link to="/auth">Auth</Link><Link to="/">Home</Link></MemoryRouter>);
    fireEvent.click(screen.getByText("Niche"));
    expect(document.title).toContain(NICHE_TAGS_DATA[0].titleRu);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://beranked.domcraft.digital/tags/ui-ux-design");
    fireEvent.click(screen.getByText("Auth"));
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex, follow");
    fireEvent.click(screen.getByText("Home"));
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("index, follow");
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe("https://beranked.domcraft.digital/");
  });

  it("keeps the title and page language in sync when switching languages", async () => {
    render(<MemoryRouter initialEntries={["/tags/ui-ux-design"]}><PageMetadata /></MemoryRouter>);
    await act(async () => { await i18n.changeLanguage("en"); });
    expect(document.title).toContain(NICHE_TAGS_DATA[0].titleEn);
    expect(document.documentElement.lang).toBe("en");
    await act(async () => { await i18n.changeLanguage("ru"); });
    expect(document.title).toContain(NICHE_TAGS_DATA[0].titleRu);
    expect(document.documentElement.lang).toBe("ru");
  });
});

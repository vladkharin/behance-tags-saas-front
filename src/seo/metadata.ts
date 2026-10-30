import { GUIDES_ARTICLES, getLocalizedArticle } from "../data/guidesData";
import { NICHE_TAGS_DATA } from "../data/nicheTagsData";

export const SITE_URL = "https://beranked.domcraft.digital";

export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  language: "ru" | "en";
  robots: "index, follow" | "noindex, follow";
  type: "website" | "article";
}

export interface SitemapEntry {
  path: string;
  lastmod?: string;
}

const STATIC_PAGES: Record<string, { ru: [string, string]; en: [string, string] }> = {
  "/": {
    ru: ["BeRanked — Аналитика и трекинг тегов на Behance", "Проверяйте позиции проектов в поиске Behance, отслеживайте изменения по тегам и находите возможности для развития портфолио. Начните бесплатно."],
    en: ["BeRanked — Behance Tag Analytics & Rank Tracker", "Check your Behance project rankings, track keyword changes and discover opportunities to improve your portfolio. Start for free."],
  },
  "/tags": {
    ru: ["Теги для Behance по нишам: UI/UX, брендинг, 3D — BeRanked", "Каталог тегов для проектов на Behance: интерфейсы, брендинг, 3D, веб-дизайн и упаковка. Копируйте готовые подборки и проверяйте позиции своих кейсов."],
    en: ["Behance Tags by Niche: UI/UX, Branding & 3D — BeRanked", "Explore Behance tags for UI/UX, branding, 3D, web and packaging design. Copy ready-to-use tag collections and track your project rankings."],
  },
  "/guides": {
    ru: ["Гайды по продвижению проектов и тегам Behance — BeRanked", "Руководства для дизайнеров: подбор тегов, проверка позиций и работа над видимостью проектов в поиске Behance."],
    en: ["Behance Tags & Portfolio Promotion Guides — BeRanked", "Guides for designers on choosing Behance tags, checking rankings and improving project visibility in search."],
  },
  "/plans": {
    ru: ["Тарифы BeRanked — мониторинг позиций на Behance", "Сравните бесплатный тариф, Daily Fresh и Pro Stream: проекты, частота проверок, лимиты тегов и история позиций."],
    en: ["BeRanked Pricing — Behance Rank Monitoring Plans", "Compare Free, Daily Fresh and Pro Stream plans: project slots, update frequency, keyword limits and ranking history."],
  },
  "/help": {
    ru: ["Как пользоваться BeRanked — инструкция и помощь", "Как добавить проект Behance, проверить теги, читать отчёты и настроить автоматический мониторинг позиций в BeRanked."],
    en: ["How to Use BeRanked — Help & Getting Started", "Learn how to add a Behance project, check tags, read reports and configure automatic ranking monitoring in BeRanked."],
  },
  "/terms": {
    ru: ["Публичная оферта — BeRanked", "Условия использования BeRanked, оплаты и предоставления доступа к сервису мониторинга позиций проектов Behance."],
    en: ["Terms of Service — BeRanked", "Terms for using BeRanked, purchasing access and receiving Behance project ranking monitoring services."],
  },
  "/privacy": {
    ru: ["Политика конфиденциальности — BeRanked", "Информация об обработке и защите персональных данных пользователей сервиса BeRanked."],
    en: ["Privacy Policy — BeRanked", "Information about the processing and protection of personal data in BeRanked."],
  },
  "/refund": {
    ru: ["Условия возврата — BeRanked", "Порядок обращения и условия возврата оплаты за доступ к сервису BeRanked."],
    en: ["Refund Policy — BeRanked", "Refund terms and the process for requesting a refund for BeRanked service access."],
  },
};

export function normalizePath(path: string): string {
  return path.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
}

export function getPageMetadata(path: string, language = "ru"): PageMetadata {
  const pathname = normalizePath(path);
  const lang = language.startsWith("en") ? "en" : "ru";
  const base: PageMetadata = {
    title: lang === "en" ? "Page not found — BeRanked" : "Страница не найдена — BeRanked",
    description: lang === "en" ? "Behance project ranking analytics by BeRanked." : "Аналитика позиций проектов Behance в BeRanked.",
    canonical: `${SITE_URL}${pathname}`,
    language: lang,
    robots: "noindex, follow",
    type: "website",
  };
  const page = STATIC_PAGES[pathname];
  if (page) {
    const [title, description] = page[lang];
    return { ...base, title, description, robots: "index, follow" };
  }
  const guide = GUIDES_ARTICLES.find(article => pathname === `/guides/${article.slug}`);
  if (guide) {
    const article = getLocalizedArticle(guide, lang);
    return { ...base, title: `${article.title} — BeRanked`, description: article.excerpt, robots: "index, follow", type: "article" };
  }
  const niche = NICHE_TAGS_DATA.find(item => pathname === `/tags/${item.slug}`);
  if (niche) {
    return {
      ...base,
      title: `${lang === "en" ? niche.titleEn : niche.titleRu} — BeRanked`,
      description: lang === "en" ? niche.metaDescEn : niche.metaDescRu,
      robots: "index, follow",
      type: "article",
    };
  }
  const privateTitle = pathname === "/auth"
    ? (lang === "en" ? "Sign in — BeRanked" : "Вход и регистрация — BeRanked")
    : pathname === "/demo"
      ? (lang === "en" ? "Interactive Demo — BeRanked" : "Интерактивное демо — BeRanked")
      : pathname.startsWith("/admin")
        ? (lang === "en" ? "Administration — BeRanked" : "Управление — BeRanked")
        : base.title;
  return { ...base, title: privateTitle };
}

export function getSitemapEntries(): SitemapEntry[] {
  return [
    ...Object.keys(STATIC_PAGES).map(path => ({ path })),
    ...NICHE_TAGS_DATA.map(niche => ({ path: `/tags/${niche.slug}` })),
    ...GUIDES_ARTICLES.map(article => ({ path: `/guides/${article.slug}`, lastmod: article.updatedAt })),
  ];
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function renderMetadata(metadata: PageMetadata): string {
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const canonical = escapeHtml(metadata.canonical);
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${metadata.robots}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="${metadata.type}" />`,
    `<meta property="og:site_name" content="BeRanked" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${SITE_URL}/og-image.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og-image.png" />`,
  ].join("\n    ");
}

export function renderSitemap(): string {
  const urls = getSitemapEntries().map(entry => `  <url>\n    <loc>${SITE_URL}${entry.path}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

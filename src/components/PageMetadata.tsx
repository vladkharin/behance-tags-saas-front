import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPageMetadata, SITE_URL } from "../seo/metadata";

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

// Initial HTML is generated at build time; keep the same metadata after SPA navigation.
export function PageMetadata() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "ru";

  useEffect(() => {
    const metadata = getPageMetadata(pathname, language);
    document.title = metadata.title;
    document.documentElement.lang = metadata.language;
    setMeta("name", "description", metadata.description);
    setMeta("name", "robots", metadata.robots);
    setMeta("property", "og:title", metadata.title);
    setMeta("property", "og:description", metadata.description);
    setMeta("property", "og:url", metadata.canonical);
    setMeta("property", "og:type", metadata.type);
    setMeta("property", "og:image", `${SITE_URL}/og-image.png`);
    setMeta("name", "twitter:title", metadata.title);
    setMeta("name", "twitter:description", metadata.description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = metadata.canonical;
  }, [pathname, language]);

  return null;
}

import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { MainApp } from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ru from "./locales/ru.json";
import en from "./locales/en.json";
import { getSitemapEntries } from "./seo/metadata";

export { getSitemapEntries, getPageMetadata, renderMetadata, renderSitemap } from "./seo/metadata";

export async function renderPage(path: string): Promise<string> {
  if (path !== "/404" && !getSitemapEntries().some(entry => entry.path === path)) {
    throw new Error(`Refusing to prerender a non-public route: ${path}`);
  }
  // Never use browser storage, a user's session, or a live API during prerendering.
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({
    lng: "ru", fallbackLng: "ru", returnObjects: true,
    resources: { ru: { translation: ru }, en: { translation: en } },
    interpolation: { escapeValue: false },
  });
  return renderToString(
    <I18nextProvider i18n={i18n}>
      <StaticRouter location={path}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider><MainApp /></ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </StaticRouter>
    </I18nextProvider>,
  );
}

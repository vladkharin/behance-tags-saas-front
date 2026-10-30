import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { i18n } = useTranslation();
  const isEn = (i18n.resolvedLanguage || i18n.language).startsWith("en");
  return (
    <main className="min-h-screen bg-behance-grayBg dark:bg-behance-darkBg text-zinc-900 dark:text-white flex flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="text-behance-blue font-black text-6xl">404</span>
      <h1 className="text-3xl font-black">{isEn ? "Page not found" : "Страница не найдена"}</h1>
      <p className="max-w-md opacity-70">{isEn ? "This address does not exist. Explore Behance tags or return to BeRanked." : "Такого адреса нет. Перейдите в каталог тегов или вернитесь на главную BeRanked."}</p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link className="px-6 py-3 rounded-xl bg-behance-blue text-white font-bold" to="/">{isEn ? "Home" : "На главную"}</Link>
        <Link className="px-6 py-3 rounded-xl border border-current font-bold" to="/tags">{isEn ? "Tags catalog" : "Каталог тегов"}</Link>
      </div>
    </main>
  );
}

export interface NicheTag {
  tag: string;
  volume: "HIGH" | "MEDIUM" | "GOLD";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  descriptionRu: string;
  descriptionEn: string;
}

export interface PresetCombo {
  nameRu: string;
  nameEn: string;
  badgeRu: string;
  badgeEn: string;
  tags: string[];
}

export interface NicheCategory {
  slug: string;
  icon: string;
  nameRu: string;
  nameEn: string;
  titleRu: string;
  titleEn: string;
  metaDescRu: string;
  metaDescEn: string;
  tagsCount: number;
  featuredTags: string[];
  tags: NicheTag[];
  combos: PresetCombo[];
  guideRu: {
    overview: string;
    algorithmTips: string[];
    mistakesToAvoid: string[];
  };
  guideEn: {
    overview: string;
    algorithmTips: string[];
    mistakesToAvoid: string[];
  };
}

export const NICHE_TAGS_DATA: NicheCategory[] = [
  {
    slug: "ui-ux-design",
    icon: "📱",
    nameRu: "UI/UX и Мобильные приложения",
    nameEn: "UI/UX & Mobile Apps",
    titleRu: "ТОП теги для Behance: UI/UX дизайн, интерфейсы и мобильные приложения (2026)",
    titleEn: "Best Behance Tags for UI/UX & Mobile App Design (2026 Strategy)",
    metaDescRu: "Полный список проверенных тегов для продвижения UI/UX кейсов на Behance. Готовые наборы из 10 тегов в 1 клик, анализ поискового объема и советы по выходу в ТОП-10.",
    metaDescEn: "Curated collection of high-ranking Behance tags for UI/UX designers and mobile apps. Ready-to-copy 10-tag packs, search difficulty analysis, and ranking tips.",
    tagsCount: 16,
    featuredTags: ["uiux", "app design", "mobile app", "figma", "dashboard"],
    tags: [
      { tag: "ui ux design", volume: "HIGH", difficulty: "HARD", descriptionRu: "Главный высокочастотный тег ниши интерфейсов", descriptionEn: "Primary high-volume keyword for digital product interfaces" },
      { tag: "mobile app design", volume: "HIGH", difficulty: "HARD", descriptionRu: "Основной запрос для мобильных приложений iOS и Android", descriptionEn: "Core search term for iOS and Android app showcase projects" },
      { tag: "fintech app", volume: "GOLD", difficulty: "MEDIUM", descriptionRu: "Коммерческий тег с платежеспособными заказчиками", descriptionEn: "High-ticket commercial search term for banking and crypto clients" },
      { tag: "saas dashboard", volume: "GOLD", difficulty: "MEDIUM", descriptionRu: "Идеально для сложных веб-сервисов и CRM систем", descriptionEn: "Top ranking tag for complex web software and CRM systems" },
      { tag: "figma design", volume: "HIGH", difficulty: "MEDIUM", descriptionRu: "Стандарт индустрии для поиска исходников и дизайн-систем", descriptionEn: "Industry standard tag searched by product leads and recruiters" },
      { tag: "design system", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Привлекает крупные продуктовые компании и дизайн-директоров", descriptionEn: "Targeted keyword attracting enterprise design leaders" },
      { tag: "clean ui", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Низкая конкуренция, быстрый выход в ТОП-5 выдачи", descriptionEn: "Low competition tag with fast track to TOP-5 search results" },
      { tag: "ios design", volume: "HIGH", difficulty: "MEDIUM", descriptionRu: "Фокус на гайдлайны Apple и Human Interface Guidelines", descriptionEn: "Tailored for projects emphasizing Apple HIG guidelines" },
      { tag: "crypto wallet", volume: "GOLD", difficulty: "EASY", descriptionRu: "Очень высокая конверсия в заказы Web3 и стартапов", descriptionEn: "High-converting niche tag for Web3 and venture-backed startups" },
      { tag: "ecommerce app", volume: "GOLD", difficulty: "MEDIUM", descriptionRu: "Запрос интернет-магазинов и ритейл-брендов", descriptionEn: "Commercial term searched by ecommerce and retail founders" },
      { tag: "dark mode ui", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Трендовый эстетический тег для темных интерфейсов", descriptionEn: "Aesthetic trend tag attracting heavy curator saves" },
      { tag: "minimalist design", volume: "HIGH", difficulty: "HARD", descriptionRu: "Популярный тег для ценителей чистой визуальной эстетики", descriptionEn: "Broad aesthetic tag driving high appreciation volume" }
    ],
    combos: [
      {
        nameRu: "🔥 Максимальный охват (ТОП-10 Поиска)",
        nameEn: "🔥 Maximum Search Reach (TOP-10)",
        badgeRu: "Рекомендуемый",
        badgeEn: "Recommended",
        tags: ["ui ux design", "mobile app design", "figma design", "saas dashboard", "clean ui", "ios design", "design system", "fintech app", "dark mode ui", "minimalist design"]
      },
      {
        nameRu: "💼 Привлечение клиентов (Fintech / SaaS)",
        nameEn: "💼 Inbound Clients (Fintech & SaaS)",
        badgeRu: "Коммерческий",
        badgeEn: "Commercial",
        tags: ["saas dashboard", "fintech app", "crypto wallet", "ecommerce app", "mobile app design", "design system", "figma design", "web app design", "clean ui", "ui ux design"]
      },
      {
        nameRu: "⚡ Быстрый старт (Низкая конкуренция)",
        nameEn: "⚡ Fast Track (Low Competition)",
        badgeRu: "Быстрый ТОП",
        badgeEn: "Fast Ranking",
        tags: ["clean ui", "dark mode ui", "design system", "crypto wallet", "ios design", "fintech app", "figma design", "ui ux design", "saas dashboard", "mobile app design"]
      }
    ],
    guideRu: {
      overview: "UI/UX — самая конкурентная категория на Behance. Чтобы пробиться в ТОП-10, необходимо сочетать 2-3 высокочастотных тега (#ui ux design) с 4-5 узкими коммерческими терминами (#fintech app, #saas dashboard).",
      algorithmTips: [
        "Не ставьте одинаковые теги подряд: чередуйте общие (app design) и нишевые (crypto wallet).",
        "Включайте название инструментов: #figma design стабильно входит в тройку самых ищущих тегов.",
        "Используйте BeRanked, чтобы заменить теги, которые не вышли в ТОП-100 за первые 72 часа."
      ],
      mistakesToAvoid: [
        "Использование запрещенных стоп-слов или бессмысленных хэштегов вроде #beautiful, #best, #cool.",
        "Заполнение только 3-4 тегов вместо разрешенных 10 (вы теряете 60% поискового охвата)."
      ]
    },
    guideEn: {
      overview: "UI/UX is the most competitive category on Behance. Climbing into the TOP-10 requires balancing 2-3 broad high-volume keywords with 4-5 high-intent commercial tags.",
      algorithmTips: [
        "Balance broad terms with niche keywords (e.g. mix #mobile app with #fintech app).",
        "Always include tool-specific keywords like #figma design to attract design leads.",
        "Use BeRanked to monitor and replace tags that fail to reach the top 100 within 72 hours."
      ],
      mistakesToAvoid: [
        "Using generic emotional tags like #cool, #art, #creative.",
        "Listing only 3-4 tags instead of using all 10 available slots."
      ]
    }
  },
  {
    slug: "branding-identity",
    icon: "🏷️",
    nameRu: "Брендинг, Айдентика и Логотипы",
    nameEn: "Branding & Visual Identity",
    titleRu: "ТОП теги для Behance: Брендинг, фирменный стиль и логотипы (2026)",
    titleEn: "Best Behance Tags for Branding, Logos & Visual Identity (2026)",
    metaDescRu: "Лучшие проверенные теги для кейсов по брендингу и фирменному стилю на Behance. Наборы тегов в 1 клик, рекомендации по кураторским лентам и выходу в ТОП поиска.",
    metaDescEn: "Curated tags for branding, brand identity, and logo design projects on Behance. 1-click export packs, curator tips, and search ranking strategies.",
    tagsCount: 15,
    featuredTags: ["branding", "visual identity", "logo design", "brand identity", "packaging"],
    tags: [
      { tag: "branding identity", volume: "HIGH", difficulty: "HARD", descriptionRu: "Главный поисковый тег категории айдентики", descriptionEn: "Primary search keyword for comprehensive identity cases" },
      { tag: "visual identity", volume: "HIGH", difficulty: "HARD", descriptionRu: "Официальный термин, используемый кураторами Behance", descriptionEn: "Official terminology curated by Behance design editors" },
      { tag: "logo design", volume: "HIGH", difficulty: "HARD", descriptionRu: "Высокий спрос среди прямых заказчиков малого бизнеса", descriptionEn: "High search volume from direct business founders" },
      { tag: "brand strategy", volume: "GOLD", difficulty: "MEDIUM", descriptionRu: "Привлекает крупные брендинговые агентства и корпорации", descriptionEn: "Attracts agency partners and enterprise client accounts" },
      { tag: "minimal logo", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Высокая конверсия в лайки и быстрый выход в ТОП", descriptionEn: "Fast ranking keyword with strong appreciation rate" },
      { tag: "typography design", volume: "HIGH", difficulty: "MEDIUM", descriptionRu: "Ключевой фактор для получения кураторской ленточки Typography", descriptionEn: "Essential for winning the Behance Curated Typography ribbon" },
      { tag: "brand guidelines", volume: "GOLD", difficulty: "EASY", descriptionRu: "Показывает глубину проработки гайдлайнов бренда", descriptionEn: "Highlights comprehensive brand book and manual depth" },
      { tag: "modern branding", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Отличный поисковый объем при умеренной конкуренции", descriptionEn: "Balanced competition with steady organic discovery" },
      { tag: "stationery design", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Идеально для кейсов с полиграфией и мерчем", descriptionEn: "Perfect for cases featuring print collaterals and merchandise" },
      { tag: "packaging branding", volume: "GOLD", difficulty: "MEDIUM", descriptionRu: "Коммерческий тег для брендов FMCG и косметики", descriptionEn: "Commercial keyword for consumer goods and cosmetic brands" }
    ],
    combos: [
      {
        nameRu: "🔥 ТОП-10 для кураторской ленточки Branding",
        nameEn: "🔥 Curated Ribbon & Maximum Reach",
        badgeRu: "Кураторский",
        badgeEn: "Curator Pick",
        tags: ["branding identity", "visual identity", "logo design", "brand strategy", "brand guidelines", "typography design", "modern branding", "stationery design", "packaging branding", "minimal logo"]
      },
      {
        nameRu: "💼 Корпоративный брендинг (Крупные клиенты)",
        nameEn: "💼 Enterprise Brand Identity",
        badgeRu: "B2B",
        badgeEn: "B2B",
        tags: ["brand strategy", "brand guidelines", "visual identity", "branding identity", "corporate identity", "typography design", "logo design", "modern branding", "stationery design", "brand identity"]
      }
    ],
    guideRu: {
      overview: "В нише брендинга кураторы Behance обращают внимание на комплексность кейса: наличие логотипа, типографики, гайдлайнов и физических носителей.",
      algorithmTips: [
        "Обязательно добавьте тег #typography design, если в кейсе есть авторский шрифт или выразительная верстка.",
        "Теги #brand strategy и #brand guidelines привлекают самых платежеспособных B2B-клиентов."
      ],
      mistakesToAvoid: [
        "Не спамьте тегами одной формы: не ставьте вместе #logo, #logos, #logotype — выберите один сильный тег #logo design."
      ]
    },
    guideEn: {
      overview: "In branding, Behance algorithms reward holistic projects demonstrating logo craft, typography systems, and real-world mockups.",
      algorithmTips: [
        "Always include #typography design if your case features custom lettering or editorial layout.",
        "Keywords like #brand strategy attract high-paying enterprise clients."
      ],
      mistakesToAvoid: [
        "Avoid duplicating word roots like #logo, #logos, #logotype in the same project."
      ]
    }
  },
  {
    slug: "3d-motion-graphics",
    icon: "🧊",
    nameRu: "3D графика, Моушн и CGI",
    nameEn: "3D Art, Motion & CGI",
    titleRu: "ТОП теги для Behance: 3D рендеры, Моушн-дизайн, Cinema 4D и Blender (2026)",
    titleEn: "Best Behance Tags for 3D Art, Motion Graphics & CGI (2026)",
    metaDescRu: "Список эффективных тегов для 3D художников и моушн-дизайнеров на Behance. Готовые подборки для Blender, Cinema 4D, Unreal Engine и Octane Render.",
    metaDescEn: "Proven tags for 3D artists, motion designers, and CGI studios on Behance. Ready-to-copy tags for Blender, Cinema 4D, Unreal Engine, and Octane.",
    tagsCount: 14,
    featuredTags: ["3d design", "motion graphics", "blender 3d", "cinema 4d", "octane render"],
    tags: [
      { tag: "3d art design", volume: "HIGH", difficulty: "HARD", descriptionRu: "Основной запрос всей 3D-индустрии на платформе", descriptionEn: "Primary discovery keyword across all 3D art categories" },
      { tag: "motion graphics", volume: "HIGH", difficulty: "HARD", descriptionRu: "Ключевой тег для анимационных роликов и шоурилов", descriptionEn: "Core tag for animated videos, showreels, and kinetic typography" },
      { tag: "blender 3d", volume: "HIGH", difficulty: "MEDIUM", descriptionRu: "Огромное комьюнити и частый поиск по софту", descriptionEn: "Huge active community and frequent software-based searches" },
      { tag: "cinema 4d", volume: "HIGH", difficulty: "MEDIUM", descriptionRu: "Стандарт в коммерческом моушн-дизайне для рекламы", descriptionEn: "Commercial advertising standard for broadcast motion" },
      { tag: "octane render", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Тег высокого визуального качества рендера", descriptionEn: "Quality indicator tag with strong engagement from creative directors" },
      { tag: "abstract 3d", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Популярно для заставок, обоев и футуристичных форм", descriptionEn: "High-volume aesthetic tag for futuristic shapes and backgrounds" },
      { tag: "product render 3d", volume: "GOLD", difficulty: "EASY", descriptionRu: "Коммерческий тег для рендеров техники, обуви и косметики", descriptionEn: "High-paying commercial tag for tech, sneaker, and luxury CGI" },
      { tag: "unreal engine 5", volume: "GOLD", difficulty: "EASY", descriptionRu: "Трендовый тег для реалтайм-графики и метаверса", descriptionEn: "Fastest-growing trend tag for real-time visualization" },
      { tag: "3d animation", volume: "HIGH", difficulty: "MEDIUM", descriptionRu: "Обязателен для кейсов с видео и циклическими GIF", descriptionEn: "Essential for projects featuring video embeds and looped animations" }
    ],
    combos: [
      {
        nameRu: "🔥 Максимальный охват (3D + Motion)",
        nameEn: "🔥 3D & Motion Showreel Reach",
        badgeRu: "Универсальный",
        badgeEn: "All-Rounder",
        tags: ["3d art design", "motion graphics", "blender 3d", "cinema 4d", "octane render", "3d animation", "abstract 3d", "product render 3d", "unreal engine 5", "cgi illustration"]
      },
      {
        nameRu: "💼 Коммерческий Product CGI (Рендеры продуктов)",
        nameEn: "💼 Commercial Product CGI",
        badgeRu: "Коммерческий",
        badgeEn: "Commercial",
        tags: ["product render 3d", "3d art design", "octane render", "cinema 4d", "blender 3d", "commercial 3d", "motion graphics", "unreal engine 5", "3d animation", "clean 3d"]
      }
    ],
    guideRu: {
      overview: "В 3D-графике теги софта (#blender 3d, #cinema 4d, #octane render) работают эффективнее общих фраз, потому что арт-директора часто ищут специалистов под конкретный стек.",
      algorithmTips: [
        "Обязательно вставляйте видео или цикличные MP4 прямо в начало кейса для удержания внимания.",
        "Указывайте рендер-движок: #octane render или #redshift привлекают профессиональные студии."
      ],
      mistakesToAvoid: [
        "Не забывайте указывать коммерческое назначение: #product render 3d привлекает реальных клиентов лучше абстрактных тегов."
      ]
    },
    guideEn: {
      overview: "In 3D art, software-specific keywords (#blender 3d, #cinema 4d, #octane render) often outperform generic tags because agencies search by specific toolsets.",
      algorithmTips: [
        "Embed video clips or looped MP4s near the top of your case to maximize dwell time.",
        "Always tag your render engine (#octane render, #redshift) to attract high-end studios."
      ],
      mistakesToAvoid: [
        "Focusing solely on abstract art without commercial tags like #product render 3d."
      ]
    }
  },
  {
    slug: "web-design-landing",
    icon: "🌐",
    nameRu: "Веб-дизайн, Лендинги и Сайты",
    nameEn: "Web Design & Landing Pages",
    titleRu: "ТОП теги для Behance: Веб-дизайн, разработка сайтов и лендинги (2026)",
    titleEn: "Best Behance Tags for Web Design & Landing Pages (2026)",
    metaDescRu: "Подборка самых эффективных поисковых тегов для веб-дизайнеров на Behance. Готовые наборы тегов для лендингов, интернет-магазинов и корпоративных сайтов.",
    metaDescEn: "Best ranking Behance tags for web designers, landing pages, and responsive website cases. Quick-copy tag combos and SEO ranking guide.",
    tagsCount: 14,
    featuredTags: ["web design", "website design", "landing page", "figma", "responsive"],
    tags: [
      { tag: "web design", volume: "HIGH", difficulty: "HARD", descriptionRu: "Один из самых популярных поисковых запросов Behance", descriptionEn: "One of the most searched keywords across the entire network" },
      { tag: "website design", volume: "HIGH", difficulty: "HARD", descriptionRu: "Прямой коммерческий интент от владельцев бизнеса", descriptionEn: "Direct commercial intent term used by business owners" },
      { tag: "landing page design", volume: "GOLD", difficulty: "MEDIUM", descriptionRu: "Высокая конверсия в заказы одностраничников и промо-сайтов", descriptionEn: "High-converting search term for promo and lead-gen sites" },
      { tag: "responsive website", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Подчеркивает адаптивность под мобильные устройства", descriptionEn: "Emphasizes responsive mobile layout and cross-platform craft" },
      { tag: "clean web design", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Быстрый выход в ТОП-10 благодаря низкой конкуренции", descriptionEn: "Fast ranking keyword with modest competition" },
      { tag: "saas website", volume: "GOLD", difficulty: "EASY", descriptionRu: "Трендовый тег для IT-стартапов и технологических компаний", descriptionEn: "Trending keyword for tech startups and enterprise software" },
      { tag: "ecommerce website", volume: "GOLD", difficulty: "MEDIUM", descriptionRu: "Привлекает интернет-магазины с большими бюджетами", descriptionEn: "Attracts high-budget retail and ecommerce founders" },
      { tag: "minimalist web", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Эстетичный тег для ценителей воздуха и швейцарской сетки", descriptionEn: "Aesthetic tag for modern grid layouts and spacious design" }
    ],
    combos: [
      {
        nameRu: "🔥 Максимальный охват (Веб-дизайн)",
        nameEn: "🔥 Complete Web Design Reach",
        badgeRu: "ТОП выдачи",
        badgeEn: "TOP Ranking",
        tags: ["web design", "website design", "landing page design", "figma design", "responsive website", "saas website", "clean web design", "ecommerce website", "minimalist web", "ui ux web"]
      }
    ],
    guideRu: {
      overview: "Веб-дизайн на Behance оценивается по сочетанию эстетики первого экрана, мобильной адаптивности и читаемости контента.",
      algorithmTips: [
        "Используйте тег #landing page design: он конвертирует в 3 раза лучше общего тега #web design.",
        "Показывайте мобильную версию сайта рядом с десктопом — это увеличивает шанс кураторской ленты Interaction."
      ],
      mistakesToAvoid: [
        "Не выкладывайте кейс без демонстрации мобильной адаптивной версии."
      ]
    },
    guideEn: {
      overview: "Web design cases on Behance rank based on hero screen impact, mobile responsiveness, and layout hierarchy.",
      algorithmTips: [
        "Use #landing page design: it yields 3x higher direct client inquiries than broad terms.",
        "Always showcase mobile responsive view alongside desktop layouts."
      ],
      mistakesToAvoid: [
        "Uploading desktop-only screenshots without mobile device mockups."
      ]
    }
  },
  {
    slug: "packaging-label",
    icon: "📦",
    nameRu: "Упаковка, Этикетки и Продуктовый дизайн",
    nameEn: "Packaging & Label Design",
    titleRu: "ТОП теги для Behance: Дизайн упаковки, этикетки и FMCG брендинг (2026)",
    titleEn: "Best Behance Tags for Packaging & Label Design (2026)",
    metaDescRu: "Проверенные теги для кейсов по дизайну упаковки и этикеток на Behance. Как получить кураторскую ленту Package Design и привлечь реальных производителей.",
    metaDescEn: "Proven search tags for packaging and label design projects on Behance. How to earn the Package Design curated ribbon and attract manufacturers.",
    tagsCount: 12,
    featuredTags: ["packaging design", "label design", "box design", "branding", "print"],
    tags: [
      { tag: "packaging design", volume: "HIGH", difficulty: "HARD", descriptionRu: "Главный тег для всех видов коробок, банок и бутылок", descriptionEn: "Primary tag for all boxes, bottles, cans, and cartons" },
      { tag: "label design", volume: "GOLD", difficulty: "MEDIUM", descriptionRu: "Высокий спрос со стороны косметических и пищевых брендов", descriptionEn: "High demand from beverage, wine, and cosmetic brands" },
      { tag: "box design", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Быстро выводит проект на 1-ю страницу выдачи", descriptionEn: "Fast track keyword to page 1 of Behance search" },
      { tag: "sustainable packaging", volume: "GOLD", difficulty: "EASY", descriptionRu: "Трендовый экологичный тег, обожаемый кураторами", descriptionEn: "Eco-friendly trend keyword favored by Behance curators" },
      { tag: "cosmetics packaging", volume: "GOLD", difficulty: "MEDIUM", descriptionRu: "Платежеспособная ниша бьюти-индустрии", descriptionEn: "High-ticket beauty and skincare niche term" },
      { tag: "coffee packaging", volume: "MEDIUM", difficulty: "EASY", descriptionRu: "Очень популярный запрос среди крафтовых брендов", descriptionEn: "Highly popular discovery tag for specialty coffee brands" }
    ],
    combos: [
      {
        nameRu: "🔥 ТОП-10 Упаковка и этикетка",
        nameEn: "🔥 Package Design Mastery",
        badgeRu: "Рекомендуемый",
        badgeEn: "Recommended",
        tags: ["packaging design", "label design", "box design", "sustainable packaging", "cosmetics packaging", "branding identity", "visual identity", "coffee packaging", "print design", "product packaging"]
      }
    ],
    guideRu: {
      overview: "Кураторы категории Package Design обожают тактильные рендеры, развертки упаковки и фото готового продукта в реальной среде.",
      algorithmTips: [
        "Обязательно покажите развертку упаковки с линиями сгиба (dieline) — это признак профессиональной работы.",
        "Теги #sustainable packaging и #cosmetics packaging приносят заказы с чеком от $2,000+."
      ],
      mistakesToAvoid: [
        "Не ограничивайтесь только 3D-рендером, покажите типографику и детали этикетки в макро-масштабе."
      ]
    },
    guideEn: {
      overview: "Package Design curators reward tactile renders, flat dielines, and real-life product context photography.",
      algorithmTips: [
        "Always include packaging flat dielines to prove print production readiness.",
        "Keywords like #sustainable packaging drive premium client inquiries."
      ],
      mistakesToAvoid: [
        "Uploading only distant isometric renders without close-up texture details."
      ]
    }
  }
];

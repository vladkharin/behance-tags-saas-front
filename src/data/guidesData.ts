export interface GuideArticle {
  slug: string;
  category: "tags" | "promotion" | "algorithms" | "mistakes" | "sales";
  readTime: string;
  readTimeEn: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    nameEn: string;
    role: string;
    roleEn: string;
    avatar: string;
  };
  keywords: string[];
  keywordsEn: string[];

  // RU
  title: string;
  subtitle: string;
  excerpt: string;
  categoryLabel: string;
  tableOfContents: { id: string; title: string }[];
  contentHtml: string;

  // EN
  titleEn: string;
  subtitleEn: string;
  excerptEn: string;
  categoryLabelEn: string;
  tableOfContentsEn: { id: string; title: string }[];
  contentHtmlEn: string;
}

export const GUIDES_ARTICLES: GuideArticle[] = [
  {
    slug: "kak-pravilno-podbirat-tegi-na-behance",
    category: "tags",
    readTime: "7 мин",
    readTimeEn: "7 min",
    publishedAt: "2026-08-20",
    updatedAt: "2026-08-30",
    author: {
      name: "Влад Харин",
      nameEn: "Vlad Kharin",
      role: "Founder BeRanked & Lead Product Designer",
      roleEn: "Founder BeRanked & Lead Product Designer",
      avatar: "👨‍💻",
    },
    keywords: [
      "теги для behance",
      "как подобрать теги на беханс",
      "генератор тегов behance",
      "лучшие теги для behance",
      "behance tags",
      "поиск behance",
    ],
    keywordsEn: [
      "behance tags",
      "best tags for behance",
      "behance tag generator",
      "behance seo",
      "how to choose behance tags",
      "behance search optimization",
    ],
    // RU
    title: "Как правильно подбирать теги для Behance в 2026 году: личный опыт и стратегия ТОП-10",
    subtitle: "Практическое руководство без воды: почему 90% дизайнеров ставят бесполезные теги и как занять первые строчки в поиске",
    excerpt: "Разбираем реальную механику поисковой выдачи Behance. Как сбалансировать высокочастотные и нишевые теги, почему нельзя писать теги слитно и как находить неочевидные ключевые слова.",
    categoryLabel: "Теги и ключевые слова",
    tableOfContents: [
      { id: "intro", title: "Почему теги на Behance важнее, чем кажется" },
      { id: "rule-of-10", title: "Лимит в 10 тегов: цена каждой ошибки" },
      { id: "strategy-pyramid", title: "Стратегия пирамиды: 3 уровня тегов" },
      { id: "format-rules", title: "Форматирование: пробелы, дефисы и регистр" },
      { id: "checklist", title: "Пошаговый чек-лист подбора тегов перед публикацией" },
    ],
    contentHtml: `
      <h2 id="intro">Почему теги на Behance важнее, чем кажется</h2>
      <p>Большинство начинающих и даже опытных дизайнеров тратят 40 часов на полировку шотов, анимаций и 3D-рендеров, а блок с тегами в настройках проекта заполняют за 15 секунд на коленке: пишут <em>design</em>, <em>ui</em>, <em>figma</em> и нажимают Publish.</p>
      <p>Через неделю дизайнер удивляется: <strong>«Кейс получился сильный, а просмотров всего 43 штуки. Почему?»</strong></p>
      <p>Ответ прост: Behance — это не просто социальная сеть, это огромная поисковая система. Арт-директора, фаундеры стартапов и рекрутеры из США и Европы не листают бесконечную общую ленту. Они заходят в поиск и вбивают конкретный запрос: <code>crypto mobile app</code>, <code>saas dashboard</code>, <code>fintech landing page</code>.</p>
      <p>Если в вашем проекте нет точных тегов, ваш кейс физически не существует для клиентов, которые ищут исполнителя прямо сейчас.</p>

      <h2 id="rule-of-10">Лимит в 10 тегов: цена каждой ошибки</h2>
      <p>В настройках проекта Behance разрешает указать <strong>ровно 10 пользовательских тегов</strong> (Custom Tags). Это жесткое ограничение, в котором каждый слот на вес золота.</p>
      <p>Если вы потратите 4 слота на бессмысленные теги вроде <code>behance</code>, <code>best</code>, <code>cool</code> или <code>portfolio</code>, вы лишите себя 40% потенциального органического трафика.</p>

      <h2 id="strategy-pyramid">Стратегия пирамиды: формула идеальных 10 тегов</h2>
      <p>Рабочая стратегия, которая стабильно выводит кейсы в ТОП-10 выдачи, строится по принципу <strong>3-уровневой пирамиды</strong>:</p>
      
      <div class="my-6 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <h4 class="font-bold text-behance-blue uppercase text-xs mb-2">Формула распределения 10 тегов:</h4>
        <ul class="space-y-2 text-xs">
          <li><strong>1. Широкие категорийные (2 тега):</strong> базовая специализация. Например: <code>ui ux</code>, <code>mobile app</code>. По ним высокая конкуренция, но они задают категорию.</li>
          <li><strong>2. Нишевые отраслевые (5 тегов):</strong> конкретная ниша вашего кейса. Например: <code>crypto wallet</code>, <code>fintech dashboard</code>, <code>trading app</code>, <code>web3 interface</code>, <code>dark ui</code>. Именно по ним приходят платящие клиенты!</li>
          <li><strong>3. Инструментальные и стилистические (3 тега):</strong> инструменты и эстетика. Например: <code>figma</code>, <code>3d render</code>, <code>minimalism</code>.</li>
        </ul>
      </div>

      <h2 id="format-rules">Форматирование: как Behance считывает слова</h2>
      <p>Алгоритм поиска Behance имеет свои неочевидные правила:</p>
      <ul>
        <li><strong>Пробелы вместо слитного написания:</strong> пишите <code>mobile app</code>, а не <code>mobileapp</code>. Поисковик отлично понимает пробелы внутри одного тега.</li>
        <li><strong>Без решеток в поле тегов:</strong> знак <code>#</code> писать не нужно, Behance добавляет его автоматически.</li>
        <li><strong>Только английский язык:</strong> даже если вы работаете в локальном сегменте, 99% заказчиков и поисковых ботов ищут на английском. Пишите <code>branding</code>, а не <code>брендинг</code>.</li>
      </ul>

      <h2 id="checklist">Пошаговый чек-лист подбора тегов</h2>
      <ol>
        <li>Выпишите отрасль бизнеса вашего клиента (e-commerce, real estate, fintech, ai tool).</li>
        <li>Определите тип продукта (landing page, mobile app, dashboard, brand identity).</li>
        <li>Зайдите в поиск Behance и начните вводить ваши слова — посмотрите автокомплит.</li>
        <li>Соберите ровно 10 сильных релевантных фраз.</li>
        <li>Отслеживайте позиции через BeRanked, чтобы вовремя заменять слабые теги.</li>
      </ol>
    `,

    // EN
    titleEn: "How to Choose the Right Behance Tags in 2026: TOP-10 Strategy & Guide",
    subtitleEn: "Practical guide without fluff: why 90% of designers pick useless tags and how to claim TOP-10 search rankings",
    excerptEn: "Deep dive into Behance search ranking mechanics. How to balance broad and niche tags, avoid syntax mistakes, and discover high-intent keywords that bring paying clients.",
    categoryLabelEn: "Tags & Keywords",
    tableOfContentsEn: [
      { id: "intro", title: "Why Behance Tags Matter More Than You Think" },
      { id: "rule-of-10", title: "The 10-Tag Limit: Cost of Each Mistake" },
      { id: "strategy-pyramid", title: "The Tag Pyramid Strategy: 3 Key Levels" },
      { id: "format-rules", title: "Formatting: Spaces, Hyphens and Case" },
      { id: "checklist", title: "Step-by-Step Tag Selection Checklist" },
    ],
    contentHtmlEn: `
      <h2 id="intro">Why Behance Tags Matter More Than You Think</h2>
      <p>Most designers spend 40+ hours polishing mockups, animations, and 3D renders, but fill in the project tags in 15 seconds: typing <em>design</em>, <em>ui</em>, <em>figma</em> and hitting Publish.</p>
      <p>A week later, they wonder: <strong>"The case is top notch, so why did it only get 43 views?"</strong></p>
      <p>Because Behance is not just a showcase feed; it's a massive search engine. Art directors, startup founders, and design recruiters search for exact keywords: <code>crypto mobile app</code>, <code>saas dashboard</code>, <code>fintech landing page</code>.</p>
      <p>If your project doesn't have targeted tags, it simply does not exist for clients searching right now.</p>

      <h2 id="rule-of-10">The 10-Tag Limit: Cost of Each Mistake</h2>
      <p>Behance strictly limits each project to <strong>10 custom tags</strong>. Wasting 4 slots on generic words like <code>behance</code>, <code>best</code>, <code>cool</code>, or <code>portfolio</code> costs you 40% of potential organic search traffic.</p>

      <h2 id="strategy-pyramid">The Tag Pyramid Strategy: Formula for 10 Tags</h2>
      <p>A proven strategy that consistently ranks projects in the TOP-10 uses a <strong>3-tier pyramid structure</strong>:</p>
      
      <div class="my-6 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <h4 class="font-bold text-behance-blue uppercase text-xs mb-2">The 10-Tag Distribution Formula:</h4>
        <ul class="space-y-2 text-xs">
          <li><strong>1. Broad Category (2 tags):</strong> core discipline, e.g. <code>ui ux</code>, <code>mobile app</code>. High competition, but establishes your category.</li>
          <li><strong>2. Niche & Industry (5 tags):</strong> exact commercial niche, e.g. <code>crypto wallet</code>, <code>fintech dashboard</code>, <code>trading app</code>, <code>web3 interface</code>, <code>dark ui</code>. This is where high-ticket clients come from!</li>
          <li><strong>3. Tools & Style (3 tags):</strong> software and visual style, e.g. <code>figma</code>, <code>3d render</code>, <code>minimalism</code>.</li>
        </ul>
      </div>

      <h2 id="format-rules">Formatting: How Behance Reads Keywords</h2>
      <ul>
        <li><strong>Use spaces:</strong> Write <code>mobile app</code>, not <code>mobileapp</code>. The Behance engine handles multi-word tags perfectly.</li>
        <li><strong>No hashtag symbols:</strong> Do not prefix with <code>#</code>. Behance adds it automatically.</li>
        <li><strong>English only:</strong> 99% of global clients search in English. Use <code>branding</code>, not regional transliterations.</li>
      </ul>

      <h2 id="checklist">Step-by-Step Tag Checklist Before Publishing</h2>
      <ol>
        <li>Identify your client's industry (e-commerce, real estate, fintech, ai tool).</li>
        <li>Define the exact deliverable (landing page, mobile app, dashboard, brand identity).</li>
        <li>Check Behance search autocomplete for trending variations.</li>
        <li>Select 10 tightly focused phrases using the pyramid formula.</li>
        <li>Track daily ranking positions in BeRanked to optimize underperforming keywords.</li>
      </ol>
    `,
  },
  {
    slug: "kak-vyvesti-kejs-v-top-poiska-behance",
    category: "promotion",
    readTime: "8 мин",
    readTimeEn: "8 min",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-30",
    author: {
      name: "Влад Харин",
      nameEn: "Vlad Kharin",
      role: "Founder BeRanked & Lead Product Designer",
      roleEn: "Founder BeRanked & Lead Product Designer",
      avatar: "👨‍💻",
    },
    keywords: [
      "продвижение на behance",
      "как раскрутить кейс на бехансе",
      "как набрать просмотры на behance",
      "вывести кейс в топ behance",
      "раскрутка behance 2026",
    ],
    keywordsEn: [
      "behance promotion",
      "how to rank behance project",
      "get views on behance",
      "behance top search",
      "behance case study promotion",
    ],
    // RU
    title: "Как вывести кейс в ТОП поиска Behance: пошаговый план от публикации до первых заказов",
    subtitle: "Алгоритм продвижения проекта на первые строчки выдачи без накруток и серых схем",
    excerpt: "Что влияет на ранжирование проектов на Behance в первые 48 часов. Как собрать первые просмотры, удержать внимание и зафиксироваться в первой десятке поиска по ключевым тегам.",
    categoryLabel: "Продвижение кейсов",
    tableOfContents: [
      { id: "golden-hours", title: "Правило первых 48 часов: как работает momentum" },
      { id: "cover-impact", title: "Обложка кейса: CTR решает всё" },
      { id: "timing", title: "Время публикации: когда заливать проект" },
      { id: "external-traffic", title: "Привлечение внешнего трафика для буста" },
      { id: "tag-tuning", title: "Докрутка тегов на 3-й день: замена неработающих" },
    ],
    contentHtml: `
      <h2 id="golden-hours">Правило первых 48 часов: как работает momentum</h2>
      <p>Когда вы публикуете новый проект, алгоритм Behance помещает его в специальный «инкубатор новинок». В первые 24–48 часов система замеряет <strong>Velocity Score</strong> (скорость набора просмотров, лайков и глубину скролла).</p>
      <p>Если проект быстро привлекает внимание, алгоритм повышает его ранги в поисковой выдаче по указанным тегам.</p>

      <h2 id="cover-impact">Обложка кейса: CTR решает всё</h2>
      <p>Если превью-картинка (Cover) размытая или перегруженная — на нее просто никто не нажмет в поисковой сетке. Делайте один крупный фокусный элемент и высокий контраст.</p>

      <h2 id="timing">Время публикации: когда заливать проект</h2>
      <p>Лучшее время для публикации: <strong>вторник, среда или четверг с 15:00 до 18:00 по московскому времени (12:00–15:00 UTC)</strong>, когда Европа активна, а в США начинается рабочий день.</p>

      <h2 id="tag-tuning">Докрутка тегов на 3-й день: замена неработающих</h2>
      <p>Через 3–4 дня после старта проверьте позиции в BeRanked. Если по широкому тегу проект висит на 84 месте, а по узкому влетел на #3 место — замените слабый тег на более узкий синоним.</p>
    `,

    // EN
    titleEn: "How to Rank Your Behance Project in TOP Search: Step-by-Step Growth Playbook",
    subtitleEn: "Organic ranking strategy to reach search results and attract inbound client leads without spam or fake likes",
    excerptEn: "Discover what drives Behance search ranking during the critical first 48 hours. How to optimize cover CTR, schedule publishing, and refine keywords to secure long-term TOP-10 visibility.",
    categoryLabelEn: "Case Promotion",
    tableOfContentsEn: [
      { id: "golden-hours", title: "The 48-Hour Golden Window & Velocity Score" },
      { id: "cover-impact", title: "Project Cover: Why CTR Controls Search Ranks" },
      { id: "timing", title: "Optimal Publishing Schedule" },
      { id: "external-traffic", title: "Driving Initial External Traffic" },
      { id: "tag-tuning", title: "Day 3 Keyword Fine-Tuning" },
    ],
    contentHtmlEn: `
      <h2 id="golden-hours">The 48-Hour Golden Window & Velocity Score</h2>
      <p>When you publish a new project, Behance evaluates your <strong>Velocity Score</strong> (rate of initial impressions, appreciations, and scroll depth) during the first 24–48 hours.</p>
      <p>High initial engagement signals high quality, prompting the search algorithm to boost your keyword rankings.</p>

      <h2 id="cover-impact">Project Cover: Why CTR Controls Search Ranks</h2>
      <p>Your cover image (808 × 632 px) must have a single bold focal point, high contrast against both light and dark themes, and zero illegible micro-text.</p>

      <h2 id="timing">Optimal Publishing Schedule</h2>
      <p>Publish on <strong>Tuesday, Wednesday, or Thursday between 12:00–15:00 UTC</strong> to overlap with active European business hours and the morning workday in the US.</p>

      <h2 id="tag-tuning">Day 3 Keyword Fine-Tuning</h2>
      <p>Inspect your positions in BeRanked on Day 3. Replace keywords ranked below #50 with sharper, low-competition niche alternatives.</p>
    `,
  },
  {
    slug: "5-oshibok-v-tegakh-iz-za-kotorykh-kejs-ne-vidyat",
    category: "mistakes",
    readTime: "6 мин",
    readTimeEn: "6 min",
    publishedAt: "2026-08-24",
    updatedAt: "2026-08-30",
    author: {
      name: "Влад Харин",
      nameEn: "Vlad Kharin",
      role: "Founder BeRanked & Lead Product Designer",
      roleEn: "Founder BeRanked & Lead Product Designer",
      avatar: "👨‍💻",
    },
    keywords: [
      "почему нет просмотров на behance",
      "ошибки в тегах behance",
      "почему кейс не находит в поиске",
      "behance seo ошибки",
    ],
    keywordsEn: [
      "why no views on behance",
      "behance tag mistakes",
      "behance project not ranking",
      "behance seo errors",
    ],
    // RU
    title: "5 фатальных ошибок в тегах на Behance, из-за которых кейс теряет 90% просмотров",
    subtitle: "Проверьте свои проекты: типичные промахи, которые хоронят даже сильные дизайн-кейсы",
    excerpt: "Разбор реальных ошибок дизайнеров: дублирование тегов, использование нерелевантных модных слов, опечатки и игнорирование языковых стандартов поисковика.",
    categoryLabel: "Ошибки и антипаттерны",
    tableOfContents: [
      { id: "error-1", title: "Ошибка 1: Теги-призраки (одиночные общие слова)" },
      { id: "error-2", title: "Ошибка 2: Русскоязычные теги" },
      { id: "error-3", title: "Ошибка 3: Спам нерелевантными трендовыми словами" },
      { id: "error-4", title: "Ошибка 4: Забытые и заброшенные проекты" },
      { id: "error-5", title: "Ошибка 5: Отсутствие трекинга позиций" },
    ],
    contentHtml: `
      <h2 id="error-1">Ошибка 1: Теги-призраки (слишком широкие одиночные слова)</h2>
      <p>Слова вроде <code>art</code>, <code>design</code>, <code>creative</code> имеют миллионы конкурентов. Ваш кейс затеряется на 50 000-й странице за пару секунд. Конкретизируйте: <code>saas product design</code> или <code>b2b platform</code>.</p>

      <h2 id="error-2">Ошибка 2: Русскоязычные теги</h2>
      <p>Алгоритм оптимизирован под английский язык. 100% тегов должны быть на чистом английском без транслита.</p>

      <h2 id="error-3">Ошибка 3: Спам нерелевантными словами</h2>
      <p>Попытка поставить <code>crypto</code> в кейс про мебель приводит к высокому Bounce Rate и пессимизации алгоритмом.</p>

      <h2 id="error-4">Ошибка 4: Забытые и заброшенные проекты</h2>
      <p>Теги можно и нужно обновлять! Освежив 3–4 тега в старом кейсе, вы вернете ему поисковый трафик.</p>
    `,

    // EN
    titleEn: "5 Fatal Behance Tag Mistakes That Kill 90% of Your Organic Search Views",
    subtitleEn: "Audit your projects: common traps that bury even world-class design case studies in search obscurity",
    excerptEn: "Breakdown of common designer mistakes: ultra-broad ghost tags, non-English keywords, trend spamming, and neglecting continuous rank tracking.",
    categoryLabelEn: "Common Mistakes",
    tableOfContentsEn: [
      { id: "error-1", title: "Mistake 1: Ghost Tags (Ultra-Broad Single Words)" },
      { id: "error-2", title: "Mistake 2: Non-English Keywords" },
      { id: "error-3", title: "Mistake 3: Irrelevant Buzzword Spamming" },
      { id: "error-4", title: "Mistake 4: Abandoning Past Published Projects" },
      { id: "error-5", title: "Mistake 5: Flying Blind Without Rank Tracking" },
    ],
    contentHtmlEn: `
      <h2 id="error-1">Mistake 1: Ghost Tags (Ultra-Broad Words)</h2>
      <p>Words like <code>design</code>, <code>art</code>, and <code>creative</code> have over 15M competing items. Your case is buried on page 5,000 immediately. Use specific two-word terms like <code>saas product design</code>.</p>

      <h2 id="error-2">Mistake 2: Non-English Keywords</h2>
      <p>The global Behance search engine is powered by English morphology. Always write tags in proper English.</p>

      <h2 id="error-3">Mistake 3: Irrelevant Buzzword Spamming</h2>
      <p>Putting <code>ai</code> into a furniture catalog triggers high bounce rates and search penalties.</p>

      <h2 id="error-4">Mistake 4: Abandoning Published Projects</h2>
      <p>Tags can be edited anytime! Refreshing 3 tags in a 6-month-old project reignites inbound client discovery.</p>
    `,
  },
  {
    slug: "algoritmy-poiska-i-rekomendatsij-behance",
    category: "algorithms",
    readTime: "9 мин",
    readTimeEn: "9 min",
    publishedAt: "2026-08-25",
    updatedAt: "2026-08-30",
    author: {
      name: "Влад Харин",
      nameEn: "Vlad Kharin",
      role: "Founder BeRanked & Lead Product Designer",
      roleEn: "Founder BeRanked & Lead Product Designer",
      avatar: "👨‍💻",
    },
    keywords: [
      "алгоритмы behance",
      "как работает поиск behance",
      "кураторские галереи behance",
      "как получить ленточку behance",
    ],
    keywordsEn: [
      "behance algorithms",
      "how behance search works",
      "behance curated galleries",
      "get featured on behance",
    ],
    // RU
    title: "Как на самом деле работают алгоритмы поиска Behance: разбор выдачи, кураторских лент и трендов",
    subtitle: "Технический взгляд под капот платформы: факторы ранжирования, влияние кураторов и механика поиска",
    excerpt: "Из чего складывается позиция проекта в поисковой выдаче. Роль текстовых совпадений, вовлеченности аудитории и кураторских наград (Curated Ribbons).",
    categoryLabel: "Алгоритмы платформы",
    tableOfContents: [
      { id: "search-vs-feed", title: "Поиск против Ленты: два разных мира" },
      { id: "ranking-factors", title: "Главные факторы ранжирования поисковой выдачи" },
      { id: "curated-galleries", title: "Кураторские галереи (Ribbons) и их влияние на SEO" },
    ],
    contentHtml: `
      <h2 id="search-vs-feed">Поиск против Ленты: два разных мира</h2>
      <p>Лента (Discover Feed) дает короткий всплеск и гаснет. Поиск (Search) обеспечивает непрерывный поток заказчиков годами.</p>

      <h2 id="ranking-factors">Главные факторы ранжирования поисковой выдачи</h2>
      <ul>
        <li><strong>Text Relevance:</strong> точное совпадение тега и названия.</li>
        <li><strong>Engagement Rate:</strong> соотношение лайков к просмотрам (8–15%).</li>
        <li><strong>Moodboard Saves:</strong> добавление в коллекции кураторами и арт-директорами.</li>
      </ul>
    `,

    // EN
    titleEn: "How the Behance Algorithm Actually Works: Search Engine, Curated Ribbons & Trends",
    subtitleEn: "Engineering perspective under the hood: ranking signals, curation criteria, and search mechanics",
    excerptEn: "Breakdown of factors determining your project's search placement. Textual relevance, velocity signals, moodboard saves, and curated Adobe ribbons.",
    categoryLabelEn: "Platform Algorithms",
    tableOfContentsEn: [
      { id: "search-vs-feed", title: "Search Results vs. Discover Feed" },
      { id: "ranking-factors", title: "Core Search Ranking Signals" },
      { id: "curated-galleries", title: "Curated Ribbons & Their SEO Weight" },
    ],
    contentHtmlEn: `
      <h2 id="search-vs-feed">Search Results vs. Discover Feed</h2>
      <p>The Discover Feed generates a brief viral spike, while Search delivers continuous inbound business inquiries for months.</p>

      <h2 id="ranking-factors">Core Search Ranking Signals</h2>
      <ul>
        <li><strong>Exact Text Relevance:</strong> matching custom tags and project titles.</li>
        <li><strong>Engagement Ratio:</strong> ratio of appreciations to views (8–15%).</li>
        <li><strong>Moodboard Saves:</strong> key signal indicating bookmarking by art directors.</li>
      </ul>
    `,
  },
  {
    slug: "kak-oformit-kejs-chtoby-ego-zametili-klienty",
    category: "sales",
    readTime: "7 мин",
    readTimeEn: "7 min",
    publishedAt: "2026-08-26",
    updatedAt: "2026-08-30",
    author: {
      name: "Влад Харин",
      nameEn: "Vlad Kharin",
      role: "Founder BeRanked & Lead Product Designer",
      roleEn: "Founder BeRanked & Lead Product Designer",
      avatar: "👨‍💻",
    },
    keywords: [
      "оформление кейса behance",
      "структура кейса behance",
      "как получать заказы с behance",
    ],
    keywordsEn: [
      "behance case study design",
      "behance project structure",
      "get clients on behance",
    ],
    // RU
    title: "Как оформить кейс на Behance, чтобы он продавал: структура, обложка и конверсия в лиды",
    subtitle: "Анатомия успешной дизайн-презентации: как превратить красивую картинку в стабильный источник клиентов",
    excerpt: "Разбираем идеальную структуру проекта: от формулировки проблемы клиента до финального блока контактов. Секреты удержания внимания заказчика.",
    categoryLabel: "Конверсия и продажи",
    tableOfContents: [
      { id: "structure", title: "Идеальная структура продающего кейса" },
      { id: "cta-footer", title: "Финальный экран: правильный Call-to-Action" },
    ],
    contentHtml: `
      <h2 id="structure">Идеальная структура продающего кейса</h2>
      <p>Клиент сканирует проект за 15 секунд. Обязательно выдерживайте 6 блоков: Hero, Context, Core UI Solution, Design System, Business Results, Contacts.</p>
      <h2 id="cta-footer">Финальный экран: правильный Call-to-Action</h2>
      <p>Всегда оставляйте прямые контакты для быстрого старта диалога.</p>
    `,

    // EN
    titleEn: "How to Structure a Behance Case Study That Converts Views into High-Ticket Clients",
    subtitleEn: "Anatomy of a high-converting portfolio presentation: turning visual craft into commercial client inquiries",
    excerptEn: "Explore the 6-block presentation formula: problem framing, user experience flows, design systems, business impact metrics, and direct hire CTAs.",
    categoryLabelEn: "Conversion & Sales",
    tableOfContentsEn: [
      { id: "structure", title: "The 6-Block Commercial Case Structure" },
      { id: "cta-footer", title: "Final Screen: The High-Converting CTA" },
    ],
    contentHtmlEn: `
      <h2 id="structure">The 6-Block Commercial Case Structure</h2>
      <p>Clients decide in 15 seconds. Include Hero, Context & Goal, Core UI Solution, Design System, Business Results, and Direct Contact CTA.</p>
      <h2 id="cta-footer">Final Screen: The High-Converting CTA</h2>
      <p>Always end with explicit contact channels (Email, Telegram, Calendly link).</p>
    `,
  },
  {
    slug: "analiz-konkurentov-na-behance-cherez-tegi",
    category: "tags",
    readTime: "6 мин",
    readTimeEn: "6 min",
    publishedAt: "2026-08-28",
    updatedAt: "2026-08-30",
    author: {
      name: "Влад Харин",
      nameEn: "Vlad Kharin",
      role: "Founder BeRanked & Lead Product Designer",
      roleEn: "Founder BeRanked & Lead Product Designer",
      avatar: "👨‍💻",
    },
    keywords: [
      "анализ конкурентов behance",
      "теги конкурентов behance",
      "тренды behance 2026",
    ],
    keywordsEn: [
      "competitor analysis behance",
      "competitor tags behance",
      "behance trends 2026",
    ],
    // RU
    title: "Как подсматривать теги у конкурентов на Behance и находить свободные ниши с высоким спросом",
    subtitle: "Практическая разведка: как анализировать ТОП-10 проектов вашей категории и занимать свободные слоты",
    excerpt: "Методика конкурентного анализа на Behance. Как находить растущие низкоконкурентные теги (Rising Tags) и быстро занимать первые строчки в поиске.",
    categoryLabel: "Анализ рынка и трендов",
    tableOfContents: [
      { id: "find-gaps", title: "Как находить «дыры» в семантике конкурентов" },
      { id: "rising-tags", title: "Охота за растущими тегами (Rising Tags)" },
    ],
    contentHtml: `
      <h2 id="find-gaps">Как находить «дыры» в семантике конкурентов</h2>
      <p>Смотрите, какие нишевые теги упускают лидеры ниши, и забирайте целевых заказчиков себе.</p>
      <h2 id="rising-tags">Охота за растущими тегами (Rising Tags)</h2>
      <p>Внедряйте свежие термины (например, <code>spatial ui</code>, <code>bento grid</code>) раньше других.</p>
    `,

    // EN
    titleEn: "How to Spy on Competitor Tags on Behance & Unlock High-Demand Niche Keywords",
    subtitleEn: "Competitive keyword intelligence: analyzing TOP-10 category leaders to claim open ranking slots",
    excerptEn: "Learn how to spot semantic gaps in competitor projects, target high-intent long-tail keywords, and leverage rising micro-trends.",
    categoryLabelEn: "Market & Trends",
    tableOfContentsEn: [
      { id: "find-gaps", title: "Spotting Gaps in Competitor Semantics" },
      { id: "rising-tags", title: "Hunting for Rising Trend Tags" },
    ],
    contentHtmlEn: `
      <h2 id="find-gaps">Spotting Gaps in Competitor Semantics</h2>
      <p>Identify narrow keywords that category leaders overlook, and claim #1 rank positions for specific commercial buyers.</p>
      <h2 id="rising-tags">Hunting for Rising Trend Tags</h2>
      <p>Adopt emerging design terms (such as <code>spatial ui</code>, <code>bento grid</code>) before everyone else does.</p>
    `,
  },
];

export const getLocalizedArticle = (article: GuideArticle, lang: string) => {
  const isEn = lang === "en";
  return {
    slug: article.slug,
    category: article.category,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    title: isEn ? article.titleEn : article.title,
    subtitle: isEn ? article.subtitleEn : article.subtitle,
    excerpt: isEn ? article.excerptEn : article.excerpt,
    categoryLabel: isEn ? article.categoryLabelEn : article.categoryLabel,
    readTime: isEn ? article.readTimeEn : article.readTime,
    tableOfContents: isEn ? article.tableOfContentsEn : article.tableOfContents,
    contentHtml: isEn ? article.contentHtmlEn : article.contentHtml,
    keywords: isEn ? article.keywordsEn : article.keywords,
    author: {
      avatar: article.author.avatar,
      name: isEn ? article.author.nameEn : article.author.name,
      role: isEn ? article.author.roleEn : article.author.role,
    },
  };
};

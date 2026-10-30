# React + TypeScript + Vite

## BeRanked: SEO build and deployment

`npm run build` creates the browser bundle and prerenders 19 public pages into
`dist/`. Each public page contains its own title, description, canonical, social
metadata and actual content before JavaScript runs. The sitemap is generated
from `src/data/guidesData.ts` and `src/data/nicheTagsData.ts`; add content there
instead of editing sitemap URLs manually. Real article modification dates are
used; other pages do not publish an invented `lastmod`.

Run `npm test` and `npm run check:seo` after building. `dist-ssr/` is only a build
tool and must not be deployed as the public document root. Publish `dist/`.

For clean URLs, merge `deploy/nginx-static-location.conf` into the existing
frontend server configuration, preserving its TLS, API and other locations:

```nginx
error_page 404 /404.html;
location = /404.html {
    internal;
}
location / {
    try_files $uri.html $uri $uri/ =404;
}
```

Generated pages are available both as `tags/ui-ux-design.html` and as
`tags/ui-ux-design/index.html`. The `$uri.html` lookup serves the canonical URL
without a trailing-slash redirect. Hosts with SPA fallback only must be
configured to serve these files and return HTTP 404 for missing URLs. The
`/auth`, `/demo`, and `/admin` application routes have separate `noindex` HTML
shells. `404.html` contains the not-found page; unknown addresses no longer
redirect to the landing page in the client router.

After deployment, confirm that a direct HTTP request to `/tags/ui-ux-design`
returns that page's content and its own canonical, not the landing page. Then
submit `/sitemap.xml` in Yandex Webmaster and Google Search Console and inspect
representative guide and niche URLs. The project includes both verification
meta tags already; account verification and indexing status still need to be
checked in the respective dashboards.

Client-side navigation and language changes update the same metadata. The
canonical path is language-neutral; the build publishes Russian HTML, while
English remains available through the existing language switcher. Separate
indexed English URLs and hreflang are outside this change.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# CLAUDE.md — Notion Blog

This file provides context for AI assistants working on this codebase.

## Project Overview

A Japanese-language personal blog ("引きこもりエンジニアの徒然ログ") built with **Next.js 16 (App Router)** and **Notion as a CMS**. Blog posts are written in Notion and fetched via the Notion API, then rendered as Markdown. The app is deployed to **Cloudflare Workers** via OpenNext.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| CMS | Notion API (`@notionhq/client` v5, `notion-to-md`) |
| Markdown rendering | `react-markdown` + `remark-gfm` + `remark-breaks` + `rehype-highlight` |
| Syntax highlighting | `highlight.js` (github-dark theme) |
| Comments | Giscus (`@giscus/react`) — GitHub Discussions based |
| Dark mode | `next-themes` |
| Icons | `lucide-react` |
| Date formatting | `date-fns` |
| Package manager | **pnpm** (do not use npm or yarn) |
| Deployment | Cloudflare Workers via `@opennextjs/cloudflare` + `wrangler` |

## Directory Structure

```
notion-blog/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (header, footer, ThemeProvider)
│   │   ├── page.tsx                # Home page — paginated post listing
│   │   ├── not-found.tsx           # 404 page
│   │   ├── globals.css             # Global styles
│   │   ├── sitemap.ts              # Dynamic XML sitemap
│   │   ├── blog/[slug]/page.tsx    # Individual blog post page
│   │   ├── tags/[tag]/page.tsx     # Tag archive page
│   │   ├── feed.xml/route.ts       # RSS 2.0 feed
│   │   └── api/views/[pageId]/route.ts  # POST endpoint to increment view count
│   ├── components/
│   │   ├── Comments.tsx            # Giscus comment widget (client component)
│   │   ├── TableOfContents.tsx     # Sticky TOC with IntersectionObserver (client)
│   │   ├── TagLink.tsx             # Tag badge linking to /tags/[tag]
│   │   ├── ViewTracker.tsx         # Fires POST /api/views on mount (client)
│   │   ├── theme-provider.tsx      # next-themes ThemeProvider wrapper
│   │   └── theme-toggle.tsx        # Dark/light mode toggle button
│   └── lib/
│       ├── notion.ts               # Notion API client, data fetching, types
│       └── toc.ts                  # Markdown heading extraction for TOC
├── public/                         # Static assets
├── docs/                           # Project documentation (requirements, plan)
├── next.config.ts                  # Next.js config (image remote patterns)
├── open-next.config.ts             # OpenNext Cloudflare config
├── wrangler.jsonc                  # Cloudflare Workers config
├── eslint.config.mjs               # ESLint (Next.js core-web-vitals + TypeScript)
├── tsconfig.json                   # TypeScript config
├── docker-compose.yml              # Local Docker dev environment
└── Dockerfile                      # Docker image definition
```

## Environment Variables

These must be set before the app can start (enforced by hard throws in `src/lib/notion.ts`):

| Variable | Required | Description |
|---|---|---|
| `NOTION_API_KEY` | Yes | Notion integration secret token |
| `NOTION_DATABASE_ID` | Yes | Notion database ID containing posts |
| `NEXT_PUBLIC_SITE_URL` | No | Full site URL (default: `https://localhost:3000`) |
| `NEXT_PUBLIC_GISCUS_REPO` | No | GitHub repo for Giscus comments (e.g. `user/repo`) |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | No | Giscus repo ID |
| `NEXT_PUBLIC_GISCUS_CATEGORY` | No | Giscus discussion category name |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | No | Giscus discussion category ID |

Create a `.env.local` file at the project root for local development.

## Notion Database Schema

The Notion database must have the following properties:

| Property | Type | Notes |
|---|---|---|
| `title` | Title | Post title |
| `slug` | Rich text | URL slug; falls back to page ID if absent |
| `createdAt` | Created time | Publication date |
| `tags` | Multi-select | Post tags |
| `summary` | Rich text | Excerpt / meta description |
| `views` | Number | View count (incremented by the API route) |
| `status` | Select | Only pages with `"Published"` are shown; if absent, all are shown |

## Development Workflows

### Local Development (Node.js)
```bash
pnpm install
# create .env.local with required vars
pnpm dev          # http://localhost:3000
```

### Local Development (Docker)
```bash
docker compose up -d
docker compose run --rm app pnpm install
# app available at http://localhost:3000
```

### Linting
```bash
pnpm lint
```

### Build & Preview for Cloudflare
```bash
pnpm build:worker   # runs opennextjs-cloudflare build
pnpm preview        # local wrangler dev preview
```

### Deploy to Cloudflare Workers
```bash
pnpm deploy         # build:worker + wrangler deploy
```

## Key Conventions

### Data Fetching
- All Notion data fetching is centralised in `src/lib/notion.ts`.
- **`getPosts()`** uses the Notion Search API (not `databases.query`) as a workaround for a v5.9.0 API limitation. It filters by `NOTION_DATABASE_ID` and `status === "Published"`, then sorts by date descending.
- Pages revalidate every **3600 seconds** (1 hour) using `export const revalidate = 3600` at the page level. Do not remove this — Cloudflare Workers does not support on-demand ISR in the same way.

### Routing
- `/` — paginated post list (`PAGE_SIZE = 10`, query param `?page=N`)
- `/blog/[slug]` — single post; slug is URL-decoded if necessary
- `/tags/[tag]` — posts filtered by tag; tag is URL-encoded in hrefs
- `/api/views/[pageId]` — `POST` only; increments a Notion `views` property
- `/feed.xml` — RSS 2.0 feed
- `/sitemap.xml` — auto-generated sitemap

### Heading IDs (TOC)
Heading IDs are generated identically in two places and **must stay in sync**:
- `src/lib/toc.ts` — `extractHeadings()` (server-side, builds the TOC data)
- `src/app/blog/[slug]/page.tsx` — `h2`/`h3` custom renderers (client-side, sets DOM `id`)

The ID algorithm: lowercase → spaces to `-` → strip non-word/non-Japanese chars → trim leading/trailing `-`.

### Client vs Server Components
- Default to **Server Components** (no directive needed).
- Add `"use client"` only when browser APIs or React hooks are required.
- Current client components: `Comments`, `TableOfContents`, `ViewTracker`, `theme-toggle`, `theme-provider`.

### Styling
- Use **Tailwind CSS utility classes** directly in JSX. No separate CSS modules.
- Dark mode via `class` strategy (`next-themes`). Use `dark:` variants.
- Prose content (blog body) uses `prose dark:prose-invert` from `@tailwindcss/typography`.
- Max content width: `max-w-3xl` (post list, tag pages) / `max-w-3xl xl:max-w-5xl` (blog post with sidebar TOC).
- Consistent page container: `container mx-auto px-4 py-12 max-w-3xl`.

### TypeScript
- Strict mode is enabled. Avoid `any` — use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` only where the Notion SDK forces it (as seen in `getPosts()`).
- Path alias `@/` maps to `src/`.

### Image Handling
- Use Next.js `<Image>` for all post images. Allowed remote hostnames are configured in `next.config.ts` (Notion S3 buckets).
- Notion bookmark blocks are converted by `notion-to-md` to `[bookmark](url)` links and rendered with a custom card style in the blog post renderer.

### Commit Style
The repo uses conventional commits (Japanese or English) with scopes. Examples from history:
- `feat(tags): タグフィルタリングとアーカイブページを追加`
- `fix(blog): 記事詳細ページの日付表示を ja-JP フォーマットに修正`
- `chore(deploy): Cloudflare Workers デプロイ設定を追加`

## Architecture Notes

- **No database** — Notion itself is the persistence layer for both post content and view counts.
- **View counting** — `ViewTracker` (client) fires a `POST /api/views/[pageId]` on mount, which calls `notion.pages.update` to increment the `views` property. This means views are stored directly in Notion and fetched as part of each post.
- **Giscus comments** — entirely client-side GitHub Discussions embed; requires the 4 `NEXT_PUBLIC_GISCUS_*` env vars to be set with correct Giscus configuration.
- **Cloudflare deployment** — uses `@opennextjs/cloudflare` to compile the Next.js app into a Cloudflare Worker. The `nodejs_compat` compatibility flag is required.

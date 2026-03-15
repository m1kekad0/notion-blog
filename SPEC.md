# SPEC.md — notion-blog 設計書

> **引きこもりエンジニアの徒然ログ**  
> Notion をデータソースとし、Next.js + Cloudflare Workers で動作する個人技術ブログ。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| サイト名 | 引きこもりエンジニアの徒然ログ |
| 説明 | 引きこもりエンジニアの日常・技術・雑記ブログ。Notion と Next.js で動いています。 |
| リポジトリ | `m1kekad0/notion-blog` |
| バージョン | 0.1.0 |

---

## 2. 技術スタック

### フレームワーク・コア
| 種別 | ライブラリ | バージョン |
|------|-----------|-----------|
| フレームワーク | Next.js | 16.1.6 |
| UI ライブラリ | React / React DOM | 19.2.3 |
| 言語 | TypeScript | ^5 |

### Notion 連携
| 種別 | ライブラリ | バージョン |
|------|-----------|-----------|
| Notion API クライアント | `@notionhq/client` | ^5.9.0 |
| Notion → Markdown 変換 | `notion-to-md` | ^3.1.9 |

### コンテンツ描画
| 種別 | ライブラリ | バージョン |
|------|-----------|-----------|
| Markdown → React コンポーネント | `react-markdown` | ^10.1.0 |
| GFM (GitHub Flavored Markdown) | `remark-gfm` | ^4.0.1 |
| 改行処理 | `remark-breaks` | ^4.0.0 |
| シンタックスハイライト | `rehype-highlight` / `highlight.js` | ^7.0.2 / ^11.11.1 |

### スタイリング
| 種別 | ライブラリ | バージョン |
|------|-----------|-----------|
| CSS フレームワーク | Tailwind CSS | ^4 |
| Typography プラグイン | `@tailwindcss/typography` | ^0.5.19 |
| クラス合成ユーティリティ | `clsx` / `tailwind-merge` | ^2.1.1 / ^3.4.1 |

### UI コンポーネント
| 種別 | ライブラリ | バージョン |
|------|-----------|-----------|
| アイコン | `lucide-react` | ^0.574.0 |
| ダークモード | `next-themes` | ^0.4.6 |
| コメント | `@giscus/react` | ^3.1.0 |

### ユーティリティ
| 種別 | ライブラリ | バージョン |
|------|-----------|-----------|
| 日付処理 | `date-fns` | ^4.1.0 |

### インフラ・ビルド
| 種別 | ツール | バージョン |
|------|--------|-----------|
| エッジランタイムアダプタ | `@opennextjs/cloudflare` | ^1.17.1 |
| デプロイ CLI | `wrangler` | ^4.73.0 |
| パッケージマネージャ | pnpm | - |

---

## 3. アーキテクチャ概要

```
 Notion Database
       │
       │ Notion API (Search API ワークアラウンド)
       ▼
 src/lib/notion.ts  ──── サーバーサイドデータ取得層
       │
       ├── src/app/ (Next.js App Router)
       │       │
       │       ├── page.tsx          (記事一覧 / トップページ)
       │       ├── blog/[slug]/      (記事詳細ページ)
       │       ├── tags/[tag]/       (タグ別記事一覧)
       │       ├── api/views/[pageId]/ (閲覧数インクリメント API)
       │       ├── feed.xml/         (RSS フィード)
       │       └── sitemap.ts        (サイトマップ)
       │
       ├── src/components/           (共有UIコンポーネント)
       └── src/lib/                  (ユーティリティ関数)

 ビルド:  opennextjs-cloudflare build
       ↓
 .open-next/ (Cloudflare Workers 用バンドル)
       ↓
 Cloudflare Workers (wrangler deploy)
```

---

## 4. ディレクトリ構造

```
notion-blog/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 共通レイアウト (Header / Footer)
│   │   ├── page.tsx                  # トップページ (記事一覧)
│   │   ├── not-found.tsx             # 404 ページ
│   │   ├── sitemap.ts                # XML サイトマップ生成
│   │   ├── globals.css               # グローバルスタイル
│   │   ├── blog/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # 記事詳細ページ
│   │   ├── tags/
│   │   │   └── [tag]/
│   │   │       └── page.tsx          # タグ別記事一覧
│   │   ├── api/
│   │   │   └── views/
│   │   │       └── [pageId]/
│   │   │           └── route.ts      # 閲覧数インクリメント API
│   │   └── feed.xml/
│   │       └── route.ts              # RSS フィード
│   ├── components/                   # 共有コンポーネント
│   │   ├── CodeBlock.tsx             # コードブロック (コピーボタン付き)
│   │   ├── Comments.tsx              # Giscus コメント欄
│   │   ├── TableOfContents.tsx       # 目次 (スクロール連動)
│   │   ├── TagLink.tsx               # タグリンク
│   │   ├── ViewTracker.tsx           # 閲覧数トラッキング
│   │   ├── theme-provider.tsx        # テーマプロバイダー
│   │   └── theme-toggle.tsx          # ダーク/ライト/システム切り替え
│   └── lib/
│       ├── notion.ts                 # Notion API クライアント・データ取得関数
│       └── toc.ts                   # Markdown から見出し抽出ユーティリティ
├── next.config.ts                    # Next.js 設定
├── open-next.config.ts               # OpenNext (Cloudflare) 設定
├── wrangler.jsonc                    # Cloudflare Workers デプロイ設定
├── tsconfig.json                     # TypeScript 設定
├── postcss.config.mjs                # PostCSS 設定
└── eslint.config.mjs                 # ESLint 設定
```

---

## 5. 主要機能・コンポーネント詳細

### 5.1 データ取得層 (`src/lib/notion.ts`)

| 関数 | 説明 |
|------|------|
| `getPosts()` | Notion Search API で全記事を取得し、`status === "Published"` かつ対象データベースに属するものをフィルタリング。`createdAt` 降順でソート |
| `getPostBySlug(slug)` | slug または URL デコード済み slug で記事を検索 |
| `getPostById(pageId)` | pageId で記事を検索 |
| `getPostContent(pageId)` | `notion-to-md` でページ内容を Markdown 文字列に変換 |
| `incrementViews(pageId, currentViews)` | Notion API でページの `views` プロパティを +1 更新 |

**注意事項**: `@notionhq/client` v5.9.0 では `databases.query` が機能しないため、Search API をワークアラウンドとして使用。これは恒久的な設計として受け入れる。記事数増加による API コール増大への対応は `docs/backlog.md` を参照。

#### Notion データベース プロパティ定義

| プロパティ名 | 型 | 説明 |
|------------|-----|------|
| `title` | `title` | 記事タイトル |
| `slug` | `rich_text` | URL スラッグ (未設定時は page ID を使用) |
| `createdAt` | `created_time` | 作成日時 |
| `tags` | `multi_select` | タグ一覧 |
| `summary` | `rich_text` | 記事要約 (excerpt) |
| `views` | `number` | 閲覧数 |
| `status` | `select` | 公開ステータス (`"Published"` のみ表示) |

### 5.2 Post 型定義

```typescript
export type Post = {
    id: string;      // Notion page ID
    title: string;   // 記事タイトル
    slug: string;    // URL スラッグ
    date: string;    // ISO 8601 日時文字列
    tags: string[];  // タグ一覧
    excerpt: string; // 要約
    views: number;   // 閲覧数
};
```

### 5.3 ルート一覧

| ルート | ファイル | 方式 | 説明 |
|--------|---------|------|------|
| `/` | `app/page.tsx` | Dynamic (ISR) | 記事一覧（ページネーション・1ページ10件） |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | `force-dynamic` | 記事詳細（Notion 画像 URL 失効のため毎リクエスト再取得） |
| `/tags/[tag]` | `app/tags/[tag]/page.tsx` | SSG + ISR | タグ別記事一覧 |
| `/api/views/[pageId]` | `app/api/views/[pageId]/route.ts` | API 動的 | 閲覧数インクリメント (POST) |
| `/feed.xml` | `app/feed.xml/route.ts` | ISR | RSS 2.0 フィード |
| `/sitemap.xml` | `app/sitemap.ts` | 動的生成 | XML サイトマップ |
| `/404` | `app/not-found.tsx` | - | カスタム 404 ページ |

**ISR 設定**: `/tags/[tag]`・`/feed.xml` は `revalidate = 3600`（1時間）。`/blog/[slug]` は `force-dynamic`（キャッシュなし）。

### 5.4 コンポーネント詳細

#### `TableOfContents.tsx`
- `IntersectionObserver` を使い、画面内のセクション見出しを監視
- アクティブな見出しをハイライト（スクロール連動）
- `xl` 以上のbreakpoint では右サイドバーに固定表示、それ未満では記事本文の先頭にインライン表示

#### `CodeBlock.tsx`
- `pre` 要素をラップし、コピーボタンを追加
- コピー後 2 秒間チェックマークアイコンを表示するフィードバック

#### `Comments.tsx`
- Giscus（GitHub Discussions ベース）コメントシステムを埋め込み
- テーマ（light/dark/system）と連動して Giscus のテーマも切り替え

#### `ViewTracker.tsx`
- クライアントコンポーネント。マウント時に `POST /api/views/[pageId]` を呼び出し閲覧数を記録
- UI は持たず（`return null`）、副作用のみ担当

#### `theme-toggle.tsx`
- `light → dark → system` の3状態をサイクルで切り替え
- ハイドレーション不一致を防ぐため `mounted` フラグで制御

#### `TagLink.tsx`
- タグ名を URL エンコードして `/tags/[tag]` へリンク

### 5.5 目次抽出ユーティリティ (`src/lib/toc.ts`)

`extractHeadings(markdown)` 関数:
- `##`（level 2）と `###`（level 3）の見出しを抽出
- 日本語（ひらがな・カタカナ・漢字）を含む URL セーフな anchor ID を生成

---

## 6. 環境変数

| 変数名 | 用途 | 必須 |
|--------|------|------|
| `NOTION_API_KEY` | Notion Integration API キー | ✅ |
| `NOTION_DATABASE_ID` | 記事データベースの ID | ✅ |
| `NEXT_PUBLIC_SITE_URL` | サイトの公開 URL (OGP・sitemap 等) | ✅ |
| `NEXT_PUBLIC_GISCUS_REPO` | Giscus: GitHub リポジトリ名 | コメント利用時 |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | Giscus: リポジトリ ID | コメント利用時 |
| `NEXT_PUBLIC_GISCUS_CATEGORY` | Giscus: Discussion カテゴリ名 | コメント利用時 |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | Giscus: カテゴリ ID | コメント利用時 |

---

## 7. データフロー

### 記事一覧表示

```
ブラウザ → / (SSG/ISR)
              └─ getPosts()
                    └─ Notion Search API
                          └─ フィルタ (database_id, status=Published)
                                └─ ソート (createdAt DESC)
                                      └─ Post[] → JSX レンダリング
```

### 記事詳細表示

```
ブラウザ → /blog/[slug] (SSG/ISR)
              ├─ getPostBySlug(slug)  → Post メタデータ
              ├─ getPostContent(id)   → Markdown 文字列
              │     └─ notion-to-md (NotionToMarkdown)
              ├─ extractHeadings()    → Heading[] (目次データ)
              └─ ReactMarkdown (rehype-highlight, remark-gfm) → HTML

           クライアント起動後:
              └─ ViewTracker: POST /api/views/[pageId]
                    └─ incrementViews() → Notion pages.update(views +1)
```

### RSS フィード

```
ブラウザ/RSS リーダー → /feed.xml
                          └─ getPosts()
                                └─ RSS 2.0 XML 生成 → Response
```

---

## 8. デプロイ構成

### ローカル開発

```bash
pnpm dev           # Next.js 開発サーバー
pnpm preview       # Cloudflare Workers ローカルプレビュー
```

### 本番デプロイ

```bash
pnpm deploy
# = opennextjs-cloudflare build && wrangler deploy
```

#### ビルド成果物

| ディレクトリ | 内容 |
|-------------|------|
| `.open-next/worker.js` | Cloudflare Workers エントリーポイント |
| `.open-next/assets/` | 静的アセット (Wrangler Assets バインディング) |

### Cloudflare Workers 設定 (`wrangler.jsonc`)

```jsonc
{
  "name": "notion-blog",
  "compatibility_date": "2026-03-13",
  "compatibility_flags": ["nodejs_compat"],
  "main": ".open-next/worker.js",
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

### 画像最適化

`next.config.ts` にて、Notion 画像ドメインを `remotePatterns` で許可:
- `*.notion.so`
- `www.notion.so`
- `prod-files-secure.s3.us-west-2.amazonaws.com`
- `s3.us-west-2.amazonaws.com`

---

## 9. UI / UX 設計

### レスポンシブデザイン

| breakpoint | 目次表示方式 |
|-----------|------------|
| `< xl` (1280px 未満) | 記事本文先頭にインライン表示 |
| `≥ xl` (1280px 以上) | 右サイドバーに sticky 固定表示 |

### ダークモード

- `next-themes` による `light` / `dark` / `system` 3段階切り替え
- ヘッダーの `ThemeToggle` ボタンでサイクル切り替え
- Giscus コメント欄もテーマに連動

### SEO

- 全ページに動的 OGP / Twitter Card メタデータを設定
- RSS フィード (`/feed.xml`) を提供（`<link rel="alternate">` も設定）
- XML サイトマップ (`/sitemap.xml`) を自動生成
- ページごとの `<title>` は `%s | サイト名` テンプレートで生成

---

## 10. ページネーション

- 1 ページあたり 10 件 (`PAGE_SIZE = 10`)
- URL パラメータ `?page=N` で制御（1ページ目は `?page` なし）
- 範囲外ページは安全に最終ページにクリップ

---

## 11. 既知の課題と対応方針

調査で判明した問題と、採用する解決策を以下に定義する。

### 11.1 `data_source_id` フォールバック欠落（**高リスク / 要修正**）

**問題**
`notion.ts:51` は `item.parent.database_id` のみを参照している。Notion が 2026年2月の API 変更で当該データベースを "Data Source" として扱う場合、`database_id` が `undefined` になりフィルタが一件もマッチせず、サイトが "No posts found" をサイレントに返す。

**採用する対応**
`database_id` が存在しない場合に `data_source_id` へフォールバックするよう1行修正する。

```typescript
// Before
const pid = item.parent.database_id;

// After
const pid = item.parent.database_id ?? item.parent.data_source_id;
```

---

### 11.2 Notion 画像 URL の有効期限切れ（**高リスク / 要修正**）

**問題**
Notion がホストする S3 署名付き URL（`prod-files-secure.s3.us-west-2.amazonaws.com`）は **1時間で失効する**。ページを SSG キャッシュすると、キャッシュ済み HTML 内の画像 URL が失効し、画像が壊れる。`next/image` の `remotePatterns` は画像最適化のキャッシュであり、元 URL の失効を防がない。

**採用する対応**
記事詳細ページ（`app/blog/[slug]/page.tsx`）をダイナミックレンダリングに変更し、毎リクエストで最新の署名付き URL を取得する。

```typescript
// app/blog/[slug]/page.tsx に追加
export const dynamic = 'force-dynamic';
```

> **注意**: `revalidate = 3600` と `dynamic = 'force-dynamic'` は共存できない。`dynamic = 'force-dynamic'` を設定した場合、`revalidate` の宣言は削除する。

---

### 11.3 ISR キャッシュバックエンド未設定（**致命的 / 要修正**）

**問題**
`open-next.config.ts` は最小構成（`defineCloudflareConfig()` のみ）で ISR キャッシュストアが未設定。OpenNext Cloudflare は KV または D1 バインディングがないと ISR をサポートせず、`revalidate = 3600` を宣言しても全リクエストがフル SSR にフォールバックする。結果として毎リクエストで Notion API をライブ呼び出しし、レート制限（3 req/s）超過による 429 エラーのリスクがある。

**採用する対応**
Cloudflare KV を ISR キャッシュバックエンドとして設定する。

**`wrangler.jsonc` に追加**

```jsonc
{
  "name": "notion-blog",
  "compatibility_date": "2026-03-13",
  "compatibility_flags": ["nodejs_compat"],
  "main": ".open-next/worker.js",
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "kv_namespaces": [
    {
      "binding": "NEXT_INC_CACHE_KV",
      "id": "261fae5c1c8a4d9e92741fa0a6422420"
    }
  ]
}
```

**`open-next.config.ts` を更新**

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

export default defineCloudflareConfig({
    incrementalCache: kvIncrementalCache,
});
```

> **手順**: `pnpm wrangler kv namespace create NEXT_INC_CACHE_KV` を実行して KV 名前空間を作成し、取得した `id` を `wrangler.jsonc` に設定する。

---

### 11.4 `getPosts()` のページネーション欠落（**中リスク / 要修正**）

**問題**
Notion Search API は1回の呼び出しで最大 100 件しか返さない。`getPosts()` はページネーションなしの単一呼び出しのみで、ワークスペース内のページ総数が 100 を超えると記事がサイレントに切り捨てられる。フィルタリングがクライアントサイドで行われるため、ブログ以外のページ（ミーティングノート等）も 100 件枠を消費し、実質的な上限はさらに低くなる。

**採用する対応**
`has_more` + `start_cursor` によるページネーションループを実装する。

```typescript
export async function getPosts(): Promise<Post[]> {
    const allResults = [];
    let cursor: string | undefined = undefined;

    do {
        const response = await notion.search({
            query: "",
            filter: { property: "object", value: "page" },
            sort: { direction: "descending", timestamp: "last_edited_time" },
            start_cursor: cursor,
        });
        allResults.push(...response.results);
        cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
    } while (cursor);

    // 以降のフィルタリング・ソート処理は変わらず
    ...
}
```

---

### 11.5 閲覧数カウントの API 呼び出しオーバーヘッド（**中リスク / 要修正**）

**問題**
`/api/views/[pageId]/route.ts` は現在の `views` 値を取得するために `getPostById(pageId)` を呼び出しており、これが内部で `getPosts()` 全体（Notion Search API フルラウンドトリップ）を実行する。1ページビューあたり 2 回の Notion API 呼び出しが発生し、レート制限を圧迫する。また、ロックなしの Read-Modify-Write 構造のため同時アクセス時に更新が消失する競合状態も存在する（ベストエフォートとして許容）。

**採用する対応**
`getPostById()` の代わりに `notion.pages.retrieve()` を直接呼び出して現在の views 値を取得し、API 呼び出しを 2 回から 1 回に削減する。

```typescript
// Before
const post = await getPostById(pageId);
if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
await incrementViews(pageId, post.views);

// After
const page = await notion.pages.retrieve({ page_id: pageId });
const currentViews = (page as any).properties?.views?.number ?? 0;
await incrementViews(pageId, currentViews);
```

> **注意**: 競合状態（同時アクセス時のカウント消失）は個人ブログのスケールでは許容範囲とし、現時点では修正しない。正確なカウントが必要になった場合は Cloudflare D1/KV をカウンターのソース・オブ・トゥルースとして使用する構成に移行する。

---

### 11.6 TODO: `/blog/[slug]` への `generateStaticParams` 追加検討

**背景**
`app/blog/[slug]/page.tsx` には `generateStaticParams` が存在しない。Cloudflare Workers + OpenNext の構成では、`generateStaticParams` がない動的セグメントは **初回リクエスト時に必ず Notion API を呼び出す（コールドスタート）**。現在の `revalidate=300` 設定は "オンデマンド ISR" であり、純粋な SSG ではない。

**判断基準**
- 記事数が少なく初回アクセスのレイテンシを許容できる場合 → 現状維持
- 初回アクセス体験を改善したい場合 → `generateStaticParams` を追加してビルド時プリレンダリングを行う（ただしビルド時間が記事数に比例して増加する）

**TODO**: 記事数が増えてきた段階で初回アクセスレイテンシを計測し、必要に応じて対応する。

---

### 11.7 TODO: slug 変更時の Giscus コメントスレッド孤立

**背景**
`Comments.tsx` は `mapping="pathname"` を使用しており、GitHub Discussions のスレッドをページの URL パスで紐付けている。Notion 上で記事の `slug` プロパティを変更すると URL パスが変わり、**旧パスのコメントスレッドは孤立し、新パスでは空のコメント欄が表示される**。

**運用上の注意**
- 一度公開した記事の `slug` は変更しないことを原則とする
- やむを得ず変更する場合は、GitHub Discussions 上で旧スレッドを手動で新 URL 相当のスレッドに移植するか、コメントが失われることを許容する

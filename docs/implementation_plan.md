# Notion Blog 開発計画

## 現状の課題
2026年2月のNotionアップデートにより、開発中のブログで以下の影響が確認されました。
1.  **SDKの互換性**: `@notionhq/client` v5.9.0 にて `notion.databases.query` メソッドが使用できない（定義から消えている）。
2.  **データ構造の変化**: ブログ用データベースが「Data Source」として認識され、ページ構造の `parent` 属性が `database_id` ではなく `data_source_id` になっている。

## 対応方針
標準の `databases.query` が使用できないため、**Search API (`notion.search`)** を代替手段として使用し、記事を取得・表示する機能を実装します。

## Proposed Changes

### Logic Layer (`lib/notion.ts`)
*   **[NEW] `getPosts` function:**
    *   `notion.search` を使用して、ワークスペース内の全「Page」を検索します。
    *   取得したページの中から、環境変数 `NOTION_DATABASE_ID` と一致する親を持つページのみをフィルタリングします。
    *   `data_source_id` と `database_id` の両方のパターンに対応するロジックを実装します。

### UI Layer (`app/page.tsx`, `app/blog/[slug]/page.tsx`)
*   **[NEW] 記事一覧ページ (`app/page.tsx`):**
    *   `getPosts` で取得したデータをカード形式で表示します。
    *   各カードには「タイトル」「作成日」「タグ（取得できれば）」を表示します。
*   **[NEW] 記事詳細ページ (`app/blog/[slug]/page.tsx`):**
    *   `notion-to-md` を使用して、NotionブロックをMarkdownに変換し、レンダリングします。
    *   Mermaidやコードブロックの表示に対応します。

## Verification Plan

### Automated Tests
*   `test-connection.mjs` を拡張し、実際の記事データ（タイトル、本文の一部）が正しく取得できるかを確認します。

### Manual Verification
1.  **一覧表示**: `npm run dev` でローカルサーバーを起動し、トップページに記事一覧が表示されることを確認します。
2.  **詳細表示**: 記事をクリックして詳細ページに遷移し、内容（画像、テキスト、コード）が正しく表示されることを確認します。
3.  **新規記事**: Notion側で新しい記事を追加し、リロードして反映されることを確認します。

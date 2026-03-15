import { cache } from "react";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

if (!process.env.NOTION_API_KEY) {
    throw new Error("Missing NOTION_API_KEY environment variable");
}

if (!process.env.NOTION_DATABASE_ID) {
    throw new Error("Missing NOTION_DATABASE_ID environment variable");
}

/** 認証済み Notion クライアントインスタンス */
export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

/** Notion ページを Markdown に変換するコンバーターインスタンス */
export const n2m = new NotionToMarkdown({ notionClient: notion });

/** Notion データベース ID（環境変数から取得） */
export const databaseId = process.env.NOTION_DATABASE_ID;

/**
 * ブログ記事を表す型定義。
 * Notion データベースの各ページを正規化して保持する。
 */
export type Post = {
    /** Notion ページ ID */
    id: string;
    /** 記事タイトル */
    title: string;
    /** URL スラッグ */
    slug: string;
    /** 作成日時（ISO 8601 文字列） */
    date: string;
    /** タグ一覧 */
    tags: string[];
    /** 記事の概要・サマリ */
    excerpt: string;
    /** 閲覧数 */
    views: number;
};

/**
 * Notion データベースから全記事を取得する（Search API 経由）。
 *
 * React の `cache()` でラップしており、1 リクエストサイクル内での重複呼び出しを防ぐ。
 * `generateMetadata` とページコンポーネントが同一リクエストで呼ばれても、
 * Notion API へのラウンドトリップは 1 回に抑えられる。
 *
 * @returns 公開済み記事の配列（日付降順）
 */
export const getPosts = cache(async function getPosts(): Promise<Post[]> {
    try {
        // notion.databases.query は v5.9.0 で動作しない／Data Sources 非対応のため、
        // Search API をワークアラウンドとして使用する。
        // has_more + start_cursor でページネーションしながら全件取得する。
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allResults: any[] = [];
        let cursor: string | undefined = undefined;

        do {
            const response = await notion.search({
                query: "",
                filter: {
                    property: "object",
                    value: "page",
                },
                sort: {
                    direction: "descending",
                    timestamp: "last_edited_time",
                },
                ...(cursor ? { start_cursor: cursor } : {}),
            });
            allResults.push(...response.results);
            cursor = response.has_more && response.next_cursor ? response.next_cursor : undefined;
        } while (cursor);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbItems = allResults.filter((item: any) => {
            // database_id（標準）と data_source_id（Notion Data Source API 2026年2月変更）の両方に対応
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pid = item.parent.database_id ?? (item.parent as any).data_source_id;
            const isDatabaseMatch = pid && pid.replaceAll("-", "") === databaseId!.replaceAll("-", "");

            const status = item.properties.status?.select?.name;
            const isPublished = status ? status === "Published" : true;

            return isDatabaseMatch && isPublished;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const posts: Post[] = dbItems.map((page: any) => {
            const title: string =
                page.properties.title?.title?.[0]?.plain_text ?? "Untitled";

            const slug: string =
                page.properties.slug?.rich_text?.[0]?.plain_text ?? page.id;

            const date: string =
                page.properties.createdAt?.created_time ?? page.created_time;

            const tags: string[] =
                page.properties.tags?.multi_select?.map(
                    (tag: { name: string }) => tag.name
                ) ?? [];

            const excerpt: string =
                page.properties.summary?.rich_text?.[0]?.plain_text ?? "";

            const views: number = page.properties.views?.number ?? 0;

            return { id: page.id, title, slug, date, tags, excerpt, views };
        });

        // 日付降順で並び替え
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return posts;
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return [];
    }
});

/**
 * スラッグで記事を 1 件取得する。
 *
 * URL エンコードされたスラッグも考慮してデコード後に再検索する。
 *
 * @param slug - 検索対象のスラッグ文字列
 * @returns 該当する記事、見つからない場合は `undefined`
 */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const posts = await getPosts();
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
        // スラッグが URL エンコードされている場合はデコードして再検索
        const decoded = decodeURIComponent(slug);
        if (decoded !== slug) {
            return posts.find((p) => p.slug === decoded);
        }
    }

    return post;
}

/**
 * 指定された Notion ページの本文を Markdown 文字列として取得する。
 *
 * @param pageId - 対象 Notion ページの ID
 * @returns Markdown 形式の本文文字列
 */
export async function getPostContent(pageId: string): Promise<string> {
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString.parent;
}

/**
 * ページ ID で記事を 1 件取得する。
 *
 * @param pageId - 検索対象の Notion ページ ID
 * @returns 該当する記事、見つからない場合は `undefined`
 */
export async function getPostById(pageId: string): Promise<Post | undefined> {
    const posts = await getPosts();
    return posts.find((p) => p.id === pageId);
}

/**
 * 指定された記事の閲覧数を Notion 上で 1 インクリメントする。
 *
 * エラーが発生した場合はサイレントに失敗し、閲覧数の更新はベストエフォートとする。
 *
 * @param pageId - 更新対象の Notion ページ ID
 * @param currentViews - 現在の閲覧数（インクリメント前の値）
 */
export async function incrementViews(pageId: string, currentViews: number): Promise<void> {
    try {
        await notion.pages.update({
            page_id: pageId,
            properties: {
                views: {
                    number: currentViews + 1,
                },
            },
        });
    } catch (error) {
        console.error("Failed to increment views:", error);
    }
}

/**
 * 指定された記事の閲覧数を Notion 上に直接書き込む。
 *
 * KV → Notion のライトスルー時に使用する。
 * `incrementViews` と異なり、指定した値をそのまま設定する。
 * エラーが発生した場合はサイレントに失敗し、更新はベストエフォートとする。
 *
 * @param pageId - 更新対象の Notion ページ ID
 * @param views - Notion に書き込む閲覧数
 */
export async function setViews(pageId: string, views: number): Promise<void> {
    try {
        await notion.pages.update({
            page_id: pageId,
            properties: {
                views: {
                    number: views,
                },
            },
        });
    } catch (error) {
        console.error("Failed to set views:", error);
    }
}

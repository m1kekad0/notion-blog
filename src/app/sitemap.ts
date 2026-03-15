import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/notion";

/** ISR のキャッシュ有効期間（秒）。1 時間ごとに再生成する */
export const revalidate = 3600;

/** サイト URL（環境変数未設定時はローカル開発用 URL にフォールバック） */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

/**
 * サイトマップを生成する関数。
 *
 * Next.js の Metadata Route として `/sitemap.xml` に自動マッピングされる。
 * 以下の 3 種類の URL を含む:
 * - トップページ（優先度 1.0、毎日更新）
 * - 各ブログ記事ページ（優先度 0.8、月次更新）
 * - 各タグ別一覧ページ（優先度 0.5、週次更新）
 *
 * @returns サイトマップエントリの配列
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getPosts();

    // 各記事ページのサイトマップエントリを生成する
    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.8,
    }));

    // 全記事からタグを重複なく抽出してタグページのエントリを生成する
    const tags = Array.from(new Set(posts.flatMap((p) => p.tags)));
    const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
        url: `${siteUrl}/tags/${encodeURIComponent(tag)}`,
        changeFrequency: "weekly",
        priority: 0.5,
    }));

    return [
        { url: siteUrl, changeFrequency: "daily", priority: 1.0 },
        ...postEntries,
        ...tagEntries,
    ];
}

import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/notion";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getPosts();

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.8,
    }));

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

import { getPosts } from "@/lib/notion";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";
const siteName = "引きこもりエンジニアの徒然ログ";
const siteDescription = "引きこもりエンジニアの日常・技術・雑記ブログ。Notion と Next.js で動いています。";

export const revalidate = 3600;

export async function GET() {
    const posts = await getPosts();

    const items = posts
        .map((post) => {
            const pubDate = new Date(post.date).toUTCString();
            const link = `${siteUrl}/blog/${post.slug}`;
            return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ""}
      ${post.tags.map((t) => `<category><![CDATA[${t}]]></category>`).join("\n      ")}
    </item>`;
        })
        .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteName}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>ja</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": `public, max-age=3600, s-maxage=3600`,
        },
    });
}

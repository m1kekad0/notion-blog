import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

if (!process.env.NOTION_API_KEY) {
    throw new Error("Missing NOTION_API_KEY environment variable");
}

if (!process.env.NOTION_DATABASE_ID) {
    throw new Error("Missing NOTION_DATABASE_ID environment variable");
}

export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

export const n2m = new NotionToMarkdown({ notionClient: notion });

export const databaseId = process.env.NOTION_DATABASE_ID;

export type Post = {
    id: string;
    title: string;
    slug: string;
    date: string;
    tags: string[];
    excerpt: string;
};

/**
 * Get all posts from the Notion database (via Search API workaround)
 */
export async function getPosts(): Promise<Post[]> {
    try {
        // Note: notion.databases.query is missing in v5.9.0 or not working with Data Sources.
        // Using Search API as a workaround.
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
        });

        const dbItems = response.results.filter((item: any) => {
            const pid = item.parent.database_id;
            const isDatabaseMatch = pid && pid.replaceAll("-", "") === databaseId.replaceAll("-", "");

            // Status filtering: Only show 'Published' posts if the property exists
            const status = item.properties.status?.select?.name;
            // If status property exists, check if it is 'Published'. If not exists, strict to false or true? 
            // Log showed status property exists and value is "Published".
            // Let's be safe: if status exists, must be Published. If not, include it (or exclude? usually exclude drafts).
            // Given the log showed status: "Published", we should filter.
            const isPublished = status ? status === "Published" : true;

            return isDatabaseMatch && isPublished;
        });

        const posts = dbItems.map((page: any) => {
            // Property mapping based on actual DB structure (inspected via API)
            const title = page.properties.title?.title?.[0]?.plain_text ||
                "Untitled";

            const slug = page.properties.slug?.rich_text?.[0]?.plain_text || page.id;

            // Use createdAt property if available, otherwise created_time
            const date = page.properties.createdAt?.created_time ||
                page.created_time;

            const tags = page.properties.tags?.multi_select?.map((tag: any) => tag.name) || [];

            const excerpt = page.properties.summary?.rich_text?.[0]?.plain_text || "";

            return {
                id: page.id,
                title,
                slug,
                date,
                tags,
                excerpt,
            };
        });

        return posts;
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return [];
    }
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<any> {
    const posts = await getPosts();
    const post = posts.find((p) => p.slug === slug);
    return post;
}

/**
 * Get post content (markdown)
 */
export async function getPostContent(pageId: string) {
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString.parent;
}

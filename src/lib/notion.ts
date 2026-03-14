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
    views: number;
};

/**
 * Get all posts from the Notion database (via Search API workaround)
 */
export async function getPosts(): Promise<Post[]> {
    try {
        // Note: notion.databases.query is missing in v5.9.0 or not working with Data Sources.
        // Using Search API as a workaround. Paginate through all results using has_more + start_cursor.
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
            // Support both database_id (standard) and data_source_id (Notion Data Source API change Feb 2026)
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

        // Sort by date descending
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return posts;
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return [];
    }
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const posts = await getPosts();
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
        const decoded = decodeURIComponent(slug);
        if (decoded !== slug) {
            return posts.find((p) => p.slug === decoded);
        }
    }

    return post;
}

/**
 * Get post content (markdown)
 */
export async function getPostContent(pageId: string): Promise<string> {
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString.parent;
}

/**
 * Get a single post by pageId
 */
export async function getPostById(pageId: string): Promise<Post | undefined> {
    const posts = await getPosts();
    return posts.find((p) => p.id === pageId);
}

/**
 * Increment views for a post
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

import type { Heading } from "@/components/TableOfContents";

export function extractHeadings(markdown: string): Heading[] {
    const headings: Heading[] = [];

    for (const line of markdown.split("\n")) {
        const match = line.match(/^(#{2,3})\s+(.+)/);
        if (!match) continue;

        const level = match[1].length;
        // Strip bold/italic markers for display text
        const text = match[2].replace(/\*+/g, "").trim();
        // Generate a URL-safe ID (supports Japanese)
        const id = text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff-]/g, "")
            .replace(/^-+|-+$/g, "");

        headings.push({ level, text, id });
    }

    return headings;
}

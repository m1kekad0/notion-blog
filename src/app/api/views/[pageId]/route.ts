import { notion, incrementViews } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ pageId: string }> }
) {
    const { pageId } = await params;
    try {
        // Use pages.retrieve directly to avoid calling getPosts() (full Search API round-trip) just for the view count.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const page = await notion.pages.retrieve({ page_id: pageId }) as any;
        const currentViews: number = page.properties?.views?.number ?? 0;
        await incrementViews(pageId, currentViews);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}

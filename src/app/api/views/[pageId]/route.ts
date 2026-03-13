import { getPostById, incrementViews } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ pageId: string }> }
) {
    const { pageId } = await params;
    const post = await getPostById(pageId);
    if (!post) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await incrementViews(pageId, post.views);
    return NextResponse.json({ ok: true });
}

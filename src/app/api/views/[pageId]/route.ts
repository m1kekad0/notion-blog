import { notion, incrementViews } from "@/lib/notion";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

/**
 * KV のキープレフィックス。
 * NEXT_INC_CACHE_KV は ISR キャッシュ用に "incremental-cache/" プレフィックスを使用するため、
 * "view:" プレフィックスと衝突しない。
 */
const KV_PREFIX = "view:";

/**
 * Cloudflare KV 名前空間を取得する。
 * ローカル開発環境（next dev）では Cloudflare Workers ランタイムが存在しないため null を返す。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getKV(): Promise<any | null> {
    try {
        const ctx = await getCloudflareContext({ async: true });
        return ctx.env.NEXT_INC_CACHE_KV ?? null;
    } catch {
        // ローカル開発環境では Cloudflare コンテキストが存在しないため正常
        return null;
    }
}

/**
 * 閲覧数を取得する。
 * KV が利用可能な場合は KV から取得し、そうでない場合は Notion から取得する。
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ pageId: string }> }
) {
    const { pageId } = await params;
    const kv = await getKV();

    if (kv) {
        // KV をソース・オブ・トゥルースとして参照
        const stored = await kv.get(`${KV_PREFIX}${pageId}`);
        const views = stored ? parseInt(stored, 10) : 0;
        return NextResponse.json({ views });
    }

    // フォールバック: Notion から直接取得（ローカル開発環境用）
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const page = await notion.pages.retrieve({ page_id: pageId }) as any;
        const views: number = page.properties?.views?.number ?? 0;
        return NextResponse.json({ views });
    } catch {
        return NextResponse.json({ views: 0 });
    }
}

/**
 * 閲覧数をインクリメントする。
 * KV が利用可能な場合は KV に書き込み、そうでない場合は Notion を直接更新する。
 * レスポンスにインクリメント後の閲覧数を含める（ViewTracker での表示更新に使用）。
 */
export async function POST(
    _req: Request,
    { params }: { params: Promise<{ pageId: string }> }
) {
    const { pageId } = await params;
    const kv = await getKV();

    if (kv) {
        // KV への Read-Modify-Write（ベストエフォート。競合時は誤差を許容）
        const stored = await kv.get(`${KV_PREFIX}${pageId}`);
        const newCount = (stored ? parseInt(stored, 10) : 0) + 1;
        await kv.put(`${KV_PREFIX}${pageId}`, String(newCount));
        return NextResponse.json({ ok: true, views: newCount });
    }

    // フォールバック: Notion を直接更新（ローカル開発環境用）
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const page = await notion.pages.retrieve({ page_id: pageId }) as any;
        const currentViews: number = page.properties?.views?.number ?? 0;
        await incrementViews(pageId, currentViews);
        return NextResponse.json({ ok: true, views: currentViews + 1 });
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}

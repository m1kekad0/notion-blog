import { notion, incrementViews, setViews } from "@/lib/notion";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

/**
 * KV のキープレフィックス定義。
 *
 * - `KV_PREFIX`    : 閲覧数カウンター（例: `view:<pageId>`）
 * - `DEDUP_PREFIX` : IP 重複排除レコード（例: `dedup:<hashedIp>:<pageId>`）
 *
 * 閲覧数は BLOG_VIEWS_KV（ISR キャッシュ用の NEXT_INC_CACHE_KV とは別名前空間）に保存する。
 */
const KV_PREFIX = "view:";

/** IP 重複排除レコードのキープレフィックス */
const DEDUP_PREFIX = "dedup:";

/** 同一 IP からの重複カウントを防ぐ保持期間（秒）。24 時間 */
const DEDUP_TTL_SECONDS = 86400;

/**
 * Cloudflare Workers の実行コンテキストを取得する。
 *
 * ローカル開発環境（next dev）では Workers ランタイムが存在しないため null を返す。
 * 返り値には KV バインディング（env）と waitUntil 用の ExecutionContext（ctx）が含まれる。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCloudflareCtx(): Promise<{ kv: any; execCtx: any } | null> {
    try {
        const ctx = await getCloudflareContext({ async: true });
        const kv = ctx.env.BLOG_VIEWS_KV ?? null;
        if (!kv) return null;
        return { kv, execCtx: ctx.ctx };
    } catch {
        // ローカル開発環境では Cloudflare コンテキストが存在しないため正常
        return null;
    }
}

/**
 * リクエスト元 IP アドレスを SHA-256 でハッシュする。
 *
 * IP をそのまま保存しないことでプライバシーに配慮する。
 * ハッシュは先頭 16 文字に切り詰めて KV キーの長さを抑える。
 *
 * @param ip - ハッシュ対象の IP アドレス文字列
 * @returns 16 文字の 16 進数ハッシュ文字列
 */
async function hashIp(ip: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
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
    const cf = await getCloudflareCtx();

    if (cf) {
        // KV をソース・オブ・トゥルースとして参照
        const stored = await cf.kv.get(`${KV_PREFIX}${pageId}`);
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
 *
 * KV 環境では以下の処理を行う:
 * 1. IP アドレスを SHA-256 ハッシュして重複排除キーを生成する
 * 2. 同一 IP が 24 時間以内にカウント済みの場合はスキップする
 * 3. 新規アクセスの場合は KV のカウンターをインクリメントし、重複排除キーを保存する
 * 4. `ctx.waitUntil()` で Notion の閲覧数を非同期ライトスルーする（KV と Notion の同期）
 *
 * レスポンスにインクリメント後の閲覧数を含める（ViewTracker での表示更新に使用）。
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ pageId: string }> }
) {
    const { pageId } = await params;
    const cf = await getCloudflareCtx();

    if (cf) {
        // IP アドレスを取得してハッシュする（CF-Connecting-IP は Cloudflare が付与する実 IP ヘッダー）
        const rawIp = req.headers.get("CF-Connecting-IP") ?? "unknown";
        const hashedIp = await hashIp(rawIp);
        const dedupKey = `${DEDUP_PREFIX}${hashedIp}:${pageId}`;

        // 同一 IP が 24 時間以内にアクセス済みかチェック
        const alreadyCounted = await cf.kv.get(dedupKey);
        if (alreadyCounted) {
            // 重複アクセス: カウントせず現在値を返す
            const stored = await cf.kv.get(`${KV_PREFIX}${pageId}`);
            const views = stored ? parseInt(stored, 10) : 0;
            return NextResponse.json({ ok: true, views, deduplicated: true });
        }

        // 新規アクセス: KV カウンターをインクリメントし重複排除キーを保存する
        const stored = await cf.kv.get(`${KV_PREFIX}${pageId}`);
        const newCount = (stored ? parseInt(stored, 10) : 0) + 1;
        await Promise.all([
            cf.kv.put(`${KV_PREFIX}${pageId}`, String(newCount)),
            cf.kv.put(dedupKey, "1", { expirationTtl: DEDUP_TTL_SECONDS }),
        ]);

        // Notion へのライトスルー（waitUntil でバックグラウンド実行し、レスポンスをブロックしない）
        cf.execCtx.waitUntil(setViews(pageId, newCount));

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

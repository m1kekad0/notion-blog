import { notion } from "@/lib/notion";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

/** キャッシュせず毎リクエストで疎通確認する */
export const dynamic = "force-dynamic";

/**
 * ヘルスチェックエンドポイント。
 * Notion API と Cloudflare KV の疎通状況を返す。
 * 全サービス正常: HTTP 200、いずれか異常: HTTP 503。
 *
 * レスポンス例:
 * {
 *   "status": "ok" | "degraded",
 *   "checks": { "notion": "ok" | "error", "kv": "ok" | "error" | "not-available" },
 *   "timestamp": "2026-03-15T00:00:00.000Z"
 * }
 */
export async function GET() {
    const checks: Record<string, string> = {};

    // Notion API の疎通確認（軽量な users.me を使用）
    try {
        await notion.users.me({});
        checks.notion = "ok";
    } catch {
        checks.notion = "error";
    }

    // Cloudflare KV の疎通確認
    // ローカル開発環境（next dev）では Cloudflare コンテキストが存在しないため
    // エラーをキャッチして "not-available" を返す
    try {
        const ctx = await getCloudflareContext({ async: true });
        const kv = ctx.env.NEXT_INC_CACHE_KV;

        if (kv) {
            const testKey = "__health_check__";
            await kv.put(testKey, "1", { expirationTtl: 60 });
            const val = await kv.get(testKey);
            await kv.delete(testKey);
            checks.kv = val === "1" ? "ok" : "error";
        } else {
            checks.kv = "not-configured";
        }
    } catch {
        // ローカル開発環境では Cloudflare Workers ランタイムが存在しないため正常
        checks.kv = "not-available";
    }

    const allOk = Object.values(checks).every((v) => v === "ok");

    return NextResponse.json(
        {
            status: allOk ? "ok" : "degraded",
            checks,
            timestamp: new Date().toISOString(),
        },
        { status: allOk ? 200 : 503 }
    );
}

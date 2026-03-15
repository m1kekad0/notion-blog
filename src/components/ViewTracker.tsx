"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * 閲覧数トラッカー兼表示コンポーネント。
 * マウント時に POST /api/views/[pageId] を呼び出してカウントをインクリメントし、
 * レスポンスで返される最新値を表示に反映する。
 * KV が利用可能な場合は KV ベースのカウント、そうでない場合は Notion ベースのカウントが返る。
 */
export default function ViewTracker({
    pageId,
    initialViews,
}: {
    pageId: string;
    /** ISR キャッシュから取得した初期閲覧数。KV からの最新値で上書きされる。 */
    initialViews: number;
}) {
    const [views, setViews] = useState(initialViews);

    useEffect(() => {
        fetch(`/api/views/${pageId}`, { method: "POST" })
            .then((res) => res.json())
            .then((data: unknown) => {
                // POST レスポンスに含まれる最新カウント（KV ベース）で表示を更新
                if (data !== null && typeof data === "object" && "views" in data && typeof (data as { views: unknown }).views === "number") {
                    setViews((data as { views: number }).views);
                }
            })
            .catch(() => {
                // ネットワークエラー時は初期値のまま表示を維持
            });
    }, [pageId]);

    return (
        <div className="flex items-center gap-1">
            <Eye size={16} />
            <span>{views} views</span>
        </div>
    );
}

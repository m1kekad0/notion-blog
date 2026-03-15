"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

/**
 * Giscus を使用したコメントセクションコンポーネント。
 *
 * GitHub Discussions をバックエンドとして使用する。
 * リポジトリ・カテゴリなどの設定は環境変数（`NEXT_PUBLIC_GISCUS_*`）から取得する。
 * 現在のカラーテーマに合わせて Giscus のテーマを動的に切り替える。
 * テーマが "system" の場合は `preferred_color_scheme` を指定し、ブラウザ設定に追従する。
 */
export default function Comments() {
    const { theme } = useTheme();
    return (
        <div className="giscus-wrapper">
            <Giscus
                id="comments"
                repo={process.env.NEXT_PUBLIC_GISCUS_REPO as any}
                repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID as any}
                category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY as any}
                categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID as any}
                mapping="pathname"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme={theme === "system" ? "preferred_color_scheme" : theme}
                lang="ja"
                loading="lazy"
            />
        </div>
    );
}

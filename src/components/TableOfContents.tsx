"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 目次の各見出しを表す型。
 * `extractHeadings` 関数（`lib/toc.ts`）が生成し、`TableOfContents` コンポーネントに渡す。
 */
export type Heading = {
    /** 見出しレベル（2: h2、3: h3） */
    level: number;
    /** 表示テキスト（太字・斜体マーカー除去済み） */
    text: string;
    /** アンカー ID（URL セーフ・日本語対応） */
    id: string;
};

/**
 * 記事のサイドバーまたはインラインに表示する目次コンポーネント。
 *
 * IntersectionObserver を使用して現在のスクロール位置に対応する見出しをハイライトする。
 * 見出しが空の場合は何も描画しない。
 *
 * @param headings - 表示する見出しの配列
 */
export default function TableOfContents({ headings }: { headings: Heading[] }) {
    /** 現在ビューポートに表示されている見出しの ID */
    const [activeId, setActiveId] = useState<string>("");
    /** IntersectionObserver インスタンスへの参照（クリーンアップ用） */
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (headings.length === 0) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                // ビューポートに表示されている見出しのうち、最も上にあるものをアクティブにする
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            // 下部 70% を除外することで、スクロール位置に対して先読みせずに追従する
            { rootMargin: "0px 0px -70% 0px", threshold: 0 }
        );

        // 各見出し要素を監視対象に登録
        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observerRef.current?.observe(el);
        });

        // アンマウント時にオブザーバーを解除してメモリリークを防ぐ
        return () => observerRef.current?.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav aria-label="目次">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                目次
            </p>
            <ol className="space-y-1.5 text-sm">
                {headings.map(({ id, text, level }) => (
                    <li key={id} style={{ paddingLeft: level === 3 ? "0.75rem" : undefined }}>
                        <a
                            href={`#${id}`}
                            onClick={(e) => {
                                // デフォルトのジャンプ挙動をキャンセルし、スムーズスクロールで遷移する
                                e.preventDefault();
                                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={`block leading-snug transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                                activeId === id
                                    ? "text-blue-600 dark:text-blue-400 font-medium"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            {text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}

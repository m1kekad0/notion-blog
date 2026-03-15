"use client";

import { useRef, useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * コードブロックをコピーボタン付きで表示するクライアントコンポーネント。
 *
 * `<pre>` 要素をラップし、ホバー時にコピーボタンを表示する。
 * コピー完了後 2 秒間はチェックマークアイコンに切り替わる。
 *
 * @param children - `<pre>` 内に表示するコードコンテンツ（通常は `<code>` 要素）
 */
export default function CodeBlock({ children }: { children: React.ReactNode }) {
    /** `<pre>` 要素への参照。テキスト内容をクリップボードにコピーするために使用する */
    const preRef = useRef<HTMLPreElement>(null);
    /** コピー完了状態。`true` の間はチェックマークアイコンを表示する */
    const [copied, setCopied] = useState(false);

    /**
     * コードブロックのテキスト内容をクリップボードにコピーする。
     * コピー後 2 秒でアイコンをコピーアイコンに戻す。
     */
    const handleCopy = async () => {
        const text = preRef.current?.textContent ?? "";
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <pre ref={preRef}>{children}</pre>
            <button
                onClick={handleCopy}
                aria-label="コードをコピー"
                className="absolute top-2 right-2 p-1.5 rounded bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600 hover:text-white"
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
        </div>
    );
}

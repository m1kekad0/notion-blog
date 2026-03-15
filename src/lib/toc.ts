import type { Heading } from "@/components/TableOfContents";

/**
 * Markdown 文字列から見出し（h2, h3）を抽出する。
 *
 * 目次コンポーネント（TableOfContents）に渡すデータを生成するために使用する。
 * `##` および `###` のみを対象とし、h1 はページタイトルのため除外する。
 *
 * @param markdown - 解析対象の Markdown 文字列
 * @returns 見出しレベル・表示テキスト・アンカー ID の配列
 */
export function extractHeadings(markdown: string): Heading[] {
    const headings: Heading[] = [];

    for (const line of markdown.split("\n")) {
        const match = line.match(/^(#{2,3})\s+(.+)/);
        if (!match) continue;

        const level = match[1].length;
        // 太字・斜体マーカー（*）を除去して表示用テキストを生成
        const text = match[2].replace(/\*+/g, "").trim();
        // URL セーフな ID を生成（日本語・英数字・ハイフンを許容）
        const id = text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff-]/g, "")
            .replace(/^-+|-+$/g, "");

        headings.push({ level, text, id });
    }

    return headings;
}

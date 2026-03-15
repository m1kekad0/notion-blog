import Link from "next/link";

/**
 * タグ名をリンクとして表示するコンポーネント。
 *
 * クリックするとタグ別記事一覧ページ（`/tags/[tag]`）へ遷移する。
 * タグ名は URL エンコードして href に埋め込む。
 *
 * @param tag - 表示・リンク先に使用するタグ名
 */
export default function TagLink({ tag }: { tag: string }) {
    return (
        <Link
            href={`/tags/${encodeURIComponent(tag)}`}
            className="bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-0.5 rounded text-xs transition-colors"
        >
            {tag}
        </Link>
    );
}

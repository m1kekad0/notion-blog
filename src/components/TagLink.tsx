import Link from "next/link";

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

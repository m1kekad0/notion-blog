import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-4xl font-extrabold mb-4">404 - Not Found</h2>
            <p className="text-xl text-gray-500 mb-8">お探しの記事やページは見つかりませんでした。</p>
            <Link
                href="/"
                className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
                ホームに戻る
            </Link>
        </div>
    )
}

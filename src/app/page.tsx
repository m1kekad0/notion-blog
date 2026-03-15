import Link from "next/link";
import { getPosts } from "@/lib/notion";
import TagLink from "@/components/TagLink";

/** ISR のキャッシュ有効期間（秒）。1 時間ごとに再生成する */
export const revalidate = 3600;

/** 1 ページあたりの表示件数 */
const PAGE_SIZE = 10;

/**
 * ブログのホームページ（記事一覧）コンポーネント。
 *
 * ページネーション付きで全記事を一覧表示する。
 * `?page=N` クエリパラメータでページを切り替える。
 * 記事が 0 件の場合はエラーメッセージを表示する。
 *
 * @param searchParams - URL クエリパラメータ（`page` の取得に使用）
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const allPosts = await getPosts();

  if (allPosts.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold mb-4">No posts found</h1>
        <p className="text-gray-500">
          Make sure your Notion database is connected and has pages.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE);
  // currentPage が総ページ数を超えている場合は最終ページに補正する
  const safePage = Math.min(currentPage, totalPages);
  const posts = allPosts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          引きこもりエンジニアの徒然ログ
        </h1>
        <p className="text-xl text-gray-500">
          完全フルリモート開発故に引きこもり
        </p>
      </header>

      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.id} className="border-b pb-8">
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <time dateTime={post.date}>
                {post.date ? new Date(post.date).toLocaleDateString() : "No Date"}
              </time>
              {post.tags.map(tag => (
                <TagLink key={tag} tag={tag} />
              ))}
            </div>

            <Link href={`/blog/${post.slug}`} className="group block">
              <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                {post.excerpt || "No excerpt available."}
              </p>

              <div className="text-blue-500 text-sm font-medium group-hover:underline">
                Read more →
              </div>
            </Link>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex justify-center items-center gap-2 mt-12" aria-label="ページネーション">
          {safePage > 1 && (
            <Link
              href={safePage === 2 ? "/" : `/?page=${safePage - 1}`}
              className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              ← 前へ
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={p === 1 ? "/" : `/?page=${p}`}
              className={`px-4 py-2 rounded border text-sm transition-colors ${
                p === safePage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {p}
            </Link>
          ))}

          {safePage < totalPages && (
            <Link
              href={`/?page=${safePage + 1}`}
              className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              次へ →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

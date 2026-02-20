import Link from "next/link";
import { getPosts } from "@/lib/notion";

export const revalidate = 3600; // 1 hour


export default async function Home() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold mb-4">No posts found</h1>
        <p className="text-gray-500">
          Make sure your Notion database is connected and has pages.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          引きこもりエンジニアの徒然ログ
        </h1>
        <p className="text-xl text-gray-500">
          在宅エンジニアとして仕事はしています
        </p>
      </header>

      <div className="space-y-8">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="block group">
            <article className="border-b pb-8 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                <time dateTime={post.date}>
                  {post.date ? new Date(post.date).toLocaleDateString() : "No Date"}
                </time>
                {post.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                {post.excerpt || "No excerpt available."}
              </p>

              <div className="text-blue-500 text-sm font-medium group-hover:underline">
                Read more →
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

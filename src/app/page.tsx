import Link from "next/link";
import { getPosts } from "@/lib/notion";

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
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Notion Blog
        </h1>
        <p className="text-xl text-gray-500">
          Powered by Next.js & Notion API
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="group block">
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card h-full flex flex-col">
              {/* Image Placeholder (Add actual cover image support later) */}
              <div className="h-48 bg-gray-200 dark:bg-gray-800 w-full object-cover"></div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {post.tags[0] || "Blog"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {post.date ? new Date(post.date).toLocaleDateString() : "No Date"}
                  </span>
                </div>

                <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                  {post.excerpt || "No excerpt available."}
                </p>

                <div className="text-blue-500 text-sm font-medium group-hover:underline mt-auto">
                  Read more →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

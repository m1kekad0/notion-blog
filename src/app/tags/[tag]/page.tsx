import Link from "next/link";
import { getPosts } from "@/lib/notion";
import { Eye } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TagLink from "@/components/TagLink";

export const revalidate = 3600;

export async function generateStaticParams() {
    const posts = await getPosts();
    const tags = new Set(posts.flatMap((post) => post.tags));
    return Array.from(tags).map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
    const { tag } = await params;
    const decoded = decodeURIComponent(tag);
    return {
        title: `${decoded} の記事一覧`,
        description: `「${decoded}」タグの記事一覧`,
        openGraph: {
            title: `${decoded} の記事一覧`,
            description: `「${decoded}」タグの記事一覧`,
        },
    };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    const decoded = decodeURIComponent(tag);
    const allPosts = await getPosts();
    const posts = allPosts.filter((post) => post.tags.includes(decoded));

    if (posts.length === 0) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="mb-8">
                <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    ← Back to Home
                </Link>
            </div>

            <header className="mb-12">
                <p className="text-sm text-gray-500 mb-1">タグ</p>
                <h1 className="text-3xl font-bold">{decoded}</h1>
                <p className="text-gray-500 mt-2">{posts.length} 件の記事</p>
            </header>

            <div className="space-y-8">
                {posts.map((post) => (
                    <article key={post.id} className="border-b pb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                            <time dateTime={post.date}>
                                {post.date ? new Date(post.date).toLocaleDateString() : "No Date"}
                            </time>
                            <div className="flex items-center gap-1">
                                <Eye size={14} />
                                <span>{post.views} views</span>
                            </div>
                            {post.tags.map((t) => (
                                <TagLink key={t} tag={t} />
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
        </div>
    );
}

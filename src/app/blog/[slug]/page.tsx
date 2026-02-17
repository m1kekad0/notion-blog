import { getPostBySlug, getPostContent } from "@/lib/notion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Comments from "@/components/Comments";
import Link from "next/link";

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">Post not found</h1>
                <p className="text-gray-500">
                    Could not find a post with slug: <code className="bg-gray-100 p-1 rounded">{slug}</code>
                </p>
            </div>
        );
    }

    const content = await getPostContent(post.id);

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="mb-8">
                <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    ← Back to Home
                </Link>
            </div>

            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <span>{post.date}</span>
                    <div className="flex gap-2">
                        {post.tags.map((tag: string) => (
                            <span key={tag} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </header>

            <article className="prose dark:prose-invert max-w-none prose-img:rounded-lg">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                        a: ({ node, href, children, ...props }) => {
                            if (children === "bookmark" && href) {
                                return (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors my-4 not-prose"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="text-blue-500">🔗</span>
                                            <span className="font-medium truncate underline text-blue-600 dark:text-blue-400">
                                                {href}
                                            </span>
                                        </span>
                                        <span className="block text-xs text-gray-400 mt-1 truncate">
                                            Bookmark
                                        </span>
                                    </a>
                                );
                            }
                            return (
                                <a href={href} className="text-blue-600 hover:underline" {...props}>
                                    {children}
                                </a>
                            );
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </article>

            <div className="mt-16 pt-8 border-t">
                <h3 className="text-xl font-bold mb-4">Comments</h3>
                <Comments />
            </div>
        </div>
    );
}

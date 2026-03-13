import { getPostBySlug, getPostContent, getPosts } from "@/lib/notion";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Comments from "@/components/Comments";
import ViewTracker from "@/components/ViewTracker";
import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";
import type { Metadata } from "next";
import TagLink from "@/components/TagLink";
import TableOfContents from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/toc";

export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return { title: "Not Found" };
    }

    const description = post.excerpt || undefined;

    return {
        title: post.title,
        description,
        openGraph: {
            type: "article",
            title: post.title,
            description,
            publishedTime: post.date,
            tags: post.tags,
        },
        twitter: {
            card: "summary",
            title: post.title,
            description,
        },
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const content = await getPostContent(post.id);
    const headings = extractHeadings(content);

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl xl:max-w-5xl">
            <ViewTracker pageId={post.id} />

            <div className="mb-8">
                <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    ← Back to Home
                </Link>
            </div>

            <div className="xl:flex xl:gap-12">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                        <div className="flex items-center gap-4 text-gray-500 text-sm">
                            <time dateTime={post.date}>
                                {post.date ? new Date(post.date).toLocaleDateString("ja-JP") : ""}
                            </time>
                            <div className="flex items-center gap-1">
                                <Eye size={16} />
                                <span>{post.views} views</span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {post.tags.map((tag: string) => (
                                    <TagLink key={tag} tag={tag} />
                                ))}
                            </div>
                        </div>
                    </header>

                    {/* TOC inline (non-xl screens) */}
                    {headings.length > 0 && (
                        <div className="xl:hidden mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            <TableOfContents headings={headings} />
                        </div>
                    )}

            <article className="prose dark:prose-invert max-w-none prose-img:rounded-lg">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                        h2: ({ children }) => {
                            const text = String(children).replace(/\*+/g, "").trim();
                            const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff-]/g, "").replace(/^-+|-+$/g, "");
                            return <h2 id={id}>{children}</h2>;
                        },
                        h3: ({ children }) => {
                            const text = String(children).replace(/\*+/g, "").trim();
                            const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff-]/g, "").replace(/^-+|-+$/g, "");
                            return <h3 id={id}>{children}</h3>;
                        },
                        img: ({ src, alt }) => {
                            const imgSrc = typeof src === "string" ? src : "";
                            if (!imgSrc) return null;
                            return (
                                <span className="block my-4">
                                    <Image
                                        src={imgSrc}
                                        alt={alt || ""}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        style={{ width: "100%", height: "auto" }}
                                        className="rounded-lg"
                                    />
                                </span>
                            );
                        },
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

                {/* TOC sidebar (xl screens) */}
                {headings.length > 0 && (
                    <aside className="hidden xl:block w-56 shrink-0">
                        <div className="sticky top-24 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            <TableOfContents headings={headings} />
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

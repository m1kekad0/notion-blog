"use client";

import { useEffect, useRef, useState } from "react";

export type Heading = {
    level: number;
    text: string;
    id: string;
};

export default function TableOfContents({ headings }: { headings: Heading[] }) {
    const [activeId, setActiveId] = useState<string>("");
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (headings.length === 0) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                // Find the topmost visible heading
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: "0px 0px -70% 0px", threshold: 0 }
        );

        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observerRef.current?.observe(el);
        });

        return () => observerRef.current?.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav aria-label="目次">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                目次
            </p>
            <ol className="space-y-1.5 text-sm">
                {headings.map(({ id, text, level }) => (
                    <li key={id} style={{ paddingLeft: level === 3 ? "0.75rem" : undefined }}>
                        <a
                            href={`#${id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={`block leading-snug transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                                activeId === id
                                    ? "text-blue-600 dark:text-blue-400 font-medium"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            {text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}

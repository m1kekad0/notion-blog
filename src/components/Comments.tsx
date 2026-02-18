"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

export default function Comments() {
    const { theme } = useTheme();
    return (
        <div className="giscus-wrapper">
            <Giscus
                id="comments"
                repo={process.env.NEXT_PUBLIC_GISCUS_REPO as any}
                repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID as any}
                category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY as any}
                categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID as any}
                mapping="pathname"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme={theme === "system" ? "preferred_color_scheme" : theme}
                lang="ja"
                loading="lazy"
            />
        </div>
    );
}

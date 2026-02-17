"use client";

import Giscus from "@giscus/react";

export default function Comments() {
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
                theme="preferred_color_scheme"
                lang="ja"
                loading="lazy"
            />
        </div>
    );
}

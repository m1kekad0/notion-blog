"use client";
import { useEffect } from "react";

export default function ViewTracker({ pageId }: { pageId: string }) {
    useEffect(() => {
        fetch(`/api/views/${pageId}`, { method: "POST" });
    }, [pageId]);
    return null;
}

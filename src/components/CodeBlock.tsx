"use client";

import { useRef, useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({ children }: { children: React.ReactNode }) {
    const preRef = useRef<HTMLPreElement>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const text = preRef.current?.textContent ?? "";
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <pre ref={preRef}>{children}</pre>
            <button
                onClick={handleCopy}
                aria-label="コードをコピー"
                className="absolute top-2 right-2 p-1.5 rounded bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600 hover:text-white"
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
        </div>
    );
}

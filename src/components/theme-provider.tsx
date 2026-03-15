"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * アプリケーション全体にダーク/ライトテーマを提供するコンテキストプロバイダー。
 *
 * `next-themes` の `ThemeProvider` を薄くラップしたもの。
 * すべての props をそのまま `NextThemesProvider` に転送する。
 * `app/layout.tsx` でルートに配置して使用する。
 *
 * @param children - テーマコンテキストを適用する子要素
 * @param props - `NextThemesProvider` に渡す追加 props（`attribute`, `defaultTheme` など）
 */
export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

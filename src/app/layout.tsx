import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

/** Inter フォント（Latin サブセット）の設定 */
const inter = Inter({ subsets: ["latin"] });

/** サイト URL（環境変数未設定時はローカル開発用 URL にフォールバック） */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";
/** サイト名 */
const siteName = "引きこもりエンジニアの徒然ログ";
/** サイト概要 */
const siteDescription = "引きこもりエンジニアの日常・技術・雑記ブログ。Notion と Next.js で動いています。";

/**
 * サイト共通のメタデータ設定。
 * OGP・Twitter Card・RSS フィードのリンクを含む。
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
  },
  alternates: {
    types: {
      "application/rss+xml": `${siteUrl}/feed.xml`,
    },
  },
};

/**
 * アプリケーション全体のルートレイアウトコンポーネント。
 *
 * テーマプロバイダー、ヘッダー、メインコンテンツ領域、フッターを提供する。
 * すべてのページはこのレイアウトの `children` としてレンダリングされる。
 *
 * @param children - 各ページのコンテンツ
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <header className="border-b dark:border-gray-800 sticky top-0 bg-background/80 backdrop-blur-md z-10 transition-colors duration-300">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-3xl">
                <div className="flex items-center gap-4">
                  <div className="font-bold text-lg hover:text-blue-500 transition-colors">
                    <Link href="/">引きこもりエンジニアの徒然ログ</Link>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:inline-block leading-tight max-w-[300px]">
                    ブログの内容は事実に基づいて生成AIが出力した内容を掲載しており、一部表現が過剰なものもあります。ご理解ください🙏
                  </span>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 w-full">
              {children}
            </main>
            <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-800 mt-auto transition-colors duration-300">
              © {new Date().getFullYear()} 引きこもりエンジニアの徒然ログ. All rights reserved.
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

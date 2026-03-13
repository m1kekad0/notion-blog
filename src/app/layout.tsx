import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";
const siteName = "引きこもりエンジニアの徒然ログ";
const siteDescription = "引きこもりエンジニアの日常・技術・雑記ブログ。Notion と Next.js で動いています。";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
                    <a href="/">引きこもりエンジニアの徒然ログ</a>
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

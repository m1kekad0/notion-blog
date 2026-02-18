import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notion Blog",
  description: "A blog powered by Notion and Next.js",
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
                <div className="font-bold text-lg hover:text-blue-500 transition-colors">
                  <a href="/">Notion Blog</a>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 w-full">
              {children}
            </main>
            <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-800 mt-auto transition-colors duration-300">
              © {new Date().getFullYear()} Notion Blog. All rights reserved.
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

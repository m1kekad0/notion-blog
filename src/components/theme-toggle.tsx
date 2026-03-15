"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * ライト / ダーク / システムの 3 段階でテーマを切り替えるトグルボタン。
 *
 * クリックするたびに light → dark → system → light の順でテーマを循環させる。
 * 現在のテーマに対応するアイコン（太陽・月・モニター）を表示する。
 *
 * ハイドレーション不一致を防ぐため、マウント前は何も描画しない。
 */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    /** サーバーサイドとクライアントサイドの不一致を防ぐためのマウント確認フラグ */
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // マウント前はハイドレーション不一致を避けるため何も描画しない
    if (!mounted) {
        return null;
    }

    /**
     * テーマを light → dark → system の順で循環させる。
     */
    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
        } else if (theme === "dark") {
            setTheme("system");
        } else {
            setTheme("light");
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
            title={`Current theme: ${theme}`}
        >
            {theme === "light" && <Sun className="h-5 w-5 text-yellow-500" />}
            {theme === "dark" && <Moon className="h-5 w-5 text-gray-700 dark:text-gray-100" />}
            {theme === "system" && <Monitor className="h-5 w-5 text-gray-500" />}
        </button>
    );
}

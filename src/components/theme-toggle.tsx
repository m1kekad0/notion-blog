"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

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

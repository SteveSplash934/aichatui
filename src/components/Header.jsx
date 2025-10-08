import { Sun, Moon, MessageSquare } from "lucide-react";
import { useTheme } from "../hook/useTheme";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isChatPage = location.pathname === "/chat";

    return (
        <header className="flex justify-between items-center px-6 py-3  transition-colors">
            {/* Logo  Home link */}
            <Link to="/welcome" className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-light-accents-info dark:text-dark-accents-info" />
                <h1 className="font-heading text-lg">LLM Chat UI</h1>
            </Link>

            {/* Theme toggle icon */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-light-button-normal dark:bg-dark-button-normal hover:scale-105 transition-transform"
                aria-label="Toggle Theme"
            >
                {theme === "light" ? (
                    <Moon className="w-5 h-5 text-dark-button-muted" />
                ) : (
                    <Sun className="w-5 h-5 text-light-button-text" />
                )}
            </button>
        </header>
    );
}

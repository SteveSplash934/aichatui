import { Sun, Moon, MessageSquare } from "lucide-react";
import { useTheme } from "../hook/useTheme";
import { useLocation, useNavigate } from "react-router-dom";

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const isChatPage = location.pathname === "/chat";

    const handleLogoClick = () => {
        const sessionToken = localStorage.getItem("agent_session_token");
        if (sessionToken) {
            navigate("/chat");
        } else {
            navigate("/");
        }
    };

    return (
        <header className="flex justify-between items-center px-6 py-3 transition-colors">
            <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 focus:outline-none"
            >
                <MessageSquare className="w-6 h-6 text-light-accents-info dark:text-dark-accents-info" />
                <h1 className="font-heading text-lg">AI CHAT</h1>
            </button>

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

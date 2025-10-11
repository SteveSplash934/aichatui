import { Sun, Moon, MessageSquare, LogOut } from "lucide-react";
import { useTheme } from "../hook/useTheme";
import { useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';


const clearLocalStorageExceptTheme = () => {
    const theme = localStorage.getItem("theme");
    localStorage.clear();
    if (theme) {
        localStorage.setItem("theme", theme);
    }
};

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const isChatPage = location.pathname === "/chat";

    const handleLogoClick = () => {
        const sessionToken = localStorage.getItem("user_chat_session_token");
        if (sessionToken) {
            navigate("/chat");
        } else {
            navigate("/");
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            clearLocalStorageExceptTheme();
            navigate("/");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/api/v1/auth/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Logged out successfully");
            } else {
                toast.error(data?.message || "Logout failed");
            }
        } catch (err) {
            toast.error("Network error during logout");
            console.error("Logout error:", err.message || err);
        }

        clearLocalStorageExceptTheme();
        navigate("/");
    };

    return (
        <header className="flex justify-between items-center px-6 py-3 transition-colors">
            {/* Logo */}
            <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 focus:outline-none"
            >
                <MessageSquare className="w-6 h-6 text-light-accents-info dark:text-dark-accents-info" />
                <h1 className="font-heading text-lg">AI CHAT</h1>
            </button>

            {/* Right-side icons (Theme + Logout) */}
            <div className="flex items-center gap-3">
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

                {/* Logout icon */}
                {isChatPage && (
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full bg-light-button-normal dark:bg-dark-button-normal hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                )}

            </div>
        </header>
    );
}

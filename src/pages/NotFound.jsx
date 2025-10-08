// src/pages/NotFound.jsx
import { useEffect } from "react";
import { useTheme } from "../hook/useTheme";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleBack = () => {
        const session = localStorage.getItem("agent_session_token");
        if (session) {
            navigate("/chat");
        } else {
            navigate("/");
        }
    };

    // optional: if you want to auto-redirect after some time uncomment below
    // useEffect(() => {
    //   const t = setTimeout(handleBack, 8000);
    //   return () => clearTimeout(t);
    // }, []);

    return (
        <div
            className={`flex flex-col items-center justify-center w-full h-full px-4 py-8 transition-colors duration-300 ${theme === "dark" ? "bg-dark-bg text-dark-button-text" : "bg-light-bg text-black"
                }`}
        >
            <div className="text-center max-w-lg">
                <div className="text-6xl md:text-7xl font-heading font-bold mb-3">
                    404
                </div>
                <h2 className="text-xl md:text-2xl font-heading mb-2">Page not found</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-dark-placeholder mb-6">
                    The page you’re looking for doesn’t exist or has been moved. Press Back to return.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={handleBack}
                        aria-label="Go back"
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm md:text-base tracking-wide font-medium transition-transform shadow-md hover:scale-[1.02] active:scale-[0.98]
              ${theme === "dark"
                                ? "bg-dark-button-bg text-dark-button-text hover:bg-dark-surface-stroke"
                                : "bg-dark-button-bg text-light-button-text hover:bg-dark-surface-stroke"
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}

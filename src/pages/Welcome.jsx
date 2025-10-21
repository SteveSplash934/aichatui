import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../hook/useTheme";
import { useState, useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import aiLogo from "../assets/ailogo.json";


export default function Welcome() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [countdown, setCountdown] = useState(6);

    useEffect(() => {
        if (countdown === 0) {
            navigate("/setup");
            return;
        }
        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, navigate]);

    return (
        <div className="h-screen flex items-center justify-center transition-colors duration-300">
            <div className="text-center px-6">
                <div className="w-24 h-24 mx-auto mb-6">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full shadow-lg bg-white/10 backdrop-blur">
                        <Player autoplay loop src={aiLogo} />
                    </div>
                </div>
                <h1 className="font-heading font-semibold text-2xl md:text-3xl leading-tight">
                    Welcome to Dman Shopping Assistant
                </h1>

                <p className="mt-3 text-base md:text-lg font-medium text-light-placeholder dark:text-dark-placeholder">
                    Your all-in-one assistant for buyers, sellers, and dispatchers, making shopping smoother and smarter.
                </p>

                <p className="mt-2 text-sm md:text-base text-light-muted dark:text-dark-muted">
                    Set up your connection and start chatting instantly to streamline your shopping experience.
                </p>

                {/* CTA */}
                <div className="mt-6">
                    {/* CTA Button */}
                    <button
                        onClick={() => navigate("/setup")}
                        className={`
                            inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-full
                            text-sm md:text-base tracking-wide font-medium transition shadow-md
                            hover:scale-[1.02] active:scale-[0.98]
                            ${theme === "dark"
                                ? "bg-dark-button-bg text-dark-button-text hover:bg-dark-button-muted hover:text-light-button-text"
                                : "bg-dark-button-bg text-light-button-text hover:bg-dark-button-muted"}
                            `}
                    >
                        Let's get started
                        <ArrowRight className="w-4 h-4" />
                    </button>

                </div>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>

            </div>
        </div>
    );
}

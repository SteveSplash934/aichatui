import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../hook/useTheme";

export default function Welcome() {
    const navigate = useNavigate();
    const { theme } = useTheme();


    return (
        <div className="h-screen flex items-center justify-center transition-colors duration-300">
            <div className="text-center px-6">
                {/* Title */}
                <h1 className="font-heading font-semibold text-2xl md:text-3xl leading-tight">
                    Welcome!
                </h1>

                {/* Subtitle */}
                <p className="mt-3 text-base md:text-lg font-medium text-light-placeholder dark:text-dark-placeholder">
                    Please enter your setup info to continue
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
            </div>
        </div>
    );
}

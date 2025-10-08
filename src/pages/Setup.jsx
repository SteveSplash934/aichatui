import { useState } from "react";
import { useTheme } from "../hook/useTheme";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Setup() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userId: "",
        agentUrl: "",
        authToken: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
    };

    const isFormValid =
        formData.userId.trim() &&
        formData.agentUrl.trim() &&
        formData.authToken.trim();

    return (
        <div className="flex flex-col items-center justify-center w-full h-full px-4 transition-colors duration-300">
            {/* Back Button - nicely above the title */}
            <div className="w-full max-w-[350px] mb-4">
                <button
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    className={`inline-flex items-center gap-1 py-1.5 rounded-full text-sm font-medium transition
                    ${theme === "dark"
                            ? "text-dark-button-text hover:text-dark-info active:text-dark-info"
                            : "text-black hover:text-light-info active:text-light-info"}
                    `}
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-center mb-2">
                Welcome!
            </h1>
            <p className="text-center text-sm text-gray-600 dark:text-dark-placeholder mb-8">
                Please enter your setup info to continue
            </p>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-[350px] space-y-5 mx-auto"
            >
                {/* User ID */}
                <div>
                    <label htmlFor="userId" className="block text-sm font-medium mb-1">
                        User ID
                    </label>
                    <input
                        type="text"
                        id="userId"
                        name="userId"
                        placeholder="Enter your ID here"
                        value={formData.userId}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition ${theme === "dark"
                            ? "bg-dark-surface-bg text-white placeholder-dark-placeholder border-dark-surface-stroke focus:ring-dark-info"
                            : "bg-white text-black placeholder-light-placeholder border-gray-300 focus:ring-light-info"
                            }`}
                    />
                </div>

                {/* Agent URL */}
                <div>
                    <label htmlFor="agentUrl" className="block text-sm font-medium mb-1">
                        Agent URL
                    </label>
                    <input
                        type="text"
                        id="agentUrl"
                        name="agentUrl"
                        placeholder="Enter your agent url here"
                        value={formData.agentUrl}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition ${theme === "dark"
                            ? "bg-dark-surface-bg text-white placeholder-dark-placeholder border-dark-surface-stroke focus:ring-dark-info"
                            : "bg-white text-black placeholder-light-placeholder border-gray-300 focus:ring-light-info"
                            }`}
                    />
                </div>

                {/* User Auth Token */}
                <div>
                    <label htmlFor="authToken" className="block text-sm font-medium mb-1">
                        User Auth Token
                    </label>
                    <input
                        type="text"
                        id="authToken"
                        name="authToken"
                        placeholder="Enter your user auth token here"
                        value={formData.authToken}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition ${theme === "dark"
                            ? "bg-dark-surface-bg text-white placeholder-dark-placeholder border-dark-surface-stroke focus:ring-dark-info"
                            : "bg-white text-black placeholder-light-placeholder border-gray-300 focus:ring-light-info"
                            }`}
                    />
                </div>

                {/* Continue Button */}
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-2 rounded-full font-semibold transition ${isFormValid
                        ? theme === "dark"
                            ? "bg-dark-button-bg text-dark-button-text hover:bg-dark-surface-stroke"
                            : "bg-dark-button-bg text-light-button-text hover:bg-dark-surface-stroke"
                        : "bg-dark-button-muted text-dark-placeholder cursor-not-allowed"
                        }`}
                >
                    Continue
                </button>
            </form>
        </div>
    );
}

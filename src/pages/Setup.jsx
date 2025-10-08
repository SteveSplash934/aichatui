import { useState } from "react";
import { useTheme } from "../hook/useTheme";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function Setup() {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
        agentUrl: "",
        authToken: "",
    });

    const [alert, setAlert] = useState({ type: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert({ type: "", message: "" });
        setIsSubmitting(true);

        try {
            const res = await fetch(`${formData.agentUrl}/connect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: formData.userId,
                    auth_token: formData.authToken,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Failed to connect to agent.");
            }

            // Save to localStorage
            localStorage.setItem("user_id", formData.userId);
            localStorage.setItem("user_auth_token", formData.authToken);
            localStorage.setItem("agent_url", formData.agentUrl);

            setAlert({
                type: "success",
                message: `Successfully connected to Agent: ${formData.agentUrl} as ${data.user?.firstname || "User"}`,
            });

            // Navigate to next screen after short delay
            setTimeout(() => navigate("/next"), 1500);
        } catch (error) {
            setAlert({ type: "error", message: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid =
        formData.userId.trim() &&
        formData.agentUrl.trim() &&
        formData.authToken.trim();

    return (
        <div className="flex flex-col items-center justify-center w-full h-full px-4 transition-colors duration-300">
            {/* Back Button */}
            <div className="w-full max-w-[350px] mb-4">
                <button
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    className={`inline-flex items-center gap-1 py-1.5 rounded-full text-sm font-medium transition
                        ${theme === "dark"
                            ? "text-dark-button-text hover:text-dark-info"
                            : "text-black hover:text-light-info"}
                    `}
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-center mb-2">
                Welcome!
            </h1>
            <p className="text-center text-sm text-gray-600 dark:text-dark-placeholder mb-5">
                Please enter your setup info to continue
            </p>

            {/* Alert Box */}
            {alert.message && (
                <div
                    className={`w-full max-w-[350px] mb-4 flex items-center gap-2 text-sm px-3 py-2 rounded-lg
                        ${alert.type === "success"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300"}
                    `}
                >
                    {alert.type === "success" ? (
                        <CheckCircle className="w-4 h-4" />
                    ) : (
                        <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{alert.message}</span>
                </div>
            )}

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
                        className={`w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition 
                            ${theme === "dark"
                                ? "bg-dark-surface-bg text-white placeholder-dark-placeholder border-dark-surface-stroke focus:ring-dark-info"
                                : "bg-white text-black placeholder-light-placeholder border-gray-300 focus:ring-light-info"}
                        `}
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
                        placeholder="Enter your agent URL here"
                        value={formData.agentUrl}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition 
                            ${theme === "dark"
                                ? "bg-dark-surface-bg text-white placeholder-dark-placeholder border-dark-surface-stroke focus:ring-dark-info"
                                : "bg-white text-black placeholder-light-placeholder border-gray-300 focus:ring-light-info"}
                        `}
                    />
                </div>

                {/* Auth Token */}
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
                        className={`w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition 
                            ${theme === "dark"
                                ? "bg-dark-surface-bg text-white placeholder-dark-placeholder border-dark-surface-stroke focus:ring-dark-info"
                                : "bg-white text-black placeholder-light-placeholder border-gray-300 focus:ring-light-info"}
                        `}
                    />
                </div>

                {/* Continue Button */}
                <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-2 rounded-full font-semibold transition
                        ${isFormValid && !isSubmitting
                            ? theme === "dark"
                                ? "bg-dark-button-bg text-dark-button-text hover:bg-dark-surface-stroke"
                                : "bg-dark-button-bg text-light-button-text hover:bg-dark-surface-stroke"
                            : "bg-dark-button-muted text-dark-placeholder cursor-not-allowed"}
                    `}
                >
                    {isSubmitting ? "Connecting..." : "Continue"}
                </button>
            </form>
        </div>
    );
}

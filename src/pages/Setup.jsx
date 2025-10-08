import { useState } from "react";
import { useTheme } from "../hook/useTheme";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function Setup() {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
        agentUrl: "",
        authToken: "",
    });

    const [errors, setErrors] = useState({
        userId: "",
        agentUrl: "",
        authToken: "",
    });

    const uuidv4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const validateField = (name, value) => {
        let error = "";

        if (name === "userId" || name === "authToken") {
            if (!uuidv4Regex.test(value)) {
                error = "Must be a valid UUID v4";
            }
        }

        if (name === "agentUrl") {
            try {
                new URL(value);
            } catch {
                error = "Must be a valid URL";
            }
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Object.values(errors).some((err) => err) ||
            Object.values(formData).some((v) => !v.trim())) {
            return;
        }
        console.log("Form Submitted:", formData);
    };

    const isFieldValid = (name) => formData[name] && !errors[name];

    const isFormValid =
        Object.values(formData).every((v) => v.trim()) &&
        Object.values(errors).every((err) => err === "");

    const inputBase = `w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 pr-10 transition`;

    const lightInput = `bg-white text-black placeholder-light-placeholder border-gray-300 focus:ring-light-info`;
    const darkInput = `bg-dark-surface-bg text-white placeholder-dark-placeholder border-dark-surface-stroke focus:ring-dark-info`;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full px-4 transition-colors duration-300">
            {/* Back Button */}
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
                <div className="relative">
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
                        className={`${inputBase} ${theme === "dark" ? darkInput : lightInput} ${errors.userId && "border-red-500 focus:ring-red-500"}`}
                    />
                    {isFieldValid("userId") && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-9" />
                    )}
                    {errors.userId && (
                        <p className="text-red-500 text-xs mt-1">{errors.userId}</p>
                    )}
                </div>

                {/* Agent URL */}
                <div className="relative">
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
                        className={`${inputBase} ${theme === "dark" ? darkInput : lightInput} ${errors.agentUrl && "border-red-500 focus:ring-red-500"}`}
                    />
                    {isFieldValid("agentUrl") && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-9" />
                    )}
                    {errors.agentUrl && (
                        <p className="text-red-500 text-xs mt-1">{errors.agentUrl}</p>
                    )}
                </div>

                {/* Auth Token */}
                <div className="relative">
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
                        className={`${inputBase} ${theme === "dark" ? darkInput : lightInput} ${errors.authToken && "border-red-500 focus:ring-red-500"}`}
                    />
                    {isFieldValid("authToken") && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-9" />
                    )}
                    {errors.authToken && (
                        <p className="text-red-500 text-xs mt-1">{errors.authToken}</p>
                    )}
                </div>

                {/* Continue Button */}
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-2 rounded-full font-semibold transition
                        ${isFormValid
                            ? theme === "dark"
                                ? "bg-dark-button-bg text-dark-button-text hover:bg-dark-surface-stroke"
                                : "bg-dark-button-bg text-light-button-text hover:bg-dark-surface-stroke"
                            : "bg-dark-button-muted text-dark-placeholder cursor-not-allowed"}
                    `}
                >
                    Continue
                </button>
            </form>
        </div>
    );
}

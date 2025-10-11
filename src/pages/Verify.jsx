import { useState, useRef, useEffect } from "react";
import { useTheme } from "../hook/useTheme";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function EmailVerification() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);

    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
        return match ? match[2] : null;
    };

    useEffect(() => {
        const agentUrl = localStorage.getItem("agent_url");
        const tempToken = localStorage.getItem("temp_token");
        const allowCookie = getCookie("allow_verification");
        const isLoggedIn = localStorage.getItem("is_loggedin") === "true";

        if (isLoggedIn) {
            navigate("/chat", { replace: true });
            return;
        }

        if (!agentUrl || !tempToken || !allowCookie) {
            navigate("/setup", { replace: true });
        }
    }, [navigate]);

    const handleChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }

        if (updated.every((v) => v.length === 1)) {
            handleSubmit(updated.join(""));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (finalOtp = null) => {
        const code = finalOtp || otp.join("");
        const email = localStorage.getItem("email");
        const agentUrl = localStorage.getItem("agent_url");
        const tempToken = localStorage.getItem("temp_token");

        if (code.length !== 6 || !email || !agentUrl || !tempToken) {
            return setAlert({ type: "error", message: "Invalid OTP or session expired." });
        }

        setIsSubmitting(true);
        setAlert(null);

        try {
            const res = await fetch(`${agentUrl}/api/v1/auth/login/confirm-email-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tempToken}`,
                },
                body: JSON.stringify({ email, otp: code }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "OTP verification failed.");
            }

            localStorage.setItem("access_token", data?.data?.access_token);
            localStorage.setItem("is_loggedin", "true");

            navigate("/chat");

        } catch (err) {
            const fallbackMsg = typeof err === "string" ? err : err?.message || "Something went wrong";
            setAlert({ type: "error", message: fallbackMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBase = `w-12 h-12 sm:w-14 sm:h-14 text-xl text-center rounded-lg border transition outline-none`;
    const lightInput = `bg-white text-black border-gray-300 focus:ring-2 focus:ring-light-info`;
    const darkInput = `bg-dark-surface-bg text-white border-dark-surface-stroke focus:ring-2 focus:ring-dark-info`;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full px-4 transition-colors duration-300">
            {alert?.type !== "success" && (
                <div className="w-full max-w-[350px] mb-15">
                    <button
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                        disabled={isSubmitting}
                        className={`inline-flex items-center gap-1 py-1.5 rounded-full text-sm font-medium transition
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                ${theme === "dark"
                                ? "text-dark-button-text hover:text-dark-info active:text-dark-info"
                                : "text-black hover:text-light-info active:text-light-info"
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                </div>
            )}

            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-center mb-2">
                Verify your Email
            </h1>
            <p className="text-center text-sm text-gray-600 dark:text-dark-placeholder mb-6">
                Enter the 6-digit code sent to your email
            </p>

            {alert && (
                <div
                    className={`w-full max-w-[350px] mb-5 px-4 py-2 rounded-lg text-sm font-medium border 
                        ${alert.type === "success"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"}
                    `}
                >
                    {alert.message}
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="w-full max-w-[350px] mx-auto flex flex-col items-center"
            >
                <div className="flex justify-between gap-2 mb-6">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            ref={(el) => (inputsRef.current[idx] = el)}
                            className={`${inputBase} ${theme === "dark" ? darkInput : lightInput}`}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || otp.some((d) => !d)}
                    className={`w-full py-2 rounded-full font-semibold transition
                        ${otp.every((d) => d) && !isSubmitting
                            ? theme === "dark"
                                ? "bg-dark-button-bg text-dark-button-text hover:bg-dark-surface-stroke"
                                : "bg-dark-button-bg text-light-button-text hover:bg-dark-surface-stroke"
                            : "bg-dark-button-muted text-dark-placeholder cursor-not-allowed"}
                    `}
                >
                    {isSubmitting ? "Verifying..." : "Verify"}
                </button>
            </form>
        </div>
    );
}

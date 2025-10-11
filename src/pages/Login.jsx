import { useState, useRef, useEffect } from "react";
import { useTheme } from "../hook/useTheme";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { buildApiUrl } from "../utils/utils"

export default function Login() {
    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const agentUrl = localStorage.getItem("agent_url");
        if (!agentUrl || agentUrl.trim() === "") {
            navigate("/setup", { replace: true });
        }
    }, [navigate]);


    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const alertTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
            }
        };
    }, []);

    const showAlert = (type, message) => {
        if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
        }

        setAlert({ type, message });

        alertTimeoutRef.current = setTimeout(() => {
            setAlert(null);
            alertTimeoutRef.current = null;
        }, 5000);
    };

    const validateFieldLocal = (name, value) => {
        const v = (value || "").toString().trim();
        if (!v) return "This field is required";

        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(v)) return "Must be a valid email";
        }

        return "";
    };

    const validateField = (name, value) => {
        const error = validateFieldLocal(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
        return error;
    };

    const validateAll = () => {
        const next = {};
        next.email = validateFieldLocal("email", formData.email);
        next.password = validateFieldLocal("password", formData.password);
        setErrors((prev) => ({ ...prev, ...next }));
        return Object.values(next).every((e) => e === "");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (alert) {
            setAlert(null);
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
                alertTimeoutRef.current = null;
            }
        }
        validateField(name, value);
    };

    const isFieldValid = (name) => formData[name] && !errors[name];

    const isFormValid =
        Object.values(formData).every((v) => v.trim()) &&
        Object.values(errors).every((err) => err === "");


    const handleSubmit = async (e) => {
        e.preventDefault();

        const ok = validateAll();
        if (!ok) return;

        setIsSubmitting(true);
        setAlert(null);

        try {
            const agentUrl = localStorage.getItem("agent_url");
            const loginUrl = buildApiUrl(agentUrl + "/api/v1/auth/login");
            const response = await fetch(`${loginUrl}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            let res;
            try {
                res = await response.json();
            } catch {
                res = {};
            }

            if (!response.ok) {
                const serverMsg = res?.message || res?.error || response.statusText || "Login failed. Please try again.";
                showAlert("error", `Login Failed: ${serverMsg}`);
                return;
            }

            // ✅ Save temp_token to localStorage
            if (res?.temp_token) {
                localStorage.setItem("temp_token", res.temp_token);
            }

            if (formData.email) {
                localStorage.setItem("email", formData.email);
            }

            // ✅ Set a secure cookie with SameSite=Lax and 15-minute expiry
            document.cookie = `allow_verification=true; max-age=${15 * 60}; path=/; SameSite=Lax`;

            showAlert("success", `Welcome back, ${formData.email}!`);

            // ✅ Redirect to /verify page
            setTimeout(() => navigate("/verify"), 1600);

        } catch (err) {
            showAlert("error", `Login Failed: ${err?.message || String(err)}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    const inputBase = `w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 pr-10 transition`;
    const lightInput = `bg-white text-black placeholder-light-placeholder border-gray-300 focus:ring-light-info`;
    const darkInput = `bg-dark-surface-bg text-white placeholder-dark-placeholder border-dark-surface-stroke focus:ring-dark-info`;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full px-4 transition-colors duration-300">
            <div className="w-full max-w-[350px] mb-4">
                <button
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    className={`inline-flex items-center gap-1 py-1.5 rounded-full text-sm font-medium transition
                        ${theme === "dark"
                            ? "text-dark-button-text hover:text-dark-info active:text-dark-info"
                            : "text-black hover:text-light-info active:text-light-info"}`}
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-center mb-2">
                Welcome!
            </h1>
            <p className="text-center text-sm text-gray-600 dark:text-dark-placeholder mb-6">
                Please enter your login info to continue
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
                onSubmit={handleSubmit}
                className="w-full max-w-[350px] space-y-5 mx-auto"
            >
                {/* Email */}
                <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${inputBase} ${theme === "dark" ? darkInput : lightInput} ${errors.email && "border-red-500 focus:ring-red-500"}`}
                    />
                    {isFieldValid("email") && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-9" />
                    )}
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div className="relative mt-2">
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${inputBase} ${theme === "dark" ? darkInput : lightInput} ${errors.password && "border-red-500 focus:ring-red-500"}`}
                    />
                    {isFieldValid("password") && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-9" />
                    )}
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-2 rounded-full font-semibold transition mt-6
      ${isFormValid && !isSubmitting
                            ? theme === "dark"
                                ? "bg-dark-button-bg text-dark-button-text hover:bg-dark-surface-stroke"
                                : "bg-dark-button-bg text-light-button-text hover:bg-dark-surface-stroke"
                            : "bg-dark-button-muted text-dark-placeholder cursor-not-allowed"}`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />

                            {/* <span>Login in</span> */}
                        </div>
                    ) : (
                        "Login"
                    )}
                </button>

            </form>
        </div>
    );
}
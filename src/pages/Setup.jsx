import { useState, useRef, useEffect } from "react";
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState(null); // { type: "success" | "error", message: string }
    const alertTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
            }

        };
    }, []);

    const uuidv4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
        // returns error string
        const v = (value || "").toString().trim();
        if (!v) return "This field is required";

        if (name === "userId" || name === "authToken") {
            if (!uuidv4Regex.test(v)) return "Must be a valid UUID v4";
        }

        if (name === "agentUrl") {
            try {
                // Use URL constructor; allows http/https
                new URL(v);
            } catch {
                return "Must be a valid URL";
            }
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
        next.userId = validateFieldLocal("userId", formData.userId);
        next.agentUrl = validateFieldLocal("agentUrl", formData.agentUrl);
        next.authToken = validateFieldLocal("authToken", formData.authToken);
        setErrors((prev) => ({ ...prev, ...next }));
        return Object.values(next).every((e) => e === "");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear any global alert when user types
        if (alert) {
            setAlert(null);

            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
                alertTimeoutRef.current = null;
            }
        }
        // validate live
        validateField(name, value);
    };

    const isFieldValid = (name) => formData[name] && !errors[name];

    const isFormValid =
        Object.values(formData).every((v) => v.trim()) &&
        Object.values(errors).every((err) => err === "");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // validate all before submit (this also sets inline errors)
        const ok = validateAll();
        if (!ok) return;

        setIsSubmitting(true);
        setAlert(null);

        try {
            const response = await fetch(`${formData.agentUrl.replace(/\/+$/, "")}/connect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: formData.userId,
                    auth_token: formData.authToken,
                }),
            });

            let res;
            try {
                res = await response.json();
            } catch {
                res = {};
            }

            if (!response.ok) {
                // prefer server message if present
                const serverMsg = res?.message || res?.error || response.statusText || "Failed to connect to agent, make sure agent is corrent or alive and try again";
                showAlert("error", `Connection Failed: ${serverMsg}`);
                return;
            }

            // store requested items for next screen
            localStorage.setItem("user_id", formData.userId);
            localStorage.setItem("user_auth_token", formData.authToken);
            localStorage.setItem("agent_url", formData.agentUrl);

            // Store the server agent token safely!
            const issuedToken = res?.agent_session_token || null;

            if (issuedToken) {
                localStorage.setItem("agent_session_token", issuedToken);
            }

            // success alert with possible returned user name
            const displayName = res?.user?.firstname || res?.user?.name || "User";
            showAlert("success", `Successfully connected to Agent: ${formData.agentUrl} as ${displayName}`);

            // navigate after a short delay so user can read the alert
            setTimeout(() => navigate("/chat"), 1600);
        } catch (err) {
            showAlert("error", `Connection Failed: ${err?.message || String(err)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            : "text-black hover:text-light-info active:text-light-info"}`}
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-center mb-2">
                Welcome!
            </h1>
            <p className="text-center text-sm text-gray-600 dark:text-dark-placeholder mb-6">
                Please enter your setup info to continue
            </p>

            {/* Alert Box (auto-dismisses after 5s) */}
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

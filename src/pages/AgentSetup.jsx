import { useState, useRef, useEffect } from "react";
import { useTheme } from "../hook/useTheme";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Switch } from "@headlessui/react";
import { buildApiUrl } from "../utils/utils"

export default function Setup() {

    const { theme } = useTheme();
    const navigate = useNavigate();
    const [agentUrl, setAgentUrl] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const alertTimeoutRef = useRef(null);
    const [defaultUrlStatus, setDefaultUrlStatus] = useState("idle");
    const [useDefault, setUseDefault] = useState(true);
    const urlToUse = useDefault ? "https://dman.stevesplashhub.space" : agentUrl.trim();

    useEffect(() => {
        return () => {
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!useDefault) {
            setDefaultUrlStatus("idle");
            return;
        }

        const testDefaultUrl = async () => {
            try {
                const cleanUrl = buildApiUrl(urlToUse);
                const response = await fetch(cleanUrl, { method: "GET" });

                if (!response.ok) {
                    throw new Error("Agent did not respond with 200 OK");
                }

                setDefaultUrlStatus("success");
            } catch {
                setDefaultUrlStatus("error");
            }
        };

        testDefaultUrl();
    }, [useDefault, urlToUse]);


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

    const validateUrl = (value) => {
        if (!value.trim()) return "This field is required";
        try {
            new URL(value);
            return "";
        } catch {
            return "Must be a valid URL";
        }
    };

    const currentError = useDefault ? "" : validateUrl(agentUrl);
    const isInputValid = useDefault
        ? defaultUrlStatus === "success"
        : agentUrl && currentError === "";


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isInputValid) {
            setError(validateUrl(agentUrl));
            return;
        }

        setIsSubmitting(true);
        setAlert(null);
        setError("");

        try {
            const cleanUrl = buildApiUrl(urlToUse);

            if (!useDefault) {
                const response = await fetch(cleanUrl, { method: "GET" });
                if (!response.ok) {
                    throw new Error("Agent did not respond with 200 OK");
                }
            }

            localStorage.setItem("agent_url", cleanUrl);

            if (!useDefault) {
                showAlert("success", `Successfully connected to agent at: ${urlToUse}`);

                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
            navigate("/login");
        } catch (err) {
            showAlert("error", `Connection Failed: ${err.message || "Unknown error"}`);
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
                Agent Setup
            </h1>
            <p className="text-center text-sm text-gray-600 dark:text-dark-placeholder mb-6">
                Configure your connection settings to continue
            </p>

            {/* Alert */}
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
                {/* Agent URL Input */}
                {!useDefault && (
                    <div className="relative">
                        <label htmlFor="agentUrl" className="block text-sm font-medium mb-1">
                            Agent URL
                        </label>
                        <input
                            type="text"
                            id="agentUrl"
                            name="agentUrl"
                            placeholder="Enter your agent URL here"
                            value={agentUrl}
                            onChange={(e) => {
                                setAgentUrl(e.target.value);
                                setAlert(null);
                                setError(validateUrl(e.target.value));
                            }}
                            disabled={useDefault}
                            className={`${inputBase} ${theme === "dark" ? darkInput : lightInput} ${error && "border-red-500 focus:ring-red-500"} ${useDefault && "opacity-50 cursor-not-allowed"}`}
                        />
                        {!error && agentUrl && !useDefault && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-9" />
                        )}
                        {error && !useDefault && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                        )}
                    </div>
                )}
                {/* Use Default Agent URL Checkbox */}

                <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm select-none">Use Default Agent URL</span>
                    <Switch
                        checked={useDefault}
                        onChange={setUseDefault}
                        className={`${useDefault ? "bg-blue-600" : "bg-gray-300"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                        <span className="sr-only">Use Default Agent URL</span>
                        <span
                            className={`${useDefault ? "translate-x-6" : "translate-x-1"
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </Switch>
                </div>
                {useDefault && (
                    <p className="mt-1 text-sm text-gray-700 dark:text-dark-placeholder flex justify-between items-center">
                        <span>Default URL: {urlToUse}</span>
                        {defaultUrlStatus === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {defaultUrlStatus === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                    </p>
                )}

                {/* Connect Button */}
                <button
                    type="submit"
                    disabled={!isInputValid || isSubmitting}
                    className={`w-full py-2 rounded-full font-semibold transition mt-6
                        ${isInputValid && !isSubmitting
                            ? theme === "dark"
                                ? "bg-dark-button-bg text-dark-button-text hover:bg-dark-surface-stroke"
                                : "bg-dark-button-bg text-light-button-text hover:bg-dark-surface-stroke"
                            : "bg-dark-button-muted text-dark-placeholder cursor-not-allowed"}
                    `}
                >
                    {isSubmitting ? (useDefault ? "Please wait" : "Connecting...") : (useDefault ? "Proceed" : "Connect")}

                </button>
            </form>
        </div>
    );
}

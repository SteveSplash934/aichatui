// src/pages/Chat.jsx
import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import { X, Bot } from "lucide-react";
import { useTheme } from "../hook/useTheme";
import useGlobalDragDrop from "../hook/useGlobalDragDrop";
import ChatInput from "../components/ChatInput";
import { useNavigate } from "react-router-dom";

export default function Chat() {
    const { theme } = useTheme();

    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const authToken = localStorage.getItem("user_auth_token");
        const agentUrl = localStorage.getItem("agent_url");
        const agentSessionToken = localStorage.getItem("agent_session_token");

        if (!userId || !authToken || !agentUrl || !agentSessionToken) {
            navigate("/");
        }
    }, []);

    const [messages, setMessages] = useState([]); // { role, text, images }
    const [input, setInput] = useState("");
    const [previews, setPreviews] = useState([]);
    const typedRef = useRef(null);
    const chatEndRef = useRef(null);

    const { isDragging } = useGlobalDragDrop((files) => {
        const imgs = files.filter((f) => f.type.startsWith("image/"));
        const newPrev = imgs.map((f) => ({
            file: f,
            previewUrl: URL.createObjectURL(f),
        }));
        setPreviews((p) => [...p, ...newPrev]);
    });

    // Intro text
    useEffect(() => {
        const typed = new Typed(typedRef.current, {
            strings: [
                "Hey there! Welcome to DMAN Assistance.<br/>How can I be of help today?",
            ],
            typeSpeed: 30,
            showCursor: false,
        });
        return () => typed.destroy();
    }, []);

    // Scroll bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files || []);
        const newPrev = files.map((f) => ({
            file: f,
            previewUrl: URL.createObjectURL(f),
        }));
        setPreviews((p) => [...p, ...newPrev]);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []).filter((f) =>
            f.type.startsWith("image/")
        );
        if (!files.length) return;
        const newPrev = files.map((f) => ({
            file: f,
            previewUrl: URL.createObjectURL(f),
        }));
        setPreviews((p) => [...p, ...newPrev]);
    };

    const removePreview = (i) => setPreviews((p) => p.filter((_, x) => x !== i));

    const handleSend = async () => {
        if (!input.trim() && previews.length === 0) return;

        const userMsg = {
            role: "user",
            text: input.trim(),
            images: previews.map((p) => ({ previewUrl: p.previewUrl })),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setPreviews([]);

        // Simulated bot reply
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    text: "Got it! I’ll review and get back to you shortly.",
                    images: [],
                },
            ]);
        }, 700);
    };

    const inputBg = theme === "dark" ? "bg-dark-bg" : "bg-white";

    return (
        <div className="flex flex-col h-full w-full relative transition-colors duration-300">
            {/* Global drag overlay */}
            {isDragging && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface px-6 py-4 rounded-2xl shadow-lg border dark:border-gray-700 border-gray-300 text-center">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Drop your images here to upload
                        </p>
                    </div>
                </div>
            )}

            {/* Chat area */}
            <div
                className={`flex-1 overflow-y-auto px-4 py-6 w-full max-w-3xl mx-auto ${theme === "dark"
                    ? "scrollbar-thumb-gray-700 scrollbar-track-gray-900"
                    : "scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                    }`}
            >
                {messages.length === 0 ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                        <h2
                            ref={typedRef}
                            className="text-center text-1xl md:text-2xl font-semibold leading-relaxed max-w-xl"
                        />
                        <ChatInput
                            theme={theme}
                            input={input}
                            setInput={setInput}
                            previews={previews}
                            removePreview={removePreview}
                            handleFileInput={handleFileInput}
                            handleSend={handleSend}
                            handleDrop={handleDrop}
                            placeholder="Ask anything to start chat"
                            sendEnabled={input.trim() || previews.length > 0}
                        />
                        {previews.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                {previews.map((p, i) => (
                                    <div
                                        key={i}
                                        className="relative w-20 h-20 rounded-lg overflow-hidden border"
                                    >
                                        <img
                                            src={p.previewUrl}
                                            alt={`preview-${i}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removePreview(i)}
                                            className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-0.5 text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 pb-32">
                        {messages.map((m, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {m.role === "bot" && (
                                    <div
                                        className={`w-9 h-9 flex items-center justify-center rounded-full ${theme === "dark"
                                            ? "bg-dark-surface-stroke text-dark-button-text"
                                            : "bg-gray-200 text-black"
                                            }`}
                                    >
                                        <Bot className="w-5 h-5" />
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 max-w-[78%]">
                                    {/* Images (always above text) */}
                                    {m.images && m.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {m.images.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img.previewUrl}
                                                    alt={`sent-${i}`}
                                                    className="rounded-lg w-40 h-40 object-cover"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Text bubble (only if text exists) */}
                                    {m.text && (
                                        <div
                                            className={`rounded-2xl px-4 py-2 break-words ${m.role === "user"
                                                ? theme === "dark"
                                                    ? "bg-dark-button-bg text-light-button-text self-end"
                                                    : "bg-black text-white self-end"
                                                : theme === "dark"
                                                    ? "bg-dark-surface-bg text-dark-primary"
                                                    : "bg-gray-100 text-black"
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{m.text}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Bottom Chat Input (active chat) */}
            {messages.length > 0 && (
                <ChatInput
                    theme={theme}
                    input={input}
                    setInput={setInput}
                    previews={previews}
                    removePreview={removePreview}
                    handleFileInput={handleFileInput}
                    handleSend={handleSend}
                    handleDrop={handleDrop}
                    placeholder="Type your message..."
                    sendEnabled={input.trim() || previews.length > 0}
                />
            )}

            {/* Image previews just above chat input */}
            {messages.length > 0 && previews.length > 0 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 flex flex-wrap gap-2 justify-start">
                    {previews.map((p, i) => (
                        <div
                            key={i}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border"
                        >
                            <img
                                src={p.previewUrl}
                                alt={`preview-${i}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => removePreview(i)}
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

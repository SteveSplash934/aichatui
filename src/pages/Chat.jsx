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
        const userChatSessionToken = localStorage.getItem("user_chat_session_token");

        if (!userId || !authToken || !agentUrl || !userChatSessionToken) {
            navigate("/");
        }
    }, []);

    const [messages, setMessages] = useState([]); // { role, text, images, isTyping, id }
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

    // helper to update bot placeholder by id
    const updateBotMessage = (id, changes) =>
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...changes } : m))
        );

    // send prompt to agent (reads agent_url from localStorage)
    const sendToAgent = async (userMsg, botId) => {
        const agentUrl = localStorage.getItem("agent_url");
        const userId = localStorage.getItem("user_id");
        const authToken = localStorage.getItem("user_auth_token");
        const userChatSessionToken = localStorage.getItem("user_chat_session_token");

        if (!agentUrl) {
            updateBotMessage(botId, {
                text: "Agent URL not configured. Please set it in Setup.",
                isTyping: false,
            });
            return;
        }

        try {
            const headers = {
                "Content-Type": "application/json",
            };
            if (userChatSessionToken) {
                headers["Authorization"] = `Bearer ${userChatSessionToken}`;
            }

            const payload = {
                prompt: userMsg.text,
                user_id: userId,
                user_auth_token: authToken,
                images: userMsg.images || [],
            };

            const resp = await fetch(agentUrl.replace(/\/+$/, "") + "/chat", {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                // try to parse server message
                let serverMsg = resp.statusText || "Connection failed";
                try {
                    const j = await resp.json();
                    serverMsg = j?.message || j?.error || serverMsg;
                } catch (e) {
                    // ignore
                }
                updateBotMessage(botId, {
                    text: `Connection Failed: ${serverMsg}`,
                    isTyping: false,
                });
                return;
            }

            // If response is streamable, read progressively
            if (resp.body && resp.body.getReader) {
                const reader = resp.body.getReader();
                const decoder = new TextDecoder();
                let done = false;
                let accumulated = "";
                let sawFirstChunk = false;

                while (!done) {
                    const { value, done: d } = await reader.read();
                    done = d;
                    if (value) {
                        const chunk = decoder.decode(value, { stream: !done });
                        accumulated += chunk;

                        if (!sawFirstChunk) {
                            sawFirstChunk = true;
                            // stop typing animation, start showing first chunk
                            updateBotMessage(botId, { isTyping: false, text: accumulated });
                        } else {
                            // update progressively
                            updateBotMessage(botId, { text: accumulated });
                        }
                    }
                }

                if (!sawFirstChunk) {
                    // no chunks received, fallback to text
                    let txt = "";
                    try {
                        txt = await resp.text();
                    } catch { }
                    updateBotMessage(botId, { isTyping: false, text: txt || "No reply from agent" });
                }
            } else {
                // fallback: parse as json or text
                let parsed = "";
                try {
                    const j = await resp.json();
                    parsed = j?.text || j?.message || JSON.stringify(j);
                } catch {
                    try {
                        parsed = await resp.text();
                    } catch {
                        parsed = "";
                    }
                }
                updateBotMessage(botId, { isTyping: false, text: parsed || "No reply from agent" });
            }
        } catch (err) {
            updateBotMessage(botId, {
                text: `Connection Failed: ${err?.message || String(err)}`,
                isTyping: false,
            });
        }
    };

    const handleSend = async () => {
        if (!input.trim() && previews.length === 0) return;

        const userMsg = {
            role: "user",
            text: input.trim(),
            images: previews.map((p) => ({ previewUrl: p.previewUrl })),
        };

        // append user message
        setMessages((prev) => [...prev, userMsg]);

        // reset input & previews
        setInput("");
        setPreviews([]);

        // create bot placeholder with typing animation
        const botId = `bot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const botPlaceholder = {
            role: "bot",
            text: "",
            images: [],
            isTyping: true,
            id: botId,
        };

        setMessages((prev) => [...prev, botPlaceholder]);

        // send to agent and stream into placeholder
        sendToAgent(userMsg, botId);
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
                                key={m.id ?? idx}
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

                                    {/* Text bubble (show if text exists OR bot is typing) */}
                                    {(m.text || (m.role === "bot" && m.isTyping)) && (
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
                                            {m.isTyping ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1">
                                                        <span
                                                            className="inline-block w-2 h-2 rounded-full animate-bounce"
                                                            style={{ animationDelay: "0s" }}
                                                        />
                                                        <span
                                                            className="inline-block w-2 h-2 rounded-full animate-bounce"
                                                            style={{ animationDelay: "0.12s" }}
                                                        />
                                                        <span
                                                            className="inline-block w-2 h-2 rounded-full animate-bounce"
                                                            style={{ animationDelay: "0.24s" }}
                                                        />
                                                    </div>
                                                    <span className="text-sm opacity-80">typing</span>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{m.text}</p>
                                            )}
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

import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import {
    X,
    Bot,
    Clipboard,
    ThumbsUp,
    ThumbsDown,
    RotateCcw
} from "lucide-react";

import { useTheme } from "../hook/useTheme";
import useGlobalDragDrop from "../hook/useGlobalDragDrop";
import ChatInput from "../components/ChatInput";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from "../utils/utils"
import toast from 'react-hot-toast'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";


export default function Chat() {
    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("is_loggedin") === "true";
        const accessToken = localStorage.getItem("access_token");
        const userId = localStorage.getItem("user_id");

        if (!isLoggedIn || !accessToken || !userId) {
            localStorage.clear();
            navigate("/setup", { replace: true });
        }
    }, [navigate]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [previews, setPreviews] = useState([]);
    const typedRef = useRef(null);
    const chatEndRef = useRef(null);
    // check if bot is typing (any bot message with isTyping true)
    const isBotTyping = messages.some(msg => msg.role === "bot" && msg.isTyping);


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
        const accessToken = localStorage.getItem("access_token");

        if (!agentUrl || !userId || !accessToken) {
            toast.error("Missing configuration. Please ensure you're logged in and setup is complete.");
            return;
        }

        try {
            const resp = await fetch(buildApiUrl(`${agentUrl}/api/v1/ai/mvp/chat`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    message: userMsg.text,
                }),
            });

            const data = await resp.json();

            if (!resp.ok || data?.status !== "completed") {
                toast.error(data?.message || "Unknown error occurred.");
                return;
            }

            updateBotMessage(botId, { isTyping: false, text: data?.response });
        } catch (err) {
            toast.error(err?.message || String(err));
        }
    };

    const handleSend = async () => {
        const isBotTyping = messages.some(m => m.role === "bot" && m.isTyping === true);
        if (isBotTyping) return; // do nothing if AI is still responding

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

    // const inputBg = theme === "dark" ? "bg-dark-bg" : "bg-white";

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
                            sendEnabled={!isBotTyping && (input.trim() !== "" || previews.length > 0)}
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
                                {/* Bot avatar */}
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

                                    {/* ✅ USER MESSAGE */}
                                    {m.role === "user" && m.text && (
                                        <div
                                            className={`rounded-2xl px-4 py-2 break-words self-end ${theme === "dark"
                                                ? "bg-dark-button-bg text-light-button-text"
                                                : "bg-black text-white"
                                                }`}
                                        >
                                            <div className="prose max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-2 prose-code:text-sm">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeHighlight]}
                                                >
                                                    {m.text}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {/* ✅ BOT MESSAGE */}
                                    {m.role === "bot" && (m.text || m.isTyping) && (
                                        <div className="flex flex-col gap-2">
                                            {m.isTyping ? (
                                                <div className="typing-indicator text-gray-500 dark:text-gray-300">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Bot plain text (no bubble) */}
                                                    <div className="prose max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-2 prose-code:text-sm">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            rehypePlugins={[rehypeHighlight]}
                                                        >
                                                            {m.text}
                                                        </ReactMarkdown>
                                                    </div>

                                                    {/* Bot Action Icons */}
                                                    <div className="flex gap-4 items-center mt-1 text-gray-500 dark:text-gray-400">
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(m.text);
                                                                toast.success("Copied to clipboard");
                                                            }}
                                                            title="Copy"
                                                        >
                                                            <Clipboard className="w-4 h-4 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                                                        </button>

                                                        <button
                                                            onClick={() => toast.success("You liked this response")}
                                                            title="Like"
                                                        >
                                                            <ThumbsUp className="w-4 h-4 hover:text-green-500 dark:hover:text-green-400 transition-colors" />
                                                        </button>

                                                        <button
                                                            onClick={() => toast("You disliked this response")}
                                                            title="Dislike"
                                                        >
                                                            <ThumbsDown className="w-4 h-4 hover:text-red-500 dark:hover:text-red-400 transition-colors" />
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                const lastUserMsg = messages
                                                                    .slice()
                                                                    .reverse()
                                                                    .find((msg) => msg.role === "user");
                                                                if (lastUserMsg) {
                                                                    setInput(lastUserMsg.text);
                                                                    handleSend();
                                                                }
                                                            }}
                                                            title="Try again"
                                                        >
                                                            <RotateCcw className="w-4 h-4 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors" />
                                                        </button>
                                                    </div>
                                                </>
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
                    sendEnabled={!isBotTyping && (input.trim() !== "" || previews.length > 0)}
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

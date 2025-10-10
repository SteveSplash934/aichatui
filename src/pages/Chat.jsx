// src/pages/Chat.jsx
import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import { ArrowUp, Image as ImageIcon, X, Bot } from "lucide-react";
import { useTheme } from "../hook/useTheme";
import useGlobalDragDrop from "../hook/useGlobalDragDrop";

export default function Chat() {
    const { theme } = useTheme();
    const [messages, setMessages] = useState([]); // { role: 'user'|'bot', text, images: [{ previewUrl }] }
    const [input, setInput] = useState("");
    const [previews, setPreviews] = useState([]);
    const typedRef = useRef(null);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    // Typed.js intro
    useEffect(() => {
        const typed = new Typed(typedRef.current, {
            strings: [
                "Hey there! Welcome to DMAN Assistance.<br/>How can I be of help today?",
            ],
            typeSpeed: 35,
            showCursor: false,
        });
        return () => typed.destroy();
    }, []);

    // Drag & drop (global)
    const { isDragging } = useGlobalDragDrop((files) => {
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        const newPreviews = imageFiles.map((f) => ({
            file: f,
            previewUrl: URL.createObjectURL(f),
        }));
        setPreviews((p) => [...p, ...newPreviews]);
    });

    // Scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Resize image helper (reduces file before preview)
    const resizeImage = (file, maxDimension = 600) =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const scale = Math.min(
                        maxDimension / img.width,
                        maxDimension / img.height,
                        1
                    );
                    const w = Math.round(img.width * scale);
                    const h = Math.round(img.height * scale);
                    const canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                resolve(URL.createObjectURL(file));
                                return;
                            }
                            resolve(URL.createObjectURL(blob));
                        },
                        "image/jpeg",
                        0.85
                    );
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });

    // Handle file input
    const handleFileInput = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newPreviews = files.map((f) => ({
            file: f,
            previewUrl: URL.createObjectURL(f),
        }));
        setPreviews((p) => [...p, ...newPreviews]);
        e.target.value = "";
    };

    // Handle drop inside chat input (optional local drop)
    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []).filter((f) =>
            f.type.startsWith("image/")
        );
        if (files.length === 0) return;
        const newPreviews = files.map((f) => ({
            file: f,
            previewUrl: URL.createObjectURL(f),
        }));
        setPreviews((p) => [...p, ...newPreviews]);
    };

    const removePreview = (index) => {
        setPreviews((p) => p.filter((_, i) => i !== index));
    };

    // Send message
    const handleSend = async () => {
        if (!input.trim() && previews.length === 0) return;

        const reducedImages = await Promise.all(
            previews.map(async (p) => {
                try {
                    const resized = await resizeImage(p.file);
                    return { previewUrl: resized };
                } catch {
                    return { previewUrl: p.previewUrl };
                }
            })
        );

        const userMsg = {
            role: "user",
            text: input.trim(),
            images: reducedImages,
            time: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        setPreviews([]);

        // Simulated bot reply
        setTimeout(() => {
            const botMsg = {
                role: "bot",
                text: "Got it! I’ll review and get back to you shortly.",
                images: [],
            };
            setMessages((prev) => [...prev, botMsg]);
        }, 700);
    };

    // Auto-resize textarea height
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }, [input]);

    // Theme classes
    const inputBg = theme === "dark" ? "bg-dark-input-bg" : "bg-white";
    const borderStroke =
        theme === "dark" ? "border-dark-surface-stroke" : "border-gray-300";
    const placeholder =
        theme === "dark" ? "placeholder-dark-placeholder" : "placeholder-gray-500";
    const sendEnabled = input.trim() || previews.length > 0;

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

            {/* Scrollable chat area */}
            <div
                className={`flex-1 overflow-y-auto px-4 py-6 w-full max-w-3xl mx-auto ${theme === "dark"
                    ? "scrollbar-thumb-gray-700 scrollbar-track-gray-900"
                    : "scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                    }`}
            >
                {messages.length === 0 ? (
                    // Pre-chat screen
                    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                        <h2
                            ref={typedRef}
                            className="text-center text-2xl md:text-3xl font-semibold leading-relaxed max-w-xl"
                        />
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className={`w-full max-w-3xl mx-auto px-4 py-3 rounded-full ${inputBg} border ${borderStroke} shadow-md`}
                        >
                            <div className="flex items-end gap-3">
                                <label
                                    className={`p-3 rounded-full flex-shrink-0 cursor-pointer transition ${theme === "dark"
                                        ? "bg-dark-surface-stroke text-dark-button-text hover:bg-white hover:text-black"
                                        : "bg-gray-200 text-black hover:bg-black hover:text-white"
                                        }`}
                                >
                                    <ImageIcon className="w-5 h-5" />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileInput}
                                    />
                                </label>

                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask anything to start chat"
                                    className={`flex-1 resize-none bg-transparent border-none focus:outline-none text-sm md:text-base ${placeholder}`}
                                />

                                <button
                                    onClick={handleSend}
                                    disabled={!sendEnabled}
                                    className={`p-3 rounded-full flex-shrink-0 transition ${sendEnabled
                                        ? theme === "dark"
                                            ? "bg-white text-black"
                                            : "bg-black text-white"
                                        : theme === "dark"
                                            ? "bg-dark-surface-stroke text-dark-placeholder cursor-not-allowed"
                                            : "bg-gray-300 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <ArrowUp className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Image previews before send */}
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
                    </div>
                ) : (
                    // Chat messages
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

                                <div
                                    className={`rounded-2xl px-4 py-2 max-w-[78%] break-words ${m.role === "user"
                                        ? theme === "dark"
                                            ? "bg-dark-button-bg text-light-button-text"
                                            : "bg-black text-white"
                                        : theme === "dark"
                                            ? "bg-dark-surface-bg text-dark-primary"
                                            : "bg-gray-100 text-black"
                                        }`}
                                >
                                    {m.text && (
                                        <p className="whitespace-pre-wrap">{m.text}</p>
                                    )}
                                    {m.images && m.images.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
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
                                </div>

                                {m.role === "user" && <div className="w-9 h-9" />}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Floating bottom input */}
            {messages.length > 0 && (
                <div className="fixed left-0 right-0 bottom-12 flex justify-center px-4 pointer-events-none">
                    <div
                        className={`pointer-events-auto w-full max-w-3xl ${inputBg} border ${borderStroke} rounded-full shadow-lg px-4 py-3`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <div className="flex items-end gap-3">
                            <label
                                className={`p-2 rounded-full flex-shrink-0 cursor-pointer transition ${theme === "dark"
                                    ? "bg-dark-surface-stroke text-dark-button-text hover:bg-white hover:text-black"
                                    : "bg-gray-200 text-black hover:bg-black hover:text-white"
                                    }`}
                            >
                                <ImageIcon className="w-5 h-5" />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileInput}
                                />
                            </label>

                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Type your message..."
                                className={`flex-1 resize-none bg-transparent border-none focus:outline-none text-sm md:text-base ${placeholder}`}
                            />

                            <button
                                onClick={handleSend}
                                disabled={!sendEnabled}
                                className={`p-3 rounded-full flex-shrink-0 transition ${sendEnabled
                                    ? theme === "dark"
                                        ? "bg-white text-black"
                                        : "bg-black text-white"
                                    : theme === "dark"
                                        ? "bg-dark-surface-stroke text-dark-placeholder cursor-not-allowed"
                                        : "bg-gray-300 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        </div>

                        {/* show thumbnails when user has selected images */}
                        {previews.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
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
                </div>
            )}
        </div>
    );
}

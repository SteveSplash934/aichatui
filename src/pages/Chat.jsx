import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import { ArrowUp, Image as ImageIcon, X, Bot } from "lucide-react";
import { useTheme } from "../hook/useTheme";

export default function Chat() {
    const { theme } = useTheme();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [images, setImages] = useState([]);
    const typedRef = useRef(null);
    const chatEndRef = useRef(null);

    // TypedJS for welcome text
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

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() && images.length === 0) return;
        const newMessage = { role: "user", text: input, images };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");
        setImages([]);

        // Simulate bot reply
        setTimeout(() => {
            const botMessage = {
                role: "bot",
                text: "Thanks for your message. I'll get back to you shortly.",
            };
            setMessages((prev) => [...prev, botMessage]);
        }, 800);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col h-full w-full transition-colors duration-300 relative">
            {/* Chat content container */}
            <div
                className={`flex-1 overflow-y-auto px-4 py-6 w-full max-w-2xl mx-auto ${messages.length === 0 ? "flex flex-col items-center justify-center" : ""
                    }`}
            >
                {messages.length === 0 ? (
                    // Pre-chat welcome screen
                    <div className="flex flex-col items-center text-center w-full space-y-6">
                        <h2
                            ref={typedRef}
                            className="text-lg md:text-xl font-semibold leading-relaxed"
                        ></h2>

                        {/* Centered chat input (pre-chat) */}
                        <div
                            className={`w-full flex items-center gap-3 rounded-full px-4 py-2 shadow-sm border max-w-2xl mx-auto ${theme === "dark"
                                ? "border-dark-surface-stroke bg-dark-input-bg"
                                : "border-gray-300 bg-white"
                                }`}
                        >
                            {/* Image upload */}
                            <label
                                className={`p-2 rounded-full flex-shrink-0 cursor-pointer transition ${theme === "dark"
                                    ? "text-dark-button-text hover:bg-white hover:text-black bg-dark-surface-stroke"
                                    : "text-gray-600 bg-gray-200 hover:bg-black hover:text-white"
                                    }`}
                            >
                                <ImageIcon className="w-5 h-5" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>

                            <input
                                type="text"
                                placeholder="Ask anything to start chat"
                                className={`flex-1 bg-transparent focus:outline-none text-sm md:text-base ${theme === "dark"
                                    ? "placeholder-dark-placeholder"
                                    : "placeholder-gray-500"
                                    }`}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSend()
                                }
                            />

                            <button
                                onClick={handleSend}
                                disabled={!input.trim() && images.length === 0}
                                className={`p-2 rounded-full flex-shrink-0 transition ${input.trim() || images.length > 0
                                    ? theme === "dark"
                                        ? "bg-white text-black hover:scale-105"
                                        : "bg-black text-white hover:scale-105"
                                    : theme === "dark"
                                        ? "bg-dark-surface-stroke text-dark-placeholder cursor-not-allowed"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    // Chat messages scrollable area
                    <div className="flex flex-col space-y-4 pb-28">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-2 ${msg.role === "user"
                                    ? "justify-end flex-row"
                                    : "justify-start"
                                    }`}
                            >
                                {msg.role === "bot" && (
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === "dark"
                                            ? "bg-dark-surface-stroke text-dark-button-text"
                                            : "bg-gray-200 text-black"
                                            }`}
                                    >
                                        <Bot className="w-5 h-5" />
                                    </div>
                                )}

                                <div
                                    className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${msg.role === "user"
                                        ? theme === "dark"
                                            ? "bg-dark-button-bg text-light-button-text"
                                            : "bg-black text-white"
                                        : theme === "dark"
                                            ? "bg-dark-surface-stroke text-dark-primary"
                                            : "bg-gray-100 text-black"
                                        }`}
                                >
                                    {msg.text && <p>{msg.text}</p>}
                                    {msg.images &&
                                        msg.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img.previewUrl}
                                                alt="sent"
                                                className="mt-2 rounded-lg w-28 h-28 object-cover"
                                            />
                                        ))}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Floating chat input after chat starts */}
            {messages.length > 0 && (
                <div
                    className={`fixed bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4`}
                >
                    <div
                        className={`w-full flex items-center gap-3 rounded-full px-4 py-2 shadow-md ${theme === "dark"
                            ? "border border-dark-surface-stroke bg-dark-input-bg"
                            : "border border-gray-300 bg-white"
                            }`}
                    >
                        <label
                            className={`p-2 rounded-full flex-shrink-0 cursor-pointer transition ${theme === "dark"
                                ? "text-dark-button-text hover:bg-white hover:text-black bg-dark-surface-stroke"
                                : "text-gray-600 bg-gray-200 hover:bg-black hover:text-white"
                                }`}
                        >
                            <ImageIcon className="w-5 h-5" />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>

                        <input
                            type="text"
                            placeholder="Type your message..."
                            className={`flex-1 bg-transparent focus:outline-none text-sm md:text-base ${theme === "dark"
                                ? "placeholder-dark-placeholder"
                                : "placeholder-gray-500"
                                }`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />

                        <button
                            onClick={handleSend}
                            disabled={!input.trim() && images.length === 0}
                            className={`p-2 rounded-full flex-shrink-0 transition ${input.trim() || images.length > 0
                                ? theme === "dark"
                                    ? "bg-white text-black hover:scale-105"
                                    : "bg-black text-white hover:scale-105"
                                : theme === "dark"
                                    ? "bg-dark-surface-stroke text-dark-placeholder cursor-not-allowed"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

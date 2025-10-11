import { useRef, useEffect } from "react";
import { ArrowUp, Image as ImageIcon, X } from "lucide-react";

export default function ChatInput({
    theme,
    input,
    setInput,
    previews,
    removePreview,
    handleFileInput,
    handleSend,
    handleDrop,
    placeholder,
    sendEnabled = true,
}) {
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-resize textarea height
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }, [input]);

    const inputBg = theme === "dark" ? "bg-dark-bg" : "bg-white";
    const borderStroke =
        theme === "dark" ? "border-dark-surface-stroke" : "border-gray-300";
    const placeholderColor =
        theme === "dark"
            ? "placeholder-dark-placeholder"
            : "placeholder-gray-500";

    return (
        <div className="w-full px-3 sm:px-5 md:px-8 pb-3">
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`w-full max-w-3xl mx-auto px-4 py-3 rounded-full ${inputBg} border ${borderStroke} shadow-md flex items-center justify-between `}
            >
                {/* Image Upload */}
                <div className="flex items-center justify-center">
                    <label
                        className={`p-2 rounded-full cursor-pointer transition ${theme === "dark"
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
                </div>

                {/* Textarea */}
                <div className="flex-1 mx-3 flex items-center justify-center">
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
                        placeholder={placeholder}
                        className={`w-full resize-none bg-transparent border-none focus:outline-none text-[16px] md:text-base ${placeholderColor}`}
                    />
                </div>

                {/* Send Button */}
                <div className="flex items-center justify-center">
                    <button
                        onClick={handleSend}
                        disabled={!sendEnabled}
                        className={`p-3 rounded-full transition ${sendEnabled
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

                {/* Image previews */}
                {previews.length > 0 && (
                    <div className="absolute bottom-full mb-3 left-0 right-0 flex flex-wrap gap-2 justify-center">
                        {previews.map((p, i) => (
                            <div
                                key={i}
                                className="relative w-16 h-16 rounded-lg overflow-hidden border"
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
        </div >
    );
}

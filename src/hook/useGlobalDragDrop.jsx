import { useState, useEffect } from "react";

/**
 * Global drag-and-drop listener hook.
 * Handles file drops anywhere in the window.
 *
 * @param {Function} onFilesDrop - Callback that receives the dropped files
 */
export default function useGlobalDragDrop(onFilesDrop) {
    const [isDragging, setIsDragging] = useState(false);
    let dragCounter = 0;

    useEffect(() => {
        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter++;
            setIsDragging(true);
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter--;
            if (dragCounter === 0) setIsDragging(false);
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter = 0;
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files || []);
            if (files.length > 0) onFilesDrop(files);
        };

        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("dragleave", handleDragLeave);
        window.addEventListener("drop", handleDrop);

        return () => {
            window.removeEventListener("dragover", handleDragOver);
            window.removeEventListener("dragleave", handleDragLeave);
            window.removeEventListener("drop", handleDrop);
        };
    }, [onFilesDrop]);

    return { isDragging };
}

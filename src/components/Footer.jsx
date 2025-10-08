import { Github, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="flex items-center justify-center gap-4 py-4 text-sm text-light-placeholder dark:text-dark-placeholder">
            <span className="text-xs opacity-70">© {new Date().getFullYear()} AI CHAT</span>
        </footer>
    );
}

import Header from "../components/Header";
import Footer from "../components/Footer";
import { Analytics } from "@vercel/analytics/next"

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                {children}
                <Analytics />
            </main>
            <Footer />
        </div>
    );
}

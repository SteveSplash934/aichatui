import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Welcome from "../pages/Welcome";
import Setup from "../pages/Setup";
import Chat from "../pages/Chat";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />

            {/* ❌ No layout for Welcome */}
            <Route path="/welcome" element={
                <MainLayout>
                    <Welcome />
                </MainLayout>
            } />

            {/* ✅ Layout applies to others */}
            <Route
                path="/setup"
                element={
                    <MainLayout>
                        <Setup />
                    </MainLayout>
                }
            />
            <Route
                path="/chat"
                element={
                    <MainLayout>
                        <Chat />
                    </MainLayout>
                }
            />
        </Routes>
    );
}

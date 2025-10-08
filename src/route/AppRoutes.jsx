import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Welcome from "../pages/Welcome";
import Setup from "../pages/Setup";
import Chat from "../pages/Chat";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />

            <Route path="/welcome" element={
                <MainLayout>
                    <Welcome />
                </MainLayout>
            } />

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
            <Route path="*" element={
                <MainLayout>
                    <NotFound />
                </MainLayout>
            } />
        </Routes>

    );
}

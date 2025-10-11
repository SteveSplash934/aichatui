import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Welcome from "../pages/Welcome";
import Setup from "../pages/Login";
import Chat from "../pages/Chat";
import NotFound from "../pages/NotFound";
import AgentSetup from "../pages/AgentSetup";
import Verify from "../pages/Verify";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />

            <Route path="/welcome" element={
                <MainLayout>
                    <Welcome />
                </MainLayout>
            } />
            <Route path="/setup" element={
                <MainLayout>
                    <AgentSetup />
                </MainLayout>
            } />
            <Route
                path="/login"
                element={
                    <MainLayout>
                        <Setup />
                    </MainLayout>
                }
            />
            <Route
                path="/verify"
                element={
                    <MainLayout>
                        <Verify />
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

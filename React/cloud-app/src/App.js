import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import HomePage from "./pages/HomePage";
import ComputePage from "./pages/ComputePage";
import NetworkingPage from "./pages/NetworkingPage";
import StoragePage from "./pages/StoragePage";
import LoginPage from "./pages/LoginPage";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import RegisterPage from "./pages/RegisterPage";
import ImagePage from "./pages/ImagePage";
import FlavorPage from "./pages/FlavorPage";
import SnapshotPage from "./pages/SnapshotPage";
import SnapshotVolumePage from "./pages/SnapshotVolumePage";
import SnapshotInstancePage from "./pages/SnapshotInstancePage";
import RouterPage from "./pages/RouterPage";
import SecurityGroupPage from "./pages/SecurityGroupPage";
import SubnetPage from "./pages/SubnetPage";
import FloatingIPPage from "./pages/FloatingIPPage";

// Custom route wrapper to protect routes
const ProtectedRoute = ({ isLoggedIn, children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    return (
        <Router>
            {/* Luôn hiển thị Header */}
            <Header setIsLoggedIn={setIsLoggedIn} />

            <div className="container mx-auto p-4 min-h-screen flex flex-col">
                <Routes>
                    <Route path="/login" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />

                    {/* Use ProtectedRoute to handle access control */}
                    <Route path="/" element={<ProtectedRoute isLoggedIn={isLoggedIn}><HomePage /></ProtectedRoute>} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/service/compute" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ComputePage /></ProtectedRoute>} />
                    <Route path="/service/networking" element={<ProtectedRoute isLoggedIn={isLoggedIn}><NetworkingPage /></ProtectedRoute>} />
                    <Route path="/service/storage" element={<ProtectedRoute isLoggedIn={isLoggedIn}><StoragePage /></ProtectedRoute>} />
                    <Route path="/service/images" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ImagePage /></ProtectedRoute>} />
                    <Route path="/service/flavors" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FlavorPage /></ProtectedRoute>} />
                    <Route path="/service/snapshots" element={<ProtectedRoute isLoggedIn={isLoggedIn}><SnapshotPage /></ProtectedRoute>} />
                    <Route path="/service/snapshots/volume"element={<ProtectedRoute isLoggedIn={isLoggedIn}><SnapshotVolumePage /></ProtectedRoute>} />
                    <Route path="/service/snapshots/instance" element={<ProtectedRoute isLoggedIn={isLoggedIn}><SnapshotInstancePage /></ProtectedRoute>} />
                    <Route path="/service/routers" element={<ProtectedRoute isLoggedIn={isLoggedIn}><RouterPage /></ProtectedRoute>} />
                    <Route path="/service/security-groups" element={<ProtectedRoute isLoggedIn={isLoggedIn}><SecurityGroupPage /></ProtectedRoute>} />
                    <Route path="/service/subnets" element={<ProtectedRoute isLoggedIn={isLoggedIn}><SubnetPage /></ProtectedRoute>} />
                    <Route path="/service/floating-ip" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FloatingIPPage /></ProtectedRoute>} />
                </Routes>
            </div>

            {/* Luôn hiển thị Footer */}
            <Footer />
        </Router>
    );
}

export default App;

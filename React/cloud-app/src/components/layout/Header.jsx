import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, LogIn } from "lucide-react";

const computeServices = [
    { name: "Compute", route: "/service/compute" },
    { name: "Flavors", route: "/service/flavors" },
    { name: "Snapshots", route: "/service/snapshots" },
    { name: "Routers", route: "/service/routers" },
];

const volumeServices = [
    { name: "Storage", route: "/service/storage" },
    { name: "Images", route: "/service/images" },
    { name: "Snapshots", route: "/service/snapshots" },
];

const networkServices = [
    { name: "Networking", route: "/service/networking" },
    { name: "Subnets", route: "/service/subnets" },
    { name: "Floating IP", route: "/service/floating-ip" },
    { name: "Security Groups", route: "/service/security-groups" },
];

const Header = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const [computeOpen, setComputeOpen] = useState(false);
    const [volumeOpen, setVolumeOpen] = useState(false);
    const [networkOpen, setNetworkOpen] = useState(false);

    let computeTimeout, volumeTimeout, networkTimeout;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        navigate("/login");
    };

    const handleMouseEnterCompute = () => {
        clearTimeout(computeTimeout);  // Clear any existing timeout
        setComputeOpen(true);
    };
    const handleMouseLeaveCompute = () => {
        computeTimeout = setTimeout(() => {
            setComputeOpen(false);
        }, 100);  // Delay before hiding the dropdown
    };

    const handleMouseEnterVolume = () => {
        clearTimeout(volumeTimeout);  // Clear any existing timeout
        setVolumeOpen(true);
    };
    const handleMouseLeaveVolume = () => {
        volumeTimeout = setTimeout(() => {
            setVolumeOpen(false);
        }, 100);  // Delay before hiding the dropdown
    };

    const handleMouseEnterNetwork = () => {
        clearTimeout(networkTimeout);  // Clear any existing timeout
        setNetworkOpen(true);
    };
    const handleMouseLeaveNetwork = () => {
        networkTimeout = setTimeout(() => {
            setNetworkOpen(false);
        }, 200);  // Delay before hiding the dropdown
    };

    return (
        <header className="bg-gradient-to-r from-blue-900 to-blue-600 shadow-xl sticky top-0 z-50">
            <div className="w-full px-4 py-4 flex justify-between items-center text-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider hover:scale-105 transition-transform duration-300">
                        ☁ OpenStack Portal
                    </h1>
                </div>

                {/* Desktop navigation */}
                <nav className="hidden md:flex space-x-6 text-white text-lg relative justify-center me-20">
                    <Link
                        to="/"
                        className="font-semibold text-white cursor-pointer"
                    >
                        Trang chủ
                    </Link>

                    {/* Links for Compute, Volumes, Networks with Hover Effects */}
                    <div className="flex space-x-6">
                        {/* Compute Section */}
                        <div
                            className="relative group"
                            onMouseEnter={handleMouseEnterCompute}
                            onMouseLeave={handleMouseLeaveCompute}
                        >
                            <span className="font-semibold text-white cursor-pointer">
                                Compute
                            </span>
                            <div
                                className={`absolute left-0 mt-2 space-y-2 ${
                                    computeOpen ? "block" : "hidden"
                                } bg-white shadow-lg rounded-lg p-3`}
                            >
                                {computeServices.map((service) => (
                                    <Link
                                        key={service.route}
                                        to={service.route}
                                        className="block text-gray-800 hover:text-blue-700 transition"
                                    >
                                        {service.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Volumes Section */}
                        <div
                            className="relative group"
                            onMouseEnter={handleMouseEnterVolume}
                            onMouseLeave={handleMouseLeaveVolume}
                        >
                            <span className="font-semibold text-white cursor-pointer">
                                Volumes
                            </span>
                            <div
                                className={`absolute left-0 mt-2 space-y-2 ${
                                    volumeOpen ? "block" : "hidden"
                                } bg-white shadow-lg rounded-lg p-3`}
                            >
                                {volumeServices.map((service) => (
                                    <Link
                                        key={service.route}
                                        to={service.route}
                                        className="block text-gray-800 hover:text-blue-700 transition"
                                    >
                                        {service.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Networks Section */}
                        <div
                            className="relative group"
                            onMouseEnter={handleMouseEnterNetwork}
                            onMouseLeave={handleMouseLeaveNetwork}
                        >
                            <span className="font-semibold text-white cursor-pointer">
                                Networks
                            </span>
                            <div
                                className={`absolute left-0 mt-2 space-y-2 ${
                                    networkOpen ? "block" : "hidden"
                                } bg-white shadow-lg rounded-lg p-3`}
                            >
                                {networkServices.map((service) => (
                                    <Link
                                        key={service.route}
                                        to={service.route}
                                        className="block text-gray-800 hover:text-blue-700 transition"
                                    >
                                        {service.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Login/Logout */}
                <div className="flex items-center space-x-4">
                    {isLoggedIn && (
                        <span className="hidden sm:block text-white text-base sm:text-lg">
                            👋 Xin chào,{" "}
                            <strong className="text-yellow-300">
                                {username || "User"}
                            </strong>
                        </span>
                    )}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition duration-300"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition duration-300"
                        >
                            Đăng nhập
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, LogIn } from "lucide-react";

const Header = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        navigate("/login");
    };

    const navLinks = [
        { path: "/", label: "Trang chủ" },
        { path: "/service/compute", label: "Compute" },
        { path: "/service/storage", label: "Storage" },
        { path: "/service/networking", label: "Networking" },
        { path: "/service/identity", label: "Identity" },
        { path: "/service/dashboard", label: "Dashboard" },
    ];

    return (
        <header className="bg-gradient-to-r from-blue-900 to-blue-600 shadow-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden text-white focus:outline-none"
                    >
                        <Menu size={28} />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider hover:scale-105 transition-transform duration-300">
                        ☁ OpenStack Portal
                    </h1>
                </div>

                <nav className="hidden md:flex space-x-6 text-white text-lg">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="hover:text-yellow-300 transition-transform duration-200 hover:scale-105"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4">
                    {isLoggedIn && (
                        <span className="hidden sm:block text-white text-base sm:text-lg">
                            👋 Xin chào, <strong className="text-yellow-300">{username || "User"}</strong>
                        </span>
                    )}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition duration-300"
                        >
                            <LogOut size={18} /> Đăng xuất
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition duration-300"
                        >
                            <LogIn size={18} /> Đăng nhập
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <nav className="md:hidden bg-blue-700 px-6 py-4 space-y-3 text-white">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMenuOpen(false)}
                            className="block text-lg hover:text-yellow-300 transition"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
};

export default Header;

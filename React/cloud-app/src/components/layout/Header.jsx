import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, LogIn, ChevronDown } from "lucide-react";

const services = [
    { name: "Compute", route: "/service/compute" },
    { name: "Networking", route: "/service/networking" },
    { name: "Storage", route: "/service/storage" },
    { name: "Images", route: "/service/images" },
    { name: "Flavors", route: "/service/flavors" },
    { name: "Snapshots", route: "/service/snapshots" },
];

const Header = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    let dropdownTimeout;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        navigate("/login");
    };

    return (
        <header className="bg-gradient-to-r from-blue-900 to-blue-600 shadow-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center text-center">
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

                {/* Desktop navigation */}
                <nav className="hidden md:flex space-x-6 text-white text-lg relative justify-center me-20">
                    <Link
                        to="/"
                        className="hover:text-yellow-300 transition-transform duration-200 hover:scale-105"
                    >
                        Home
                    </Link>

                    {/* Dropdown menu for services */}
                    <div
                        className="relative group"
                        onMouseEnter={() => {
                            clearTimeout(dropdownTimeout);
                            setDropdownOpen(true);
                        }}
                        onMouseLeave={() => {
                            dropdownTimeout = setTimeout(() => {
                                setDropdownOpen(false);
                            }, 200); // delay đóng menu
                        }}
                    >
                        <div className="flex items-center cursor-pointer hover:text-yellow-300 transition duration-200">
                            Services <ChevronDown size={18} className="ml-1" />
                        </div>
                        {dropdownOpen && (
                            <div
                                className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50"
                                onMouseEnter={() => {
                                    clearTimeout(dropdownTimeout);
                                }}
                                onMouseLeave={() => {
                                    dropdownTimeout = setTimeout(() => {
                                        setDropdownOpen(false);
                                    }, 200);
                                }}
                            >
                                {services.map((service) => (
                                    <Link
                                        key={service.route}
                                        to={service.route}
                                        className="block px-4 py-2 text-gray-800 hover:bg-blue-100 hover:text-blue-700 transition"
                                    >
                                        {service.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                {/* Login/Logout */}
                <div className="flex items-center space-x-4">
                    {isLoggedIn && (
                        <span className="hidden sm:block text-white text-base sm:text-lg">
                            👋 Welcome,{" "}
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
                            <LogOut size={18} /> Sign Out
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition duration-300"
                        >
                            <LogIn size={18} /> Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <nav className="md:hidden bg-blue-700 px-6 py-4 space-y-3 text-white">
                    <Link
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="block text-lg hover:text-yellow-300 transition"
                    >
                        Home
                    </Link>

                    {/* Dropdown on mobile as expanded list */}
                    <details className="text-white">
                        <summary className="cursor-pointer text-lg hover:text-yellow-300">
                            Services
                        </summary>
                        <div className="ml-4 mt-2 space-y-2">
                            {services.map((service) => (
                                <Link
                                    key={service.route}
                                    to={service.route}
                                    onClick={() => setMenuOpen(false)}
                                    className="block text-base hover:text-yellow-300"
                                >
                                    {service.name}
                                </Link>
                            ))}
                        </div>
                    </details>
                </nav>
            )}
        </header>
    );
};

export default Header;

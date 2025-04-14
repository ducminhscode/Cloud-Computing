import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("token");
    const username = localStorage.getItem("username"); // nếu có lưu tên người dùng

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        navigate("/login");
    };

    return (
        <header className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white tracking-wider transform transition duration-300 hover:scale-105">
                    ☁ OpenStack Portal
                </h1>

                <nav className="hidden md:flex space-x-6">
                    <Link to="/" className="text-white hover:text-yellow-300 transition ease-in-out duration-200 text-lg transform hover:scale-105">
                        Trang chủ
                    </Link>
                    <Link to="/service/compute" className="text-white hover:text-yellow-300 transition ease-in-out duration-200 text-lg transform hover:scale-105">
                        Compute
                    </Link>
                    <Link to="/service/storage" className="text-white hover:text-yellow-300 transition ease-in-out duration-200 text-lg transform hover:scale-105">
                        Storage
                    </Link>
                    <Link to="/service/networking" className="text-white hover:text-yellow-300 transition ease-in-out duration-200 text-lg transform hover:scale-105">
                        Networking
                    </Link>
                    <Link to="/service/identity" className="text-white hover:text-yellow-300 transition ease-in-out duration-200 text-lg transform hover:scale-105">
                        Identity
                    </Link>
                    <Link to="/service/dashboard" className="text-white hover:text-yellow-300 transition ease-in-out duration-200 text-lg transform hover:scale-105">
                        Dashboard
                    </Link>
                </nav>

                <div className="flex items-center space-x-6">
                    {isLoggedIn && (
                        <span className="text-white text-lg hidden sm:inline-block transform transition duration-300 hover:scale-105">
                            👋 Xin chào, <strong>{username || "User"}</strong>
                        </span>
                    )}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow-md transition duration-300 transform hover:scale-105 hover:shadow-xl"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition duration-300 transform hover:scale-105 hover:shadow-xl"
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

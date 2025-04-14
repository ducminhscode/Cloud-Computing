import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-blue-800 text-white py-6">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold">☁ OpenStack Portal</h3>
                    <p className="text-sm">Your private cloud solution powered by OpenStack.</p>
                </div>

                <div className="hidden md:flex space-x-6">
                    <Link to="/about" className="hover:text-yellow-300 transition duration-200">Giới thiệu</Link>
                    <Link to="/contact" className="hover:text-yellow-300 transition duration-200">Liên hệ</Link>
                    <Link to="/privacy" className="hover:text-yellow-300 transition duration-200">Chính sách bảo mật</Link>
                    <Link to="/terms" className="hover:text-yellow-300 transition duration-200">Điều khoản sử dụng</Link>
                </div>

                <div className="text-center md:text-right space-y-2">
                    <p className="text-xs">© 2025 OpenStack Portal. All rights reserved.</p>
                    <p className="text-xs">Developed with ❤️ by Your Company</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-10 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Branding & Description */}
        <div>
          <h3 className="text-3xl font-bold mb-2">☁ OpenStack Portal</h3>
          <p className="text-sm text-blue-200">
            Nền tảng điện toán đám mây riêng tư, linh hoạt và an toàn dựa trên OpenStack.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-3">
          <h4 className="text-xl font-semibold mb-2">Liên kết nhanh</h4>
          <ul className="space-y-1 text-sm text-blue-100">
            <li>
              <Link to="/about" className="hover:text-yellow-300 transition">
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-yellow-300 transition">
                Liên hệ
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-yellow-300 transition">
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-yellow-300 transition">
                Điều khoản sử dụng
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Credit */}
        <div className="text-sm text-blue-200 text-center md:text-right space-y-2">
          <p>© {new Date().getFullYear()} OpenStack Portal. All rights reserved.</p>
          <p>
            Developed with <span className="text-red-400">❤️</span> by{" "}
            <a
              href="https://yourcompany.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-300"
            >
              Your Company
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

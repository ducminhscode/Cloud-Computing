import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Apis, { endpoints } from "../configs/Apis";

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await Apis.post(endpoints["login"], {
                username,
                password,
            });

            const token = res.data.token;
            localStorage.setItem("token", token);
            localStorage.setItem("username", res.data.user);

            if (onLogin) onLogin(); // cập nhật trạng thái đăng nhập

            navigate("/"); // chuyển về trang chính sau đăng nhập
        } catch (err) {
            setError(err.response?.data?.error || "Lỗi đăng nhập");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-white from-blue-500 via-indigo-500 to-purple-600">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl transform transition duration-300 hover:scale-105">
                <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-600">Đăng nhập OpenStack</h2>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Tên người dùng"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mb-4"
                    >
                        Đăng nhập
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                    >
                        Đăng ký tài khoản mới
                    </button>
                </form>

                {error && <p className="mt-4 text-red-500 text-center font-semibold">{error}</p>}

                <p className="mt-4 text-center text-gray-600">
                    Chưa có tài khoản?{" "}
                    <span 
                        className="text-blue-600 cursor-pointer hover:underline"
                        onClick={() => navigate("/register")}
                    >
                        Đăng ký ngay
                    </span>
                </p>
            </div>
        </div>
    );
}
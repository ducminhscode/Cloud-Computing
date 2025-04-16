import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Apis, { endpoints } from "../configs/Apis";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await Apis.post(endpoints["register"], {
                username,
                password,
                email
            });

            setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
            
            // Xóa form sau khi đăng ký thành công
            setUsername("");
            setPassword("");
            setEmail("");
            
            // Tự động chuyển đến trang login sau 2 giây
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Lỗi đăng ký");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-white from-blue-500 via-indigo-500 to-purple-600">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl transform transition duration-300 hover:scale-105">
                <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-600">Đăng ký tài khoản</h2>

                <form onSubmit={handleRegister}>
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

                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    >
                        Đăng ký
                    </button>
                </form>

                {error && <p className="mt-4 text-red-500 text-center font-semibold">{error}</p>}
                {success && <p className="mt-4 text-green-500 text-center font-semibold">{success}</p>}

                <p className="mt-4 text-center text-gray-600">
                    Đã có tài khoản?{" "}
                    <span 
                        className="text-blue-600 cursor-pointer hover:underline"
                        onClick={() => navigate("/login")}
                    >
                        Đăng nhập ngay
                    </span>
                </p>
            </div>
        </div>
    );
}
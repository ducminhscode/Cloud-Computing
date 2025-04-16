import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Apis, { endpoints } from "../configs/Apis";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setIsSubmitting(true);

        try {
            // Gửi yêu cầu đăng ký
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password
            };

            const response = await Apis.post(endpoints.register, payload);

            // Hiển thị thông báo thành công từ backend
            setSuccess(response.data.message || "Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập...");

            // Reset form sau 3 giây và chuyển hướng
            setTimeout(() => {
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                });
                navigate("/login");
            }, 3000);

        } catch (err) {
            // Xử lý các loại lỗi khác nhau từ backend
            if (err.response) {
                if (err.response.data.detail) {
                    // Lỗi từ OpenStack
                    setError(`Lỗi hệ thống: ${err.response.data.detail}`);
                } else if (err.response.data) {
                    // Lỗi validation
                    setError(err.response.data);
                } else {
                    setError("Đã xảy ra lỗi khi đăng ký");
                }
            } else {
                setError("Không thể kết nối đến máy chủ");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Đăng ký tài khoản mới
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Bạn sẽ được tạo một project riêng sau khi đăng ký thành công
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">{success}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Tên người dùng
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Nhập tên người dùng"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Nhập địa chỉ email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                minLength="6"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Nhập lại mật khẩu"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : 'Đăng ký tài khoản'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Đã có tài khoản? </span>
                    <button 
                        onClick={() => navigate("/login")} 
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        </div>
    );
}
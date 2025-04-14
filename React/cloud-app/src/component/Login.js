import { useState } from "react";
import Apis, { endpoints } from "../configs/Apis";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState(null);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await Apis.post(endpoints['login'],
                {
                    "username": username,
                    "password": password
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            setToken(res.data.token);
            console.log("Đăng nhập thành công! Token:", res.data.token);
        } catch (err) {
            setError(err.response?.data?.error || "Lỗi đăng nhập");
        }
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h2>Đăng nhập OpenStack</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Tên người dùng"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                /><br /><br />

                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br /><br />

                <button type="submit">Đăng nhập</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {token && <p><strong>Token:</strong> {token}</p>}
        </div>
    );
}

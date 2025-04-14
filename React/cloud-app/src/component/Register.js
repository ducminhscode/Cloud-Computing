import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/register/", {
        username,
        password,
        email,
      });
      alert("Tạo tài khoản thành công!");
    } catch (err) {
      setError("Lỗi tạo tài khoản");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Đăng ký</button>
      {error && <p>{error}</p>}
    </form>
  );
}

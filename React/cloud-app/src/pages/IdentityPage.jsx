import { useState } from "react";

export default function IdentityPage() {
    const [users, setUsers] = useState([
        { id: 1, name: "User 1", email: "user1@example.com", role: "Admin" },
        { id: 2, name: "User 2", email: "user2@example.com", role: "Member" },
        { id: 3, name: "User 3", email: "user3@example.com", role: "Member" },
    ]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Quản lý Identity</h2>

                {/* Button to add a new user */}
                <div className="text-right mb-4">
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none">
                        Thêm Người Dùng
                    </button>
                </div>

                {/* Table for showing users */}
                <table className="w-full table-auto">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tên</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Vai trò</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-800">{user.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{user.email}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{user.role}</td>
                                <td className="px-4 py-2 text-center">
                                    <button className="text-blue-600 hover:underline">Chi tiết</button>
                                    <button className="ml-4 text-yellow-600 hover:underline">Sửa</button>
                                    <button className="ml-4 text-red-600 hover:underline">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

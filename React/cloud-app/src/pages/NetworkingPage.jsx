import { useState } from "react";

export default function NetworkingPage() {
    const [networks, setNetworks] = useState([
        { id: 1, name: "Network 1", cidr: "192.168.1.0/24", status: "Active" },
        { id: 2, name: "Network 2", cidr: "192.168.2.0/24", status: "Inactive" },
        { id: 3, name: "Network 3", cidr: "192.168.3.0/24", status: "Active" },
    ]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Quản lý Mạng</h2>

                {/* Button to add a new network */}
                <div className="text-right mb-4">
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none">
                        Thêm Mạng
                    </button>
                </div>

                {/* Table for showing networks */}
                <table className="w-full table-auto">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tên</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">CIDR</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {networks.map((network) => (
                            <tr key={network.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-800">{network.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{network.cidr}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{network.status}</td>
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

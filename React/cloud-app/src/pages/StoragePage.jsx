import { useState } from "react";

export default function StoragePage() {
    const [volumes, setVolumes] = useState([
        { id: 1, name: "Volume 1", size: "20 GB", status: "In-use" },
        { id: 2, name: "Volume 2", size: "50 GB", status: "Available" },
        { id: 3, name: "Volume 3", size: "100 GB", status: "In-use" },
    ]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Quản lý Storage</h2>

                {/* Button to add a new volume */}
                <div className="text-right mb-4">
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none">
                        Thêm Volume
                    </button>
                </div>

                {/* Table for showing volumes */}
                <table className="w-full table-auto">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tên</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Kích thước</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {volumes.map((volume) => (
                            <tr key={volume.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-800">{volume.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{volume.size}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{volume.status}</td>
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

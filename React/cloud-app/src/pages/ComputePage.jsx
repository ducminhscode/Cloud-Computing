import { useState } from "react";

export default function ComputePage() {
    const [instances, setInstances] = useState([
        { id: 1, name: "Instance 1", status: "Running", ip: "192.168.1.10" },
        { id: 2, name: "Instance 2", status: "Stopped", ip: "192.168.1.11" },
        { id: 3, name: "Instance 3", status: "Running", ip: "192.168.1.12" },
    ]);
    const [showModal, setShowModal] = useState(false); // State to toggle modal
    const [newInstance, setNewInstance] = useState({ name: "", ip: "" });

    const handleAddInstance = () => {
        setInstances([...instances, { ...newInstance, id: instances.length + 1, status: "Stopped" }]);
        setNewInstance({ name: "", ip: "" }); // Reset the form
        setShowModal(false); // Close the modal
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Quản lý Compute</h2>

                {/* Button to add a new instance */}
                <div className="text-right mb-4">
                    <button
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none"
                        onClick={() => setShowModal(true)} // Show modal
                    >
                        Thêm Instance
                    </button>
                </div>

                {/* Table for showing instances */}
                <table className="w-full table-auto">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tên</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Địa chỉ IP</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instances.map((instance) => (
                            <tr key={instance.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-800">{instance.name}</td>
                                <td className={`px-4 py-2 text-sm font-semibold ${instance.status === "Running" ? "text-green-600" : "text-red-600"}`}>{instance.status}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{instance.ip}</td>
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

            {/* Modal to add new instance */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-semibold text-center mb-4">Thêm Instance Mới</h3>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Tên Instance</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-md"
                                value={newInstance.name}
                                onChange={(e) => setNewInstance({ ...newInstance, name: e.target.value })}
                                placeholder="Nhập tên instance"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Địa chỉ IP</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-md"
                                value={newInstance.ip}
                                onChange={(e) => setNewInstance({ ...newInstance, ip: e.target.value })}
                                placeholder="Nhập địa chỉ IP"
                            />
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={handleAddInstance}
                                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                            >
                                Thêm
                            </button>
                            <button
                                onClick={() => setShowModal(false)} // Close modal
                                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>``
                </div>
            )}
        </div>
    );
}

import React, { useEffect, useState } from "react";
import Apis, { endpoints } from "../configs/Apis";

export default function SnapshotInstancePage() {
    const [snapshots, setSnapshots] = useState([]);
    const [flavors, setFlavors] = useState([]);
    const [networks, setNetworks] = useState([]); // Thêm state cho networks
    const [newSnapshot, setNewSnapshot] = useState({ name: "", description: "" });
    const [instanceId, setInstanceId] = useState("");
    const [loading, setLoading] = useState(false);
    const [restoreModal, setRestoreModal] = useState({ open: false, snapshotId: "", name: "", flavor: "", network: "" }); // Thêm network vào restoreModal

    const token = localStorage.getItem("token");
    const projectId = localStorage.getItem("project_id");

    const headers = {
        "X-Auth-Token": token,
        "X-Project-Id": projectId,
    };

    const fetchSnapshots = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["snapshot-instance"], { headers });
            setSnapshots(Array.isArray(res.data.snapshots) ? res.data.snapshots : []);
        } catch (error) {
            console.error("Failed to fetch snapshots", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFlavors = async () => {
        try {
            const res = await Apis.get(endpoints["flavors"], { headers });
            setFlavors(res.data.flavors || []);
        } catch (err) {
            console.error("Lỗi khi lấy flavors", err);
        }
    };

    const fetchNetworks = async () => {  // Thêm hàm lấy networks
        try {
            const res = await Apis.get(endpoints["networks"], { headers });
            setNetworks(res.data.networks || []);
        } catch (err) {
            console.error("Lỗi khi lấy networks", err);
        }
    };

    const handleCreateSnapshot = async () => {
        try {
            const payload = {
                server_id: instanceId,
                name: newSnapshot.name,
                description: newSnapshot.description,
            };
            await Apis.post(endpoints["snapshot-instance"], payload, { headers });
            alert("Tạo snapshot thành công!");
            setNewSnapshot({ name: "", description: "" });
            setInstanceId("");
            fetchSnapshots();
        } catch (error) {
            alert("Không thể tạo snapshot instance.");
        }
    };

    const handleDeleteSnapshot = async (snapshotId) => {
        if (!window.confirm("Bạn có chắc muốn xoá snapshot này?")) return;
        try {
            await Apis.delete(`${endpoints["snapshot-instance"]}${snapshotId}/`, { headers });
            alert("Đã xoá snapshot.");
            fetchSnapshots();
        } catch (err) {
            alert("Không thể xoá snapshot.");
        }
    };

    const handleRestoreSnapshot = async () => {
        try {
            const payload = {
                snapshot_image_id: restoreModal.snapshotId, // Đảm bảo tên đúng
                name: restoreModal.name,
                flavor_id: restoreModal.flavor, // Đảm bảo tên đúng
                network_ids: [restoreModal.network], // Đảm bảo tên đúng
            };
            await Apis.post(endpoints["snapshots-restore-instance"], payload, { headers });
            alert("Khôi phục instance thành công!");
            setRestoreModal({ open: false, snapshotId: "", name: "", flavor: "", network: "" });
        } catch (err) {
            alert("Lỗi khi khôi phục instance.");
        }
    };

    useEffect(() => {
        fetchSnapshots();
        fetchFlavors();
        fetchNetworks(); // Gọi hàm fetchNetworks
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Snapshot Instance</h1>

            {/* Tạo snapshot */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Tạo Snapshot Instance</h2>
                <input
                    type="text"
                    placeholder="Tên snapshot"
                    value={newSnapshot.name}
                    onChange={e => setNewSnapshot({ ...newSnapshot, name: e.target.value })}
                    className="border p-2 mr-2 mb-2 w-full sm:w-1/3"
                />
                <input
                    type="text"
                    placeholder="Mô tả"
                    value={newSnapshot.description}
                    onChange={e => setNewSnapshot({ ...newSnapshot, description: e.target.value })}
                    className="border p-2 mr-2 mb-2 w-full sm:w-1/3"
                />
                <input
                    type="text"
                    placeholder="Instance ID"
                    value={instanceId}
                    onChange={e => setInstanceId(e.target.value)}
                    className="border p-2 mb-2 w-full sm:w-1/3"
                />
                <button
                    onClick={handleCreateSnapshot}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Tạo Snapshot
                </button>
            </div>

            {/* Danh sách snapshot */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Danh sách Snapshot Instance</h2>
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left py-2">Tên</th>
                                <th className="text-left py-2">Instance ID</th>
                                <th className="text-left py-2">Mô tả</th>
                                <th className="text-left py-2">Trạng thái</th>
                                <th className="text-left py-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {snapshots.map(snapshot => (
                                <tr key={snapshot.id} className="border-t">
                                    <td className="py-2">{snapshot.name || "Unnamed"}</td>
                                    <td className="py-2">{snapshot.server_id}</td>
                                    <td className="py-2">{snapshot.description || "-"}</td>
                                    <td className="py-2">{snapshot.status}</td>
                                    <td className="py-2 space-x-2">
                                        <button
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                            onClick={() => setRestoreModal({ open: true, snapshotId: snapshot.id, name: "", flavor: "", network: "" })}
                                        >
                                            Khôi phục
                                        </button>
                                        <button
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                            onClick={() => handleDeleteSnapshot(snapshot.id)}
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Khôi phục */}
            {restoreModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Khôi phục Instance từ Snapshot</h2>
                        <input
                            type="text"
                            placeholder="Tên instance mới"
                            value={restoreModal.name}
                            onChange={e => setRestoreModal({ ...restoreModal, name: e.target.value })}
                            className="border p-2 mb-4 w-full"
                        />
                        <select
                            value={restoreModal.flavor}
                            onChange={e => setRestoreModal({ ...restoreModal, flavor: e.target.value })}
                            className="border p-2 mb-4 w-full"
                        >
                            <option value="">-- Chọn Flavor --</option>
                            {flavors.map(f => (
                                <option key={f.id} value={f.id}>
                                    {f.name} ({f.vcpus} vCPU, {f.ram}MB RAM)
                                </option>
                            ))}
                        </select>
                        <select
                            value={restoreModal.network}
                            onChange={e => setRestoreModal({ ...restoreModal, network: e.target.value })}
                            className="border p-2 mb-4 w-full"
                        >
                            <option value="">-- Chọn Network --</option>
                            {networks.map(net => (
                                <option key={net.id} value={net.id}>
                                    {net.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setRestoreModal({ open: false, snapshotId: "", name: "", flavor: "", network: "" })}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleRestoreSnapshot}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Khôi phục
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

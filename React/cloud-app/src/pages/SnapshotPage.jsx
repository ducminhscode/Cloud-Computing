import React, { useEffect, useState } from "react";
import axios from "axios";
import Apis, { endpoints } from "../configs/Apis";

export default function SnapshotPage() {
    const [snapshots, setSnapshots] = useState([]);
    const [newSnapshot, setNewSnapshot] = useState({ name: "", description: "", volume_id: "" });
    const [snapshotType, setSnapshotType] = useState("volume");
    const [instanceId, setInstanceId] = useState("");
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");
    const projectId = localStorage.getItem("project_id");

    const headers = {
        "X-Auth-Token": token,
        "X-Project-Id": projectId
    };

    const fetchSnapshots = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints['snapshots'], { headers });
            setSnapshots(res.data.snapshots || []);
        } catch (error) {
            console.error("Failed to fetch snapshots", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSnapshot = async () => {
        try {
            const endpoint = snapshotType === "volume" ? "snapshot-volume" : "snapshot-instance";
            const payload =
                snapshotType === "volume"
                    ? { ...newSnapshot, project_id: projectId }
                    : { server_id: instanceId, name: newSnapshot.name };

            await Apis.post(endpoints[endpoint], payload, { headers });

            alert(`Tạo snapshot ${snapshotType === "volume" ? "volume" : "instance"} thành công`);
            setNewSnapshot({ name: "", description: "", volume_id: "" });
            setInstanceId("");
            fetchSnapshots();
        } catch (error) {
            alert("Không thể tạo snapshot");
        }
    };

    const handleDeleteSnapshot = async (snapshotId) => {
        if (!window.confirm("Bạn có chắc muốn xoá snapshot này không?")) return;
        try {
            await Apis.delete(`${endpoints['snapshots']}${snapshotId}/`, { headers });
            fetchSnapshots();
        } catch (error) {
            alert("Không thể xoá snapshot");
        }
    };

    useEffect(() => {
        fetchSnapshots();
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Snapshot Management</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Tạo Snapshot Mới</h2>

                <div className="mb-4">
                    <label className="mr-2 font-medium">Loại Snapshot:</label>
                    <select
                        value={snapshotType}
                        onChange={(e) => setSnapshotType(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="volume">Volume</option>
                        <option value="instance">Instance</option>
                    </select>
                </div>

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

                {snapshotType === "volume" ? (
                    <input
                        type="text"
                        placeholder="Volume ID"
                        value={newSnapshot.volume_id}
                        onChange={e => setNewSnapshot({ ...newSnapshot, volume_id: e.target.value })}
                        className="border p-2 mb-2 w-full sm:w-1/3"
                    />
                ) : (
                    <input
                        type="text"
                        placeholder="Instance (server) ID"
                        value={instanceId}
                        onChange={e => setInstanceId(e.target.value)}
                        className="border p-2 mb-2 w-full sm:w-1/3"
                    />
                )}

                <button
                    onClick={handleCreateSnapshot}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Tạo Snapshot
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Danh sách Snapshots</h2>
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left py-2">Tên</th>
                                <th className="text-left py-2">Mô tả</th>
                                <th className="text-left py-2">Volume ID</th>
                                <th className="text-left py-2">Trạng thái</th>
                                <th className="text-left py-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {snapshots.map(snapshot => (
                                <tr key={snapshot.id} className="border-t">
                                    <td className="py-2">{snapshot.name || "Unnamed"}</td>
                                    <td className="py-2">{snapshot.description || "-"}</td>
                                    <td className="py-2">{snapshot.volume_id}</td>
                                    <td className="py-2">{snapshot.status}</td>
                                    <td className="py-2">
                                        <button
                                            onClick={() => handleDeleteSnapshot(snapshot.id)}
                                            className="text-red-600 hover:underline"
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
        </div>
    );
}

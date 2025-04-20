import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Apis, { endpoints } from '../configs/Apis';

const StoragePage = () => {
    const [volumes, setVolumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ name: '', size: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchVolumes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const project_id = localStorage.getItem('project_id');
            console.log(project_id);
            const res = await Apis.get(endpoints['volumes'], {
                headers: {
                  'X-Auth-Token': token,
                  'X-Project-Id': project_id
                }
              });
            setVolumes(res.data.volumes || []);
            console.log(res.data.volumes);
        } catch (err) {
            toast.error('Lỗi khi tải danh sách volumes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolumes();
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const project_id = localStorage.getItem('project_id');
            const headers = {
                'X-Auth-Token': token,
                'Content-Type': 'application/json',
                'X-Project-Id': project_id
              };
            if (!form.name || !form.size) {
                toast.warning("Vui lòng nhập đủ tên và kích thước");
                return;
            }

            if (editingId) {
                await Apis.put(`${endpoints['volumes']}${editingId}/`, {
                    name: form.name,
                }, {headers});
                toast.success('Cập nhật volume thành công');
            } else {
                await Apis.post(endpoints['volumes'], form, {headers});
                toast.success('Tạo volume thành công');
            }

            setForm({ name: '', size: '' });
            setEditingId(null);
            fetchVolumes();
        } catch (err) {
            toast.error('Thao tác thất bại');
        }
    };

    const handleEdit = volume => {
        setForm({ name: volume.name, size: volume.size });
        setEditingId(volume.id);
    };

    const handleDelete = async id => {
        if (!window.confirm("Bạn chắc chắn muốn xoá volume này?")) return;

        try {
            const project_id = localStorage.getItem('project_id');
            const token = localStorage.getItem('token');
            await Apis.delete(`${endpoints['volumes']}${id}/`, {
                headers: {
                    'X-Auth-Token': token,
                    'X-Project-Id': project_id
                  }
            });
            toast.success('Đã xoá volume');
            fetchVolumes();
        } catch (err) {
            toast.error('Không thể xoá volume');
        }
    };

    const filteredVolumes = volumes.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Volume</h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-6 bg-white shadow p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Tên volume"
                        value={form.name}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 rounded"
                    />
                    <input
                        type="number"
                        name="size"
                        placeholder="Kích thước (GB)"
                        value={form.size}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 rounded"
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {editingId ? 'Cập nhật Volume' : 'Tạo Volume'}
                </button>
            </form>

            {/* Search */}
            <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc ID..."
                className="w-full mb-4 px-4 py-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Table */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kích thước (GB)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredVolumes.length > 0 ? (
                                    filteredVolumes.map(volume => (
                                        <tr key={volume.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{volume.name}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500">{volume.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{volume.size}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{volume.status}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    className="text-blue-500 hover:underline mr-2"
                                                    onClick={() => handleEdit(volume)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    className="text-red-500 hover:underline"
                                                    onClick={() => handleDelete(volume.id)}
                                                >
                                                    Xoá
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Không tìm thấy volume nào</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoragePage;

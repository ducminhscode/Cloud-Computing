import React, { useEffect, useState } from "react";
import Apis, { endpoints } from "../configs/Apis";

const SecurityGroupPage = () => {
  const [securityGroups, setSecurityGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = {
    "X-Auth-Token": token,
    "Content-Type": "application/json",
  };

  const fetchSecurityGroups = async () => {
    setLoading(true);
    try {
      const res = await Apis.get(endpoints["security-groups"], { headers });
      setSecurityGroups(res.data.security_groups || []);
    } catch (err) {
      console.error("Lỗi khi lấy security groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await Apis.put(endpoints["networks"] + `${editingId}/` + endpoints["security-groups"] , form, { headers });
      } else {
        await Apis.post(endpoints["security-groups"], form, { headers });
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      fetchSecurityGroups();
    } catch (err) {
      console.error("Lỗi khi gửi form:", err);
    }
  };

  const handleEdit = (sg) => {
    if (sg.is_default) {
      alert("Không thể sửa Security Group mặc định.");
      return;
    }
    setForm({ name: sg.name, description: sg.description });
    setEditingId(sg.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá Security Group này?")) return;
    try {
      await Apis.delete(endpoints["networks"] + `${id}/` + endpoints["security-groups"] , { headers });
      fetchSecurityGroups();
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {editingId ? "Cập nhật Security Group" : "Tạo mới Security Group"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-100 p-4 rounded">
        <input
          type="text"
          name="name"
          placeholder="Tên Security Group"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="description"
          placeholder="Mô tả"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? "Cập nhật" : "Tạo mới"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-8 mb-2">Danh sách Security Groups</h3>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Tên</th>
                <th className="px-4 py-2 border">Mô tả</th>
                <th className="px-4 py-2 border">Số rule</th>
                <th className="px-4 py-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {securityGroups.map((sg) => (
                <tr key={sg.id} className="text-center">
                  <td className="border px-4 py-2">{sg.id}</td>
                  <td className="border px-4 py-2">{sg.name}</td>
                  <td className="border px-4 py-2">{sg.description}</td>
                  <td className="border px-4 py-2">
                    {sg.security_group_rules?.length || 0}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button 
                      onClick={() => handleEdit(sg)} 
                      className="text-blue-600 underline"
                      disabled={sg.is_default} // Disable sửa nếu là default
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(sg.id)}
                      className="text-red-600 underline"
                      disabled={sg.is_default} // Disable xóa nếu là default
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {securityGroups.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">
                    Không có security group nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SecurityGroupPage;

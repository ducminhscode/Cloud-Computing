import React, { useEffect, useState } from "react";
import axios from "axios";
import Apis, { endpoints } from "../configs/Apis";

const RouterPage = () => {
  const [routers, setRouters] = useState([]);
  const [form, setForm] = useState({
    name: "",
    admin_state_up: true,
    external_gateway_info: "",
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const headers = {
    "X-Auth-Token": token,
    "Content-Type": "application/json",
  };

  const fetchRouters = async () => {
    try {
      const res = await Apis.get(endpoints["routers"], { headers });
      setRouters(res.data.routers || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchRouters();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      admin_state_up: form.admin_state_up,
    };

    if (form.external_gateway_info) {
      payload.external_gateway_info = form.external_gateway_info;
    }

    try {
      if (editingId) {
        await Apis.put(
          endpoints["networks"] + `${editingId}/` + endpoints["routers"],
          {
            router_name: form.name,
            admin_state_up: form.admin_state_up,
          },
          { headers }
        );
      } else {
        await Apis.post(endpoints["routers"], payload, { headers });
      }

      setForm({ name: "", admin_state_up: true, external_gateway_info: "" });
      setEditingId(null);
      fetchRouters();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleEdit = (router) => {
    setForm({
      name: router.name,
      admin_state_up: router.admin_state_up,
      external_gateway_info: router?.external_gateway_info?.network_id || "",
    });
    setEditingId(router.id);
  };

  const handleDelete = async (router_id) => {
    if (!window.confirm("Bạn có chắc muốn xoá router này?")) return;

    try {
      await Apis.delete(endpoints["networks"] + `${router_id}/` + endpoints["routers"], { headers });
      fetchRouters();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {editingId ? "Cập nhật Router" : "Tạo mới Router"}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-100 p-4 rounded"
      >
        <input
          type="text"
          name="name"
          placeholder="Tên Router"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="external_gateway_info"
            checked={
              form.external_gateway_info ===
              "92aa7f73-8c0a-451b-a6a9-8a516542b7ac"
            }
            onChange={(e) =>
              setForm({
                ...form,
                external_gateway_info: e.target.checked
                  ? "92aa7f73-8c0a-451b-a6a9-8a516542b7ac"
                  : "",
              })
            }
          />
          <span>Kết nối với mạng lưới bên ngoài (mạng: 92aa...7ac)</span>
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingId ? "Cập nhật" : "Tạo mới"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-8 mb-2">Danh sách Router</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 border">ID</th>
              <th className="px-3 py-2 border">Tên</th>
              <th className="px-3 py-2 border">Trạng thái</th>
              <th className="px-3 py-2 border">Gateway</th>
              <th className="px-3 py-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {routers.map((router) => (
              <tr key={router.id} className="text-center">
                <td className="border px-2 py-1">{router.id}</td>
                <td className="border px-2 py-1">{router.name}</td>
                <td className="border px-2 py-1">
                  {router.admin_state_up ? "Hoạt động" : "Không hoạt động"}
                </td>
                <td className="border px-2 py-1">
                  {router?.external_gateway_info?.network_id || "Không có"}
                </td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    onClick={() => handleEdit(router)}
                    className="text-blue-600 underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(router.id)}
                    className="text-red-600 underline"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {routers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  Không có router nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RouterPage;

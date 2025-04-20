import React, { useState, useEffect } from "react";
import axios from "axios";
import Apis, { endpoints } from "../configs/Apis";

const SubnetPage = () => {
  const [subnets, setSubnets] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [form, setForm] = useState({
    name: "",
    cidr: "",
    gateway_ip: "",
    ip_version: 4,
    enable_dhcp: true,
    network_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem("token");

  const headers = {
    "X-Auth-Token": token,
    "Content-Type": "application/json",
  };

  const fetchSubnets = async () => {
    try {
      const res = await Apis.get(endpoints["subnets"], { headers });
      setSubnets(res.data.subnets || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const fetchNetworks = async () => {
    try {
      const res = await Apis.get(endpoints["networks"], { headers });
      setNetworks(res.data.networks || []);
    } catch (error) {
      console.error("Network fetch error:", error);
    }
  };

  useEffect(() => {
    fetchNetworks();
    fetchSubnets();
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
      gateway_ip: form.gateway_ip,
      ip_version: parseInt(form.ip_version),
      enable_dhcp: form.enable_dhcp,
    };

    try {
      if (editingId) {
        await Apis.put(
          endpoints["networks"] + `${editingId}/` + endpoints["subnets"],
          payload,
          { headers }
        );
      } else {
        if (!form.network_id || !form.cidr) {
          alert("Vui lòng nhập đầy đủ network_id và CIDR để tạo subnet.");
          return;
        }

        payload.network_id = form.network_id;
        payload.cidr = form.cidr;

        await Apis.post(endpoints["subnets"], payload, { headers });
      }

      setForm({
        name: "",
        cidr: "",
        gateway_ip: "",
        ip_version: 4,
        enable_dhcp: true,
        network_id: "",
      });
      setEditingId(null);
      fetchSubnets();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleEdit = (subnet) => {
    setForm({
      name: subnet.name,
      cidr: subnet.cidr,
      gateway_ip: subnet.gateway_ip,
      ip_version: subnet.ip_version,
      enable_dhcp: subnet.enable_dhcp,
      network_id: "", // không cho sửa network_id
    });
    setEditingId(subnet.id);
  };

  const handleDelete = async (subnetId) => {
    if (window.confirm("Bạn có chắc muốn xoá subnet này?")) {
      try {
        await Apis.delete(endpoints["networks"] + `${subnetId}/` + endpoints["subnets"], { headers });
        fetchSubnets();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        {editingId ? "Cập nhật Subnet" : "Tạo mới Subnet"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-100 p-4 rounded shadow"
      >
        {!editingId && (
          <select
            name="network_id"
            value={form.network_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Chọn Network</option>
            {networks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name || network.id}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          name="name"
          placeholder="Tên Subnet"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="cidr"
          placeholder="Network Address"
          value={form.cidr}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
          disabled={!!editingId}
        />

        <input
          type="text"
          name="gateway_ip"
          placeholder="Gateway IP"
          value={form.gateway_ip}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <select
          name="ip_version"
          value={form.ip_version}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value={4}>IPv4</option>
          <option value={6}>IPv6</option>
        </select>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="enable_dhcp"
            checked={form.enable_dhcp}
            onChange={handleChange}
          />
          <span>Enable DHCP</span>
        </label>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {editingId ? "Cập nhật" : "Tạo mới"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-8 mb-2">Danh sách Subnet</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 border">ID</th>
              <th className="px-3 py-2 border">Tên</th>
              <th className="px-3 py-2 border">Network Address</th>
              <th className="px-3 py-2 border">IP Gateway</th>
              <th className="px-3 py-2 border">DHCP</th>
              <th className="px-3 py-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {subnets.map((subnet) => (
              <tr key={subnet.id} className="text-center">
                <td className="border px-2 py-1">{subnet.id}</td>
                <td className="border px-2 py-1">{subnet.name}</td>
                <td className="border px-2 py-1">{subnet.cidr}</td>
                <td className="border px-2 py-1">{subnet.gateway_ip}</td>
                <td className="border px-2 py-1">
                  {subnet.enable_dhcp ? "✅" : "❌"}
                </td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    onClick={() => handleEdit(subnet)}
                    className="text-blue-600 underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(subnet.id)}
                    className="text-red-600 underline"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {subnets.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  Không có subnet nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubnetPage;

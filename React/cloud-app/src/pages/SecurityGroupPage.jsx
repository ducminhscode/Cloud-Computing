import React, { useEffect, useState } from "react";
import Apis, { endpoints } from "../configs/Apis";

const SecurityGroupPage = () => {
  const [securityGroups, setSecurityGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [expandedGroupId, setExpandedGroupId] = useState(null); // Cho việc hiện rule
  const [newRule, setNewRule] = useState({
    direction: "ingress",
    protocol: "tcp",
    port_range_min: "",
    port_range_max: "",
    remote_ip_prefix: "",
  });

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
        await Apis.put(
          endpoints["networks"] + `${editingId}/` + endpoints["security-groups"],
          form,
          { headers }
        );
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

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá Security Group này?")) return;
    try {
      await Apis.delete(
        endpoints["networks"] + `${id}/` + endpoints["security-groups"],
        { headers }
      );
      fetchSecurityGroups();
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedGroupId(expandedGroupId === id ? null : id);
  };

  const handleRuleChange = (e) => {
    const { name, value } = e.target;
    setNewRule((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRule = async (groupId) => {
    try {
      const ruleData = {
        security_group_rule: {
          ...newRule,
          security_group_id: groupId,
        },
      };
      await Apis.post(endpoints["security-group-rules"], ruleData, { headers });
      setNewRule({
        direction: "ingress",
        protocol: "tcp",
        port_range_min: "",
        port_range_max: "",
        remote_ip_prefix: "",
      });
      fetchSecurityGroups();
    } catch (err) {
      console.error("Lỗi khi thêm rule:", err);
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
                <React.Fragment key={sg.id}>
                  <tr className="text-center bg-white">
                    <td className="border px-4 py-2">{sg.id}</td>
                    <td className="border px-4 py-2">{sg.name}</td>
                    <td className="border px-4 py-2">{sg.description}</td>
                    <td className="border px-4 py-2">{sg.security_group_rules?.length || 0}</td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleDelete(sg.id)}
                        className="text-red-600 underline"
                        disabled={sg.is_default}
                      >
                        Xoá
                      </button>
                      <button
                        onClick={() => toggleExpand(sg.id)}
                        className="text-green-600 underline"
                      >
                        {expandedGroupId === sg.id ? "Ẩn rules" : "Xem rules"}
                      </button>
                    </td>
                  </tr>

                  {expandedGroupId === sg.id && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 p-4">
                        <h4 className="font-semibold mb-2">Danh sách Rule:</h4>
                        <table className="w-full text-sm border border-gray-300 mb-4">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border px-2 py-1">Protocol</th>
                              <th className="border px-2 py-1">Port Range</th>
                              <th className="border px-2 py-1">Direction</th>
                              <th className="border px-2 py-1">Remote IP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sg.security_group_rules.map((rule, idx) => (
                              <tr key={idx}>
                                <td className="border px-2 py-1">{rule.protocol}</td>
                                <td className="border px-2 py-1">
                                  {rule.port_range_min ?? "All"} - {rule.port_range_max ?? "All"}
                                </td>
                                <td className="border px-2 py-1">{rule.direction}</td>
                                <td className="border px-2 py-1">{rule.remote_ip_prefix}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div className="space-y-2">
                          <h4 className="font-semibold">Thêm Rule mới:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <select
                              name="direction"
                              value={newRule.direction}
                              onChange={handleRuleChange}
                              className="border p-1 rounded"
                            >
                              <option value="ingress">Ingress</option>
                              <option value="egress">Egress</option>
                            </select>
                            <select
                              name="protocol"
                              value={newRule.protocol}
                              onChange={handleRuleChange}
                              className="border p-1 rounded"
                            >
                              <option value="tcp">TCP</option>
                              <option value="udp">UDP</option>
                              <option value="icmp">ICMP</option>
                            </select>
                            <input
                              type="text"
                              name="port_range_min"
                              placeholder="Port min"
                              value={newRule.port_range_min}
                              onChange={handleRuleChange}
                              className="border p-1 rounded"
                            />
                            <input
                              type="text"
                              name="port_range_max"
                              placeholder="Port max"
                              value={newRule.port_range_max}
                              onChange={handleRuleChange}
                              className="border p-1 rounded"
                            />
                            <input
                              type="text"
                              name="remote_ip_prefix"
                              placeholder="Remote IP (vd: 0.0.0.0/0)"
                              value={newRule.remote_ip_prefix}
                              onChange={handleRuleChange}
                              className="border p-1 rounded col-span-2"
                            />
                            <button
                              onClick={() => handleAddRule(sg.id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded col-span-2"
                            >
                              Thêm Rule
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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

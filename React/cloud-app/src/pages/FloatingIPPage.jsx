import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Apis, { endpoints } from "../configs/Apis";

const FloatingIPPage = () => {
  const [floatingIPs, setFloatingIPs] = useState([]);
  const [tempPortIds, setTempPortIds] = useState({});
  const [instances, setInstances] = useState([]);
  const token = localStorage.getItem("token");

  const headers = {
    "X-Auth-Token": token,
    "Content-Type": "application/json",
  };

  const fetchFloatingIPs = async () => {
    try {
      const res = await Apis.get(endpoints["floating-ip"], { headers });
      setFloatingIPs(res.data.floatingips || []);
    } catch (err) {
      toast.error("Không thể tải danh sách Floating IPs");
    }
  };

  const fetchInstances = async () => {
    try {
      const res = await Apis.get(endpoints["instances"], { headers });
      const instances = res.data.servers || [];

      // Lọc các instance chưa có Floating IP (kiểm tra 'addresses' để lấy địa chỉ IP)
      const filteredInstances = instances.filter((instance) => {
        // Kiểm tra nếu 'addresses' có địa chỉ IP không
        return (
          instance.addresses &&
          Object.values(instance.addresses).some((network) =>
            network.some((ip) => ip.addr)
          )
        );
      });

      // Cập nhật danh sách instances đã lọc
      setInstances(filteredInstances);
    } catch (err) {
      toast.error("Không thể tải danh sách instances");
    }
  };

  const createFloatingIP = async () => {
    try {
      await Apis.post(endpoints["floating-ip"], {}, { headers });
      toast.success("Tạo Floating IP thành công!");
      fetchFloatingIPs();
    } catch (err) {
      toast.error("Tạo Floating IP thất bại");
    }
  };

  const deleteFloatingIP = async (id) => {
    if (!window.confirm("Xác nhận xoá Floating IP?")) return;
    try {
      await Apis.delete(`${endpoints["floating-ip"]}/${id}`, { headers });
      toast.success("Đã xoá Floating IP");
      fetchFloatingIPs();
    } catch (err) {
      toast.error("Không thể xoá Floating IP");
    }
  };

  const associateFloatingIP = async (floatingIpId, ipAddress) => {
    if (!ipAddress) {
      toast.error("Vui lòng chọn Instance để gán");
      return;
    }

    try {
      await Apis.post(
        endpoints["floating-ip-associate"],
        {
          floating_ip_id: floatingIpId,
          ip_address: ipAddress,
        },
        { headers }
      );
      toast.success("Gán Floating IP thành công!");
      fetchFloatingIPs();
    } catch (err) {
      toast.error("Không thể gán Floating IP");
    }
  };

  const disassociateFloatingIP = async (floatingIpId) => {
    try {
      await Apis.post(
        endpoints["floating-ip-disassociate"],
        { floating_ip_id: floatingIpId },
        { headers }
      );
      toast.success("Hủy gán Floating IP thành công!");
      fetchFloatingIPs();
    } catch (err) {
      toast.error("Không thể hủy gán Floating IP");
    }
  };

  const handlePortIdChange = (id, value) => {
    setTempPortIds({ ...tempPortIds, [id]: value });
  };

  useEffect(() => {
    fetchFloatingIPs();
    fetchInstances(); // Lấy danh sách các instance chưa có Floating IP
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý Floating IP</h1>

      <div className="mb-4">
        <button
          onClick={createFloatingIP}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tạo Floating IP
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Floating IP</th>
            <th className="border p-2">Port ID</th>
            <th className="border p-2">Fixed IP</th>
            <th className="border p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {floatingIPs.map((ip) => (
            <tr key={ip.id}>
              <td className="border p-2">{ip.id}</td>
              <td className="border p-2">{ip.floating_ip_address}</td>
              <td className="border p-2">{ip.port_id || "-"}</td>
              <td className="border p-2">{ip.fixed_ip_address || "-"}</td>
              <td className="border p-2 space-y-1">
                {ip.port_id ? (
                  <button
                    onClick={() => disassociateFloatingIP(ip.id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded w-full"
                  >
                    Hủy gán
                  </button>
                ) : (
                  <>
                    <select
                      className="border px-2 py-1 rounded mb-1 w-full"
                      value={tempPortIds[ip.id] || ""}
                      onChange={(e) =>
                        handlePortIdChange(ip.id, e.target.value)
                      }
                    >
                      <option value="">-- Chọn Instance --</option>
                      {instances.map((instance) => {
                        // Lấy địa chỉ IP đầu tiên trong phần 'addresses'
                        const ipAddress = Object.values(instance.addresses)
                          .flat()
                          .find((ip) => ip.addr)?.addr;

                        return (
                          <option key={instance.id} value={ipAddress}>
                            {instance.name} ({ipAddress})
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={() =>
                        associateFloatingIP(ip.id, tempPortIds[ip.id])
                      }
                      className="bg-green-600 text-white px-2 py-1 rounded w-full"
                    >
                      Gán IP
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteFloatingIP(ip.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded w-full"
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FloatingIPPage;

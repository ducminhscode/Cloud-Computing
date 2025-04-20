import React, { useState, useEffect } from 'react';
import Apis, { endpoints } from '../configs/Apis';

export default function NetworkingPage() {
  const [name, setName] = useState('');
  const [subnetName, setSubnetName] = useState('');
  const [cidr, setCidr] = useState('');
  const [gatewayIp, setGatewayIp] = useState('');
  const [enableDhcp, setEnableDhcp] = useState(true);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchNetworks = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'X-Auth-Token': token };

      try {
        const res = await Apis.get(endpoints['networks'], { headers });
        setNetworks(res.data.networks || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách mạng:', err);
        setError('Không thể tải danh sách mạng');
      }
    };

    fetchNetworks();
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    if (!name || !subnetName || !cidr || !gatewayIp) {
      setError('Vui lòng điền đầy đủ thông tin để tạo network.');
      setLoading(false);
      return;
    }

    const payload = {
      name,
      subnet_name: subnetName,
      cidr,
      gateway_ip: gatewayIp,
      enable_dhcp: enableDhcp,
    };

    try {
      const response = await Apis.post(endpoints['networks'], payload, {
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setSuccessMessage(`Network "${name}" được tạo thành công!`);
        setName('');
        setSubnetName('');
        setCidr('');
        setGatewayIp('');
      }
    } catch (err) {
      console.error('Chi tiết lỗi:', err);
      setError(`Lỗi từ server: ${err.response?.data?.error || 'Không thể tạo network. Vui lòng thử lại!'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (networkId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const response = await Apis.delete(`${endpoints['networks']}${networkId}/`, {
        headers: {
          'X-Auth-Token': token,
        },
      });

      if (response.status === 204) {
        setSuccessMessage(`Network "${networkId}" đã được xóa thành công!`);
        setNetworks(networks.filter(network => network.id !== networkId));
      }
    } catch (err) {
      console.error('Lỗi khi xóa network:', err);
      setError('Không thể xóa network. Vui lòng thử lại!');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Quản lý Networks</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Tạo Network Mới</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Tên Network</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="my-network"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Tên Subnet</label>
              <input
                type="text"
                value={subnetName}
                onChange={(e) => setSubnetName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="my-subnet"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">CIDR</label>
              <input
                type="text"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="10.0.0.0/24"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Gateway IP</label>
              <input
                type="text"
                value={gatewayIp}
                onChange={(e) => setGatewayIp(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="10.0.0.1"
              />
            </div>

            <div className="mb-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={enableDhcp}
                  onChange={() => setEnableDhcp(!enableDhcp)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Enable DHCP</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Đang tạo...' : 'Tạo Network'}
            </button>
          </form>

          {error && <div className="mt-4 p-4 bg-red-100 text-red-800">{error}</div>}
          {successMessage && <div className="mt-4 p-4 bg-green-100 text-green-800">{successMessage}</div>}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Danh sách Networks</h2>

          {networks.length === 0 ? (
            <div className="text-center text-gray-500">Không có networks nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {networks.map((network) => (
                    <tr key={network.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{network.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{network.id}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button onClick={() => handleDelete(network.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

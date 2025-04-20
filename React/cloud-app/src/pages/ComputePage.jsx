import React, { useState, useEffect } from 'react';
import Apis, { endpoints } from '../configs/Apis';

export default function ComputePage() {
  const [name, setName] = useState('');
  const [imageRef, setImageRef] = useState('');
  const [flavorRef, setFlavorRef] = useState('');
  const [networkId, setNetworkId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [instances, setInstances] = useState([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);

  const [images, setImages] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [networks, setNetworks] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'X-Auth-Token': token };

      try {
        const [imgRes, flavorRes, netRes, instanceRes] = await Promise.all([
          Apis.get(endpoints['image'], { headers }),
          Apis.get(endpoints['flavors'], { headers }),
          Apis.get(endpoints['networks'], { headers }),
          Apis.get(endpoints['instances'], { headers })
        ]);

        setImages(imgRes.data.images || []);
        setFlavors(flavorRes.data.flavors || []);
        setNetworks(netRes.data.networks || []);
        setInstances(instanceRes.data.servers || []);
      } catch (err) {
        console.error('Lỗi khi tải tài nguyên:', err);
      } finally {
        setIsLoadingInstances(false);
      }
    };

    setIsLoadingInstances(true);
    fetchResources();
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
  
    const networkIds = networkId.split(',').map(id => id.trim()).filter(id => id !== '');
  
    if (!name || !imageRef || !flavorRef || networkIds.length === 0) {
      setError("Vui lòng điền đầy đủ thông tin để tạo instance.");
      setLoading(false);
      return;
    }
  
    const payload = {
      name: name,
      source: imageRef,
      flavor: flavorRef,
      network: networkIds,
      select_boot_source: "Image",
      create_new_volume: false,
      delete_volume_instance: false
    };
  
    console.log("Payload gửi lên:", payload);
  
    try {
      const response = await Apis.post(endpoints['instances'], payload, {
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200 || response.status === 202) {
        setSuccessMessage(`Instance "${name}" được tạo thành công!`);
        setName('');
        setImageRef('');
        setFlavorRef('');
        setNetworkId('');
      }
    } catch (err) {
      console.error("Chi tiết lỗi:", err);
      if (err.response) {
        setError(`Lỗi từ server: ${err.response.data?.message || err.response.data?.error || 'Không thể tạo instance. Vui lòng thử lại!'}`);
      } else if (err.request) {
        setError('Không nhận được phản hồi từ server. Kiểm tra kết nối mạng hoặc CORS.');
      } else {
        setError('Lỗi khi thiết lập yêu cầu: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleDelete = async (instanceId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    const headers = {
      'X-Auth-Token': token,
      'Content-Type': 'application/json',
    };

    try {
      const response = await Apis.delete(`${endpoints['instances']}${instanceId}/`, { headers });

      if (response.status === 204) {
        setSuccessMessage(`Instance "${instanceId}" đã được xóa thành công!`);
        setInstances(instances.filter(instance => instance.id !== instanceId));
      }
    } catch (err) {
      console.error("Lỗi khi xóa instance:", err);
      setError('Không thể xóa instance. Vui lòng thử lại!');
    }
  };

  const handleEdit = async (instance) => {
    const newName = prompt("Nhập tên mới cho instance:", instance.name);
    if (!newName || newName === instance.name) return;

    try {
      const token = localStorage.getItem('token');
      await Apis.put(`${endpoints['instances']}${instance.id}/`, { name: newName }, {
        headers: { 'X-Auth-Token': token }
      });

      setSuccessMessage('Đổi tên instance thành công!');
      setInstances((prev) => prev.map((item) => item.id === instance.id ? { ...item, name: newName } : item));
    } catch (err) {
      console.error("Lỗi khi sửa instance:", err);
      setError('Không thể đổi tên. Vui lòng thử lại!');
    }
  };

  

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Quản lý Instances</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Tạo Instance Mới</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Tên Instance</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="my-instance"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Image</label>
                <select
                  value={imageRef}
                  onChange={(e) => setImageRef(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Chọn image</option>
                  {images.map(img => (
                    <option key={img.id} value={img.id}>{img.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Flavor</label>
                <select
                  value={flavorRef}
                  onChange={(e) => setFlavorRef(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Chọn flavor</option>
                  {flavors.map(flv => (
                    <option key={flv.id} value={flv.id}>{flv.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Chọn mạng</label>
              <select
                multiple
                value={networkId.split(',')}
                onChange={(e) => setNetworkId([...e.target.selectedOptions].map(o => o.value).join(','))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                {networks.map(net => (
                  <option key={net.id} value={net.id}>{net.name}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Giữ Ctrl/Command để chọn nhiều mạng</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Đang tạo...' : 'Tạo Instance'}
            </button>
          </form>

          {error && <div className="mt-4 p-4 bg-red-100 text-red-800">{error}</div>}
          {successMessage && <div className="mt-4 p-4 bg-green-100 text-green-800">{successMessage}</div>}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Danh sách Instances</h2>

          {isLoadingInstances ? (
            <div className="text-center">Đang tải...</div>
          ) : instances.length === 0 ? (
            <div className="text-center text-gray-500">Không có instances nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.map((instance) => (
                    <tr key={instance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{instance.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{instance.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 inline-block text-xs font-semibold rounded-full ${
                          instance.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : instance.status === 'ERROR'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'}`}>{instance.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button onClick={() => handleDelete(instance.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                        <button onClick={() => handleEdit(instance)} className="text-blue-600 hover:text-blue-900">Sửa</button>
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

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

  // Lấy danh sách instances khi component mount
  useEffect(() => {
    const fetchInstances = async () => {
      setIsLoadingInstances(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await Apis.get(endpoints['instances'], {
          headers: {
            'X-Auth-Token': token
          }
        });

        if (response.data && response.data.servers) {
          setInstances(response.data.servers);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách instances:", err);
      } finally {
        setIsLoadingInstances(false);
      }
    };

    fetchInstances();
  }, [successMessage]); // Refetch khi có instance mới được tạo

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

    const headers = {
      'X-Auth-Token': token,
      'Content-Type': 'application/json',
    };

    const networkIds = networkId.split(',').map(id => id.trim());

    const payload = {
      name: name,
      imageRef: imageRef,
      flavorRef: flavorRef,
      network_id: networkIds,
    };

    try {
      const response = await Apis.post(endpoints['instances'], payload, {
        headers,
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
      const response = await Apis.delete(`${endpoints['instances']}${instanceId}`, { headers });

      if (response.status === 204) {
        setSuccessMessage(`Instance "${instanceId}" đã được xóa thành công!`);
        setInstances(instances.filter(instance => instance.id !== instanceId));
      }
    } catch (err) {
      console.error("Lỗi khi xóa instance:", err);
      setError('Không thể xóa instance. Vui lòng thử lại!');
    }
  }

  const handleEdit = async (instance) => {
    const newName = prompt("Nhập tên mới cho instance:", instance.name);
    if (!newName || newName === instance.name) return;
  
    try {
      const token = localStorage.getItem('token');
      await Apis.put(`${endpoints['instances']}${instance.id}/`, {
        name: newName
      }, {
        headers: {
          'X-Auth-Token': token
        }
      });
  
      setSuccessMessage('Đổi tên instance thành công!');
      // Refetch hoặc cập nhật local state
      setInstances((prev) =>
        prev.map((item) => item.id === instance.id ? { ...item, name: newName } : item)
      );
    } catch (err) {
      console.error("Lỗi khi sửa instance:", err);
      setError('Không thể đổi tên. Vui lòng thử lại!');
    }
  };
  

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Quản lý Instances</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form tạo instance */}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="my-instance"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Image Reference</label>
                <input
                  type="text"
                  value={imageRef}
                  onChange={(e) => setImageRef(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="b3d22794-5920-4615-a1e2-746e0421018c"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Flavor Reference</label>
                <input
                  type="text"
                  value={flavorRef}
                  onChange={(e) => setFlavorRef(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Network ID</label>
              <input
                type="text"
                value={networkId}
                onChange={(e) => setNetworkId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="afe55a83-3da1-4a8c-b957-5261eb39f34f,57522584-4f32-4423-993f-81c01046dd7a"
              />
              <p className="text-sm text-gray-500 mt-1">Nhập nhiều network ID cách nhau bằng dấu phẩy</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-md transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tạo...
                </span>
              ) : 'Tạo Instance'}
            </button>
          </form>

          {/* Thông báo lỗi/thành công */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p>{successMessage}</p>
            </div>
          )}
        </div>

        {/* Danh sách instances */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Danh sách Instances</h2>

          {isLoadingInstances ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : instances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Không có instances nào được tạo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.map((instance) => (
                    <tr key={instance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {instance.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {instance.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${instance.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : instance.status === 'ERROR'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {instance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleDelete(instance.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => handleEdit(instance)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Sửa
                        </button>
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
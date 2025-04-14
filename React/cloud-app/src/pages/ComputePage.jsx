import React, { useState } from 'react';
import axios from 'axios';

export default function ComputePage() {
  const [name, setName] = useState('');
  const [imageRef, setImageRef] = useState('');
  const [flavorRef, setFlavorRef] = useState('');
  const [networkId, setNetworkId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    console.log(token);
    if (!token) {
      setError('Token không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    const headers = {
      'X-Auth-Token': token,
      'Content-Type': 'application/json',
    };
    
    console.log(headers);

    const payload = {
      name: name,
      imageRef: imageRef,
      flavorRef: flavorRef,
      network_id: networkId,
    };

    try {
      const response = await axios.post(
        'http://192.168.1.20:8000/compute/v2.1/servers',
        payload,
        { headers , withCredentials: true}
      );

      if (response.status === 200 || response.status === 202) {
        setSuccessMessage('Instance được tạo thành công!');
        setName('');
        setImageRef('');
        setFlavorRef('');
        setNetworkId('');
      }
    } catch (err) {
        console.log("ERROR", err);
      if (err.response) {
        setError(`Lỗi từ server: ${err.response.data.error || 'Không thể tạo instance. Vui lòng thử lại!'}`);
      } else {
        setError('Lỗi kết nối. Vui lòng thử lại sau!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
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
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Image Reference</label>
          <input
            type="text"
            value={imageRef}
            onChange={(e) => setImageRef(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Flavor Reference</label>
          <input
            type="text"
            value={flavorRef}
            onChange={(e) => setFlavorRef(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Network ID</label>
          <input
            type="text"
            value={networkId}
            onChange={(e) => setNetworkId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 mt-4 text-white font-bold rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Đang tạo...' : 'Tạo Instance'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Apis, { endpoints } from '../configs/Apis';

const ImagePage = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVisibility, setSelectedVisibility] = useState('all');

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await Apis.get(endpoints['image']);
                console.log("Fetched images:", response.data.images);
                setImages(response.data.images || []);
                
            } catch (error) {
                toast.error('Failed to load images');
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    const filteredImages = images.filter(image => {
        const matchesSearch = image.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            image.id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVisibility = selectedVisibility === 'all' || image.visibility === selectedVisibility;
        return matchesSearch && matchesVisibility;
    });

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Image</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={selectedVisibility}
                            onChange={(e) => setSelectedVisibility(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="shared">Shared</option>
                            <option value="community">Community</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedVisibility('all');
                            }}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredImages.length > 0 ? filteredImages.map(image => (
                                    <tr key={image.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{image.name || 'Unnamed'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">{image.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${image.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    image.status === 'queued' ? 'bg-yellow-100 text-yellow-800' :
                                                        image.status === 'saving' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                {image.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{image.visibility}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{image.size ? formatSize(image.size) : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">{image.disk_format}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Không tìm thấy images</td>
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

export default ImagePage;

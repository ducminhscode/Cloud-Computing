import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Apis, { endpoints } from '../configs/Apis';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NetworkingPage = () => {
    const [networks, setNetworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [networkDetails, setNetworkDetails] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedNetworkId, setSelectedNetworkId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        admin_state_up: true,
        shared: false
    });
    const navigate = useNavigate();

    // Fetch all networks
    const fetchNetworks = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
            const headers = {
                'X-Auth-Token': token,
              };
            const response = await Apis.get(endpoints['networks'], { headers });
            console.log(response.data.networks);
            setNetworks(response.data.networks || []);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to fetch networks");
        } finally {
            setLoading(false);
        }
    };

    // Fetch single network details
    const fetchNetworkDetails = async (networkId) => {
        const token = localStorage.getItem('token');
        const headers = {
            'X-Auth-Token': token,
        }
        try {
            const response = await Apis.get(`${endpoints.networks}${networkId}/`, { headers });
            setNetworkDetails(response.data.network);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to fetch network details");
        }
    };

    // Handle create network
    const handleCreateNetwork = async () => {
        const token = localStorage.getItem('token');
        try {
            const payload = {
                name: formData.name,
                admin_state_up: Boolean(formData.admin_state_up),
                shared: Boolean(formData.shared)
            };

            const headers = {
                'X-Auth-Token': token,
                'Content-Type': 'application/json',
              };

            console.log(payload);
    
            await Apis.post(endpoints['networks'], payload, {
                headers: headers
            });
            
            toast.success("Network created successfully!");
            setShowCreateModal(false);
            fetchNetworks();
            setFormData({
                name: '',
                admin_state_up: true,
                shared: false
            });
        } catch (error) {
            // Improved error logging
            console.error("Create Network Error:", error);
            toast.error(error.response?.data?.error || "Failed to create network");
        }
    };

    // Handle update network
    const handleUpdateNetwork = async () => {
        const token = localStorage.getItem('token');
        const headers = {
            'X-Auth-Token': token,
            'Content-Type': 'application/json',
        }
        try {
            await Apis.put(`${endpoints['networks']}${selectedNetworkId}/`, {
                name: formData.name,
                admin_state_up: formData.admin_state_up
            }, { headers });
            toast.success("Network updated successfully!");
            setShowEditModal(false);
            fetchNetworks();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update network");
        }
    };

    // Handle delete network
    const handleDeleteNetwork = async () => {
        const token = localStorage.getItem('token');
        const headers = {
            'X-Auth-Token': token,
        }
        try {
            await Apis.delete(`${endpoints['networks']}${selectedNetworkId}/`, { headers });
            toast.success("Network deleted successfully!");
            setShowDeleteModal(false);
            fetchNetworks();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete network");
        }
    };

    // Open edit modal and pre-fill form
    const openEditModal = (network) => {
        setSelectedNetworkId(network.id);
        setFormData({
            name: network.name,
            admin_state_up: network.admin_state_up,
            shared: network.shared || false
        });
        setShowEditModal(true);
    };

    // Open delete confirmation modal
    const openDeleteModal = (networkId) => {
        setSelectedNetworkId(networkId);
        setShowDeleteModal(true);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Load networks on component mount
    useEffect(() => {
        fetchNetworks();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Networks Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                    Create New Network
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shared</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {networks.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No networks found</td>
                                </tr>
                            ) : (
                                networks.map((network) => (
                                    <tr key={network.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{network.name}</div>
                                            <div className="text-sm text-gray-500">{network.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${network.admin_state_up ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {network.admin_state_up ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${network.shared ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {network.shared ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedNetworkId(network.id);
                                                    fetchNetworkDetails(network.id);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => openEditModal(network)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(network.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Network Details Modal */}
            {networkDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Network Details</h2>
                            <button
                                onClick={() => setNetworkDetails(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold">Basic Information</h3>
                                <p><span className="font-medium">ID:</span> {networkDetails.id}</p>
                                <p><span className="font-medium">Name:</span> {networkDetails.name}</p>
                                <p><span className="font-medium">Status:</span> {networkDetails.admin_state_up ? 'Active' : 'Inactive'}</p>
                                <p><span className="font-medium">Shared:</span> {networkDetails.shared ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Additional Information</h3>
                                <p><span className="font-medium">Created At:</span> {new Date(networkDetails.created_at).toLocaleString()}</p>
                                <p><span className="font-medium">Updated At:</span> {new Date(networkDetails.updated_at).toLocaleString()}</p>
                                <p><span className="font-medium">MTU:</span> {networkDetails.mtu}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setNetworkDetails(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Network Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Create New Network</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Network Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="admin_state_up"
                                    checked={formData.admin_state_up}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Admin State Up</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="shared"
                                    checked={formData.shared}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Shared Network</label>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateNetwork}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Network Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Network</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Network Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="admin_state_up"
                                    checked={formData.admin_state_up}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Admin State Up</label>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateNetwork}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Confirm Deletion</h2>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>
                        <p className="mb-6">Are you sure you want to delete this network? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteNetwork}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NetworkingPage;
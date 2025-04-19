import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Apis, { endpoints } from '../configs/Apis';

const FlavorPage = () => {
    const [flavors, setFlavors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchFlavors = async () => {
            try {
                const res = await Apis.get(endpoints['flavors']);
                setFlavors(res.data.flavors || []);
            } catch (err) {
                toast.error('Failed to load flavors');
            } finally {
                setLoading(false);
            }
        };

        fetchFlavors();
    }, []);

    const filteredFlavors = flavors.filter(flavor =>
        flavor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flavor.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Flavor Management</h1>

            {/* Search box */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">vCPUs</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RAM (MB)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disk (GB)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Swap</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredFlavors.length > 0 ? filteredFlavors.map(flavor => (
                                    <tr key={flavor.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{flavor.name}</td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">{flavor.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{flavor.vcpus}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{flavor.ram}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{flavor.disk}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{flavor.swap || '0'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No flavors found</td>
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

export default FlavorPage;

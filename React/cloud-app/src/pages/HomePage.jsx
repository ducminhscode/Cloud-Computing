import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();

    const services = [
        {
            name: "Compute (Nova)",
            description: "Quản lý máy chủ ảo với Nova.",
            icon: "fas fa-server",
            color: "bg-blue-600",
            route: "/service/compute",
        },
        {
            name: "Networking (Neutron)",
            description: "Quản lý mạng ảo với Neutron.",
            icon: "fas fa-network-wired",
            color: "bg-green-600",
            route: "/service/networking",
        },
        {
            name: "Storage (Cinder)",
            description: "Quản lý lưu trữ với Cinder.",
            icon: "fas fa-hdd",
            color: "bg-yellow-600",
            route: "/service/storage",
        },
        {
            name: "Identity (Keystone)",
            description: "Quản lý xác thực người dùng với Keystone.",
            icon: "fas fa-user-lock",
            color: "bg-red-600",
            route: "/service/identity",
        },
        {
            name: "Dashboard (Horizon)",
            description: "Giao diện quản lý web với Horizon.",
            icon: "fas fa-tachometer-alt",
            color: "bg-purple-600",
            route: "/service/dashboard",
        },
    ];

    const handleDetailClick = (route) => {
        navigate(route);
    };

    return (
        <div className="min-h-screen bg-white from-indigo-500 via-purple-500 to-pink-500 p-6">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl">
                <h2 className="text-4xl font-extrabold text-center text-blue-700 mb-6">Dịch vụ OpenStack</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-lg shadow-lg ${service.color} text-white flex flex-col items-center space-y-4 transform transition duration-300 hover:scale-105 hover:shadow-2xl`}
                        >
                            <i className={`${service.icon} text-5xl transform transition duration-300 hover:rotate-12`}></i>
                            <h3 className="text-2xl font-semibold">{service.name}</h3>
                            <p className="text-center">{service.description}</p>
                            <button
                                onClick={() => handleDetailClick(service.route)}
                                className="mt-4 bg-white text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-200 focus:outline-none transform transition duration-300 hover:scale-105"
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

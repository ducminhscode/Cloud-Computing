import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const services = [
    {
      name: "Compute (Nova)",
      description:
        "Manage virtual servers with Nova. Create, delete, and manage compute instances with various configurations.",
      icon: "fas fa-server",
      color: "from-blue-500 to-blue-600",
      route: "/service/compute",
      features: [
        "Launch new instances",
        "Manage instance states",
        "Resize instances",
        "Access instance console",
      ],
      api: "compute/v2.1",
    },
    {
      name: "Networking (Neutron)",
      description:
        "Manage virtual networks, subnets, ports, and routers with Neutron networking service.",
      icon: "fas fa-network-wired",
      color: "from-green-500 to-green-600",
      route: "/service/networking",
      features: [
        "Create networks and subnets",
        "Manage security groups",
        "Configure routers",
        "Assign floating IPs",
      ],
      api: "networking/v2.0",
    },
    {
      name: "Storage (Cinder)",
      description:
        "Manage block storage volumes with Cinder. Create snapshots and manage volume attachments.",
      icon: "fas fa-hdd",
      color: "from-yellow-500 to-yellow-600",
      route: "/service/storage",
      features: [
        "Create and manage volumes",
        "Take volume snapshots",
        "Attach/detach volumes",
        "Extend volume size",
      ],
      api: "volume/v3",
    },
    {
      name: "Images (Glance)",
      description:
        "Manage disk images with Glance. Upload, manage, and discover available images.",
      icon: "fas fa-images",
      color: "from-purple-500 to-purple-600",
      route: "/service/images",
      features: [
        "Upload new images",
        "Manage image metadata",
        "Create image snapshots",
        "Share images across projects",
      ],
      api: "image/v2",
    },
    {
      name: "Flavors (Nova)",
      description:
        "Manage virtual machine flavors including CPU, RAM, and disk sizes.",
      icon: "fas fa-layer-group",
      color: "from-indigo-500 to-indigo-600",
      route: "/service/flavors",
      features: [
        "List available flavors",
        "Define custom flavors",
        "Delete unused flavors",
        "View flavor specs",
      ],
      api: "compute/v2.1/flavors",
    },
    {
      name: "Snapshots (Cinder)",
      description: "Manage volume snapshots for backup and recovery purposes.",
      icon: "fas fa-camera-retro",
      color: "from-pink-500 to-pink-600",
      route: "/service/snapshots",
      features: [
        "Create snapshots of volumes",
        "View snapshot list and details",
        "Delete unused snapshots",
        "Restore volumes from snapshots",
      ],
      api: "volume/v3/snapshots",
    },
  ];

  const handleDetailClick = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            OpenStack Management Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive interface to manage all your OpenStack services and resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`bg-white bg-opacity-80 rounded-2xl shadow-xl overflow-hidden border border-gray-200 p-6 hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-105 backdrop-blur`}
            >
              <div className="flex items-center mb-4">
                <div className={`text-white bg-gradient-to-r ${service.color} p-3 rounded-full shadow-lg`}>
                  <i className={`${service.icon} text-2xl`}></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-500">API: {service.api}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{service.description}</p>
              <ul className="text-sm space-y-1 text-gray-600 mb-4">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleDetailClick(service.route)}
                className="w-full bg-gradient-to-r from-white via-gray-100 to-white text-gray-800 py-2 px-4 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-100 transition"
              >
                Manage Service →
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <button onClick={() => navigate("/service/compute/create")}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-6 rounded-lg transition-colors text-left">
              <i className="fas fa-plus-circle text-2xl mb-2"></i>
              <h3 className="font-bold text-lg">New Instance</h3>
              <p className="text-sm">Launch a new virtual server</p>
            </button>
            <button onClick={() => navigate("/service/storage/create")}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-6 rounded-lg transition-colors text-left">
              <i className="fas fa-hdd text-2xl mb-2"></i>
              <h3 className="font-bold text-lg">New Volume</h3>
              <p className="text-sm">Create block storage volume</p>
            </button>
            <button onClick={() => navigate("/service/networking/create")}
              className="bg-green-100 hover:bg-green-200 text-green-800 p-6 rounded-lg transition-colors text-left">
              <i className="fas fa-network-wired text-2xl mb-2"></i>
              <h3 className="font-bold text-lg">New Network</h3>
              <p className="text-sm">Create virtual network</p>
            </button>
            <button onClick={() => navigate("/service/images/upload")}
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-6 rounded-lg transition-colors text-left">
              <i className="fas fa-cloud-upload-alt text-2xl mb-2"></i>
              <h3 className="font-bold text-lg">Upload Image</h3>
              <p className="text-sm">Add new disk image</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

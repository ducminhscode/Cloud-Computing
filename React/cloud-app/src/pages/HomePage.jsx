import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const services = [
    {
      name: "Máy chủ ảo (Nova)",
      description:
        "Quản lý máy chủ ảo với Nova. Tạo, xoá và quản lý các instance với nhiều cấu hình khác nhau.",
      icon: "fas fa-server",
      color: "from-blue-500 to-blue-600",
      route: "/service/compute",
      features: [
        "Khởi tạo instance mới",
        "Quản lý trạng thái instance",
        "Thay đổi kích thước instance",
        "Truy cập console của instance",
      ],
      api: "compute/v2.1",
    },
    {
      name: "Mạng ảo (Neutron)",
      description:
        "Quản lý mạng ảo, subnet, cổng mạng và router với dịch vụ Neutron.",
      icon: "fas fa-network-wired",
      color: "from-green-500 to-green-600",
      route: "/service/networking",
      features: [
        "Tạo mạng và subnet",
        "Quản lý nhóm bảo mật",
        "Cấu hình router",
        "Gán địa chỉ IP nổi (Floating IP)",
      ],
      api: "networking/v2.0",
    },
    {
      name: "Lưu trữ khối (Cinder)",
      description:
        "Quản lý ổ đĩa lưu trữ khối với Cinder. Tạo snapshot và quản lý việc gắn kết volume.",
      icon: "fas fa-hdd",
      color: "from-yellow-500 to-yellow-600",
      route: "/service/storage",
      features: [
        "Tạo và quản lý volume",
        "Tạo bản snapshot của volume",
        "Gắn / tháo volume",
        "Mở rộng dung lượng volume",
      ],
      api: "volume/v3",
    },
    {
      name: "Ảnh đĩa (Glance)",
      description:
        "Quản lý ảnh đĩa hệ điều hành với Glance. Tải lên, quản lý và tìm kiếm ảnh sẵn có.",
      icon: "fas fa-images",
      color: "from-purple-500 to-purple-600",
      route: "/service/images",
      features: [
        "Tải ảnh mới lên",
        "Quản lý metadata ảnh",
        "Tạo snapshot từ ảnh",
        "Chia sẻ ảnh giữa các dự án",
      ],
      api: "image/v2",
    },
    {
      name: "Flavor máy ảo (Nova)",
      description:
        "Quản lý các flavor của máy ảo bao gồm CPU, RAM và dung lượng đĩa.",
      icon: "fas fa-layer-group",
      color: "from-indigo-500 to-indigo-600",
      route: "/service/flavors",
      features: [
        "Liệt kê các flavor sẵn có",
        "Định nghĩa flavor tùy chỉnh",
        "Xoá các flavor không dùng",
        "Xem thông số kỹ thuật flavor",
      ],
      api: "compute/v2.1/flavors",
    },
    {
      name: "Snapshot (Cinder)",
      description: "Quản lý các snapshot của volume phục vụ sao lưu và khôi phục.",
      icon: "fas fa-camera-retro",
      color: "from-pink-500 to-pink-600",
      route: "/service/snapshots",
      features: [
        "Tạo snapshot từ volume",
        "Xem danh sách và chi tiết snapshot",
        "Xoá các snapshot không dùng",
        "Khôi phục volume từ snapshot",
      ],
      api: "volume/v3/snapshots",
    },
    {
      name: "Router (Neutron)",
      description: "Quản lý các router trong mạng ảo, cấu hình gateway và routing.",
      icon: "fas fa-network-wired",
      color: "from-blue-800 to-red-600",
      route: "/service/routers",
      features: [
        "Tạo router mới với tên và trạng thái",
        "Cấu hình gateway ngoài (external network)",
        "Xem danh sách và chi tiết router",
        "Cập nhật hoặc xoá router"
      ],
      api: "networking/v2.0/routers"
    },
    {
      name: "Security Group (Neutron)",
      description: "Quản lý các security groups để bảo vệ tài nguyên mạng.",
      icon: "fas fa-shield-alt",
      color: "from-yellow-500 to-orange-600",
      route: "/service/security-groups",
      features: [
        "Xem danh sách Security Groups",
        "Xem số lượng và chi tiết các rule",
        "Tạo hoặc xoá Security Group (tuỳ chọn)",
        "Quản lý rule của từng Security Group"
      ],
      api: "networking/v2.0/security-groups"
    },
    {
      name: "Subnet (Neutron)",
      description: "Quản lý các subnet trong mạng Neutron để phân chia và cấp phát IP cho các tài nguyên trong mạng.",
      icon: "fas fa-network-wired",
      color: "from-blue-500 to-teal-600",
      route: "/service/subnets",
      features: [
        "Xem danh sách các Subnet",
        "Xem chi tiết thông tin subnet (IP range, gateway, DHCP)",
        "Tạo mới, cập nhật hoặc xoá Subnet",
        "Quản lý các thuộc tính của từng subnet như DHCP, gateway IP"
      ],
      api: "networking/v2.0/subnets"
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
            Bảng điều khiển quản lý OpenStack
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Giao diện toàn diện để quản lý tất cả các dịch vụ và tài nguyên OpenStack của bạn
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
                Quản lý dịch vụ →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

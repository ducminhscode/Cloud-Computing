import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const services = [
    {
      name: "Máy chủ ảo (Nova)",
      description:
        "Quản lý và vận hành máy chủ ảo thông qua Nova. Cung cấp các chức năng tạo, xóa và quản lý các instance với nhiều cấu hình phần cứng khác nhau.",
      icon: "fas fa-server",
      color: "from-blue-500 to-blue-600",
      route: "/service/compute",
      features: [
        "Tạo mới instance với cấu hình tùy chỉnh",
        "Quản lý trạng thái các instance (khởi động, dừng, tạm dừng)",
        "Thay đổi cấu hình phần cứng của instance (flavor)",
        "Truy cập console và quản lý trực tiếp instance",
      ],
      api: "compute/v2.1",
    },    
    {
      "name": "Mạng ảo (Neutron)",
      "description": "Quản lý mạng ảo, subnet, cổng mạng và router với dịch vụ Neutron. Tạo và quản lý các mạng, subnet, và các cài đặt IP cho môi trường OpenStack.",
      "icon": "fas fa-network-wired",
      "color": "from-green-500 to-green-600",
      "route": "/service/networking",
      "features": [
        "Tạo mạng và subnet",
        "Quản lý DHCP",
        "Cấu hình cổng mạng và gateway",
        "Gán địa chỉ IP nổi (Floating IP)",
        "Xóa và quản lý các mạng hiện có"
      ],
      "api": "networking/v2.0"
    },    
    {
      name: "Lưu trữ khối (Cinder)",
      description:
        "Quản lý các ổ đĩa lưu trữ khối với Cinder. Tạo và quản lý các volume, tạo bản snapshot của volume, và thực hiện thao tác gắn / tháo volume.",
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
        "Quản lý các ảnh đĩa hệ điều hành với Glance. Tải lên, tìm kiếm và quản lý metadata ảnh, tạo snapshot từ ảnh và chia sẻ ảnh giữa các dự án.",
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
        "Quản lý các flavor máy ảo, bao gồm các thông số như CPU (vCPUs), RAM, dung lượng đĩa và swap. Cho phép liệt kê, tìm kiếm, và xoá các flavor không dùng, cũng như xem chi tiết thông số kỹ thuật của từng flavor.",
      icon: "fas fa-layer-group",
      color: "from-indigo-500 to-indigo-600",
      route: "/service/flavors",
      features: [
        "Liệt kê các flavor sẵn có",
        "Tìm kiếm các flavor theo tên hoặc ID",
        "Xoá các flavor không dùng",
        "Xem thông số kỹ thuật flavor (vCPUs, RAM, Disk, Swap)",
      ],
      api: "compute/v2.1/flavors",
    },    
    {
      name: "Snapshot (Cinder)",
      description:
        "Quản lý các snapshot của volume và instance phục vụ cho các mục đích sao lưu và khôi phục. Cho phép người dùng tạo snapshot từ volume hoặc instance, xem danh sách và chi tiết snapshot, xoá các snapshot không còn sử dụng, và khôi phục volume hoặc instance từ snapshot đã tạo.",
      icon: "fas fa-camera-retro",
      color: "from-pink-500 to-pink-600",
      route: "/service/snapshots",
      features: [
        "Tạo snapshot từ volume hoặc instance",
        "Xem danh sách và chi tiết snapshot",
        "Xoá các snapshot không dùng",
        "Khôi phục volume hoặc instance từ snapshot",
      ],
      api: "volume/v3/snapshots",
    },    
    {
      name: "Router (Neutron)",
      description:
        "Quản lý các router trong mạng ảo, cho phép người dùng tạo mới, cập nhật, và xoá các router. Cấu hình gateway ngoài (external network), cũng như thêm và xoá các interfaces (subnet) gắn liền với router. Ngoài ra, người dùng có thể xem danh sách các router hiện tại cùng với thông tin chi tiết như trạng thái hoạt động và gateway kết nối.",
      icon: "fas fa-network-wired",
      color: "from-blue-800 to-red-600",
      route: "/service/routers",
      features: [
        "Tạo router mới với tên và trạng thái hoạt động",
        "Cấu hình gateway ngoài (external network) cho router",
        "Thêm và xoá interfaces từ subnet cho router",
        "Xem danh sách và chi tiết của các router",
        "Cập nhật hoặc xoá router",
      ],
      api: "networking/v2.0/routers",
    },    
    {
      name: "Security Group (Neutron)",
      description: "Quản lý các nhóm bảo mật (Security Groups) trong mạng ảo, bao gồm tạo mới, cập nhật, xoá nhóm bảo mật và quản lý các quy tắc (rules) bảo mật cho từng nhóm.",
      icon: "fas fa-shield-alt",
      color: "from-yellow-500 to-orange-600",
      route: "/service/security-groups",
      features: [
        "Xem danh sách Security Groups đã tạo",
        "Xem số lượng và chi tiết các rule bảo mật của từng Security Group",
        "Tạo mới hoặc xoá Security Group (trừ nhóm mặc định)",
        "Quản lý các quy tắc bảo mật (rules) cho từng Security Group"
      ],
      api: "networking/v2.0/security-groups"
    },    
    {
      name: "Subnet (Neutron)",
      description: "Quản lý các subnet trong mạng ảo Neutron, bao gồm việc tạo mới, cập nhật và xoá subnet, cùng với việc quản lý các thuộc tính như địa chỉ mạng (CIDR), Gateway IP, DHCP, và phiên bản IP (IPv4 hoặc IPv6).",
      icon: "fas fa-network-wired",
      color: "from-blue-500 to-teal-600",
      route: "/service/subnets",
      features: [
        "Xem danh sách các Subnet đã tạo",
        "Xem chi tiết thông tin của từng Subnet như Network Address, Gateway IP, và trạng thái DHCP",
        "Tạo mới, cập nhật hoặc xoá Subnet (có thể chọn network_id và CIDR khi tạo mới)",
        "Quản lý các thuộc tính của Subnet như DHCP, Gateway IP và phiên bản IP"
      ],
      api: "networking/v2.0/subnets"
    },    
    {
      name: "Floating IP (Neutron)",
      description: "Quản lý các địa chỉ Floating IP trong mạng Neutron, cho phép gán hoặc hủy gán các Floating IP vào các tài nguyên như port, VM (instance). Các hành động bao gồm tạo mới, gán, hủy gán, và xoá Floating IP không còn sử dụng.",
      icon: "fas fa-globe",
      color: "from-blue-500 to-indigo-600",
      route: "/service/floating-ip",
      features: [
        "Xem danh sách các Floating IP đã tạo",
        "Tạo mới Floating IP cho các tài nguyên",
        "Gán (Associate) Floating IP cho port (VM, instance) từ danh sách các instance chưa có Floating IP",
        "Huỷ gán (Disassociate) Floating IP khỏi port hoặc VM",
        "Xoá Floating IP không còn sử dụng"
      ],
      api: "networking/v2.0/floatingips"
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

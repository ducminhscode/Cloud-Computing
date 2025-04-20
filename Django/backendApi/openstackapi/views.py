import requests
from celery.schedules import schedule
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from backend.settings import URL_AUTH


class LoginKeystone(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        keystone_url = f"{URL_AUTH}/identity/v3"  # sửa IP cho đúng

        # Bước 1: Lấy unscoped token
        unscoped_payload = {
            "auth": {
                "identity": {
                    "methods": ["password"],
                    "password": {
                        "user": {
                            "name": username,
                            "domain": {"id": "default"},
                            "password": password
                        }
                    }
                }
            }
        }

        try:
            # Gửi request lấy unscoped token
            unscoped_res = requests.post(
                f"{keystone_url}/auth/tokens",
                json=unscoped_payload
            )

            if unscoped_res.status_code != 201:
                return Response({"error": "Sai username hoặc password"},
                                status=status.HTTP_401_UNAUTHORIZED)

            unscoped_token = unscoped_res.headers["X-Subject-Token"]

            # Bước 2: Dùng unscoped token lấy danh sách project của user
            project_res = requests.get(
                f"{keystone_url}/auth/projects",
                headers={"X-Auth-Token": unscoped_token}
            )

            if project_res.status_code != 200:
                return Response({"error": "Không thể lấy danh sách project"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            projects = project_res.json().get("projects", [])
            if not projects:
                return Response({"error": "Người dùng chưa thuộc project nào"},
                                status=status.HTTP_403_FORBIDDEN)

            # Chọn project đầu tiên (có thể sửa để user chọn project cụ thể)
            selected_project = projects[0]
            project_id = selected_project["id"]
            project_name = selected_project["name"]

            # Bước 3: Lấy scoped token từ project ID
            scoped_payload = {
                "auth": {
                    "identity": {
                        "methods": ["password"],
                        "password": {
                            "user": {
                                "name": username,
                                "domain": {"id": "default"},
                                "password": password
                            }
                        }
                    },
                    "scope": {
                        "project": {
                            "id": project_id
                        }
                    }
                }
            }

            scoped_res = requests.post(
                f"{keystone_url}/auth/tokens",
                json=scoped_payload
            )

            if scoped_res.status_code != 201:
                return Response({"error": "Lỗi lấy scoped token"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            scoped_token = scoped_res.headers["X-Subject-Token"]
            user_info = scoped_res.json()["token"]["user"]

            return Response({
                "token": scoped_token,
                "user": user_info["name"],
                "project": project_name,
                "project_id": project_id
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)

def get_admin_token():
    keystone_url = f"{URL_AUTH}/identity/v3/auth/tokens"

    auth_data = {
        "auth": {
            "identity": {
                "methods": ["password"],
                "password": {
                    "user": {
                        "name": "admin",
                        "domain": {"name": "default"},
                        "password": "chuong"
                    }
                }
            },
            "scope": {
                "project": {
                    "name": "admin",
                    "domain": {"id": "default"}
                }
            }
        }
    }

    headers = {
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(keystone_url, json=auth_data, headers=headers)

        if response.status_code == 201:
            token = response.headers.get('X-Subject-Token')
            if not token:
                raise ValidationError("Không thể lấy token từ phản hồi.")
            return token
        else:
            raise ValidationError(f"Không thể lấy token. Lỗi: {response.text}")

    except requests.exceptions.RequestException as e:
        raise ValidationError(f"Lỗi kết nối với OpenStack Keystone: {str(e)}")


class RegisterAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not email or not password:
            raise ValidationError("Tất cả các trường đều phải được điền đầy đủ.")

        keystone_url = f"{URL_AUTH}/identity/v3"
        admin_token = get_admin_token()
        headers = {
            'Content-Type': 'application/json',
            'X-Auth-Token': admin_token
        }

        project_data = {
            "project": {
                "name": username + "_project_" + email,
                "description": f"Project cho người dùng {username}",
                "enabled": True
            }
        }

        try:
            # Gửi yêu cầu POST đến Keystone để tạo project mới
            response = requests.post(f"{keystone_url}/projects", json=project_data, headers=headers)
            if response.status_code == 201:
                project_data = response.json()
                project_id = project_data["project"]["id"]
            else:
                raise ValidationError(f"Không thể tạo project. Lỗi: {response.text}")


            user_data = {
                "user": {
                    "default_project_id": project_id,
                    "domain_id": "default",
                    "enabled": True,
                    "name": username,
                    "password": password,
                    "description": "Người dùng mới",
                    "email": email
                }
            }
            response = requests.post(f"{keystone_url}/users", json=user_data, headers=headers)

            if response.status_code == 201:
                user_data = response.json()
                user_id = user_data["user"]["id"]

                # Lấy role "member"
                role_response = requests.get(f"{keystone_url}/roles?name=member", headers=headers)
                if role_response.status_code == 200:
                    roles = role_response.json().get("roles", [])
                    if roles:
                        role_id = roles[0]["id"]

                        # Gán role cho user vào project
                        assign_role_url = f"{keystone_url}/projects/{project_id}/users/{user_id}/roles/{role_id}"
                        assign_response = requests.put(assign_role_url, headers=headers)

                        if assign_response.status_code == 204:
                            return Response({
                                "message": "Người dùng và project đã được tạo, đã gán quyền thành công."
                            }, status=status.HTTP_201_CREATED)
                        else:
                            raise ValidationError(f"Không thể gán quyền. Lỗi: {assign_response.text}")
                    else:
                        raise ValidationError("Không tìm thấy role 'member'")
                else:
                    raise ValidationError(f"Lỗi khi lấy role 'member': {role_response.text}")

        except requests.exceptions.RequestException as e:
            raise ValidationError(f"Lỗi kết nối với OpenStack Keystone: {str(e)}")


class InstancesAPIView(APIView):
    def get(self, request, id=None):
        try:
            # Lấy token admin
            token = request.headers.get("X-Auth-Token")

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            if id:
                url = f"{URL_AUTH}/compute/v2.1/servers/{id}"
                res = requests.get(url, headers=headers)
            else:
                res = requests.get(f"{URL_AUTH}/compute/v2.1/servers/detail", headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không lấy được danh sách instances"}, status=res.status_code)
            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            token = request.headers.get("X-Auth-Token")
            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            # Lấy dữ liệu từ request
            name = request.data.get("name")
            availability_zone = request.data.get("availability_zone", "nova")

            select_boot_source = request.data.get("select_boot_source", "Image")
            create_new_volume = request.data.get("create_new_volume", True)
            volume_size = request.data.get("volume_size", 1)
            delete_volume_instance = request.data.get("delete_volume_instance", False)
            source = request.data.get("source")

            flavor = request.data.get("flavor")
            network = request.data.get("network", [])
            security_group = request.data.get("security_group", [])
            key_pair = request.data.get("key_name")

            if not all([name, source, flavor, network]):
                return Response({"error": "Thiếu thông tin để tạo instance"}, status=400)

            # Chuẩn bị các phần payload
            networks = [{"uuid": net_id} for net_id in network]
            security_groups = [{"name": sg_id} for sg_id in security_group]  # 'name' chứ không phải 'sg'

            server_data = {
                "name": name,
                "flavorRef": flavor,
                "networks": networks,
                "availability_zone": availability_zone,
            }

            if security_groups:
                server_data["security_groups"] = security_groups

            if key_pair:
                server_data["key_name"] = key_pair

            # Xử lý boot source
            if select_boot_source == "Image" and not create_new_volume:
                # Boot trực tiếp từ image
                server_data["imageRef"] = source

            elif select_boot_source == "Image" and create_new_volume:
                # Boot từ image qua volume
                server_data["block_device_mapping_v2"] = [{
                    "boot_index": "0",
                    "uuid": source,
                    "source_type": "image",
                    "destination_type": "volume",
                    "volume_size": volume_size,
                    "delete_on_termination": delete_volume_instance
                }]
            elif select_boot_source == "Volume":
                # Boot từ volume có sẵn
                server_data["block_device_mapping_v2"] = [{
                    "boot_index": "0",
                    "uuid": source,
                    "source_type": "volume",
                    "destination_type": "volume",
                    "delete_on_termination": delete_volume_instance
                }]
            else:
                return Response({"error": "Kiểu boot source không hợp lệ"}, status=400)

            payload = {"server": server_data}

            NOVA_URL = f"{URL_AUTH}/compute/v2.1/servers"
            res = requests.post(NOVA_URL, headers=headers, json=payload)

            if res.status_code not in [200, 202]:
                return Response({
                    "error": "Không thể tạo instance",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=res.status_code)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, id):
        try:
            token = request.headers.get("X-Auth-Token")
            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            # Ví dụ: đổi tên instance
            new_name = request.data.get("name")
            payload = {
                "server": {
                    "name": new_name
                }
            }

            NOVA_URL = f"{URL_AUTH}/compute/v2.1/servers/{id}"
            res = requests.put(NOVA_URL, headers=headers, json=payload)

            if res.status_code != 200:
                return Response({"error": "Không thể cập nhật instance"}, status=res.status_code)

            return Response({"message": "Cập nhật instance thành công"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, id):
        try:
            token = request.headers.get("X-Auth-Token")
            headers = {
                "X-Auth-Token": token
            }

            NOVA_URL = f"{URL_AUTH}/compute/v2.1/servers/{id}"
            res = requests.delete(NOVA_URL, headers=headers)

            if res.status_code != 204:
                return Response({"error": "Không thể xóa instance"}, status=res.status_code)

            return Response({"message": "Xóa instance thành công"}, status=204)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class SecurityGroupAPIView(APIView):
    def get(self, request):
        try:
            token = request.headers.get("X-Auth-Token")
            if not token:
                return Response({"error": "Token không được cung cấp"}, status=401)

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            url = f"{URL_AUTH}:9696/networking/v2.0/security-groups"
            res = requests.get(url, headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không lấy được danh sách security groups"}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class KeyPairAPIView(APIView):
    def get(self, request):
        try:
            token = request.headers.get("X-Auth-Token")
            if not token:
                return Response({"error": "Token không được cung cấp"}, status=401)

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            url = f"{URL_AUTH}/compute/v2.1/os-keypairs"
            res = requests.get(url, headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không lấy được danh sách key pairs"}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            token = request.headers.get("X-Auth-Token")
            if not token:
                return Response({"error": "Token không được cung cấp"}, status=401)

            key_name = request.data.get("key_name")
            key_type = request.data.get("key_type", "SSH Key")  # mặc định là "ssh"

            if not key_name:
                return Response({"error": "Thiếu tên key pair"}, status=400)

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            payload = {
                "keypair": {
                    "name": key_name,
                    "type": key_type
                }
            }

            url = f"{URL_AUTH}/compute/v2.1/os-keypairs"
            res = requests.post(url, headers=headers, json=payload)

            if res.status_code not in [200, 201]:
                return Response({
                    "error": "Không thể tạo key pair",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=res.status_code)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, key_name):
        try:
            token = request.headers.get("X-Auth-Token")
            if not token:
                return Response({"error": "Token không được cung cấp"}, status=401)

            if not key_name:
                return Response({"error": "Thiếu tên key pair để xóa"}, status=400)

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            url = f"{URL_AUTH}/compute/v2.1/os-keypairs/{key_name}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 202:
                return Response({
                    "error": "Không thể xóa key pair",
                    "details": res.json() if res.content else {}
                }, status=res.status_code)

            return Response({"message": f"Key pair '{key_name}' đã được xóa thành công."}, status=202)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class FlavorAPIView(APIView):
    def get(self, request):
        headers = {
            "X-Auth-Token": get_admin_token(),
            "Content-Type": "application/json"
        }

        try:
            url = f"{URL_AUTH}/compute/v2.1/flavors/detail"
            res = requests.get(url, headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không thể lấy danh sách flavor"}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class NetworkAPIView(APIView):
    def get(self, request, network_id=None):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token
        }

        try:
            if network_id:
                url = f"{URL_AUTH}:9696/networking/v2.0/networks/{network_id}"
                res = requests.get(url, headers=headers)
            else:
                res = requests.get(f"{URL_AUTH}:9696/networking/v2.0/networks/", headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không thể lấy danh sách network"}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }
        try:
            data = request.data

            network_name = data.get("name")
            subnet_name = data.get("subnet_name")
            network_cidr = data.get("cidr")
            gateway_ip = data.get("gateway_ip")
            enable_dhcp = data.get("enable_dhcp", True)

            # 1. Tạo network
            network_payload = {
                "network": {
                    "name": network_name,
                    "admin_state_up": True,
                    "shared": False
                }
            }

            net_res = requests.post(f"{URL_AUTH}:9696/networking/v2.0/networks", headers=headers, json=network_payload)
            if net_res.status_code != 201:
                return Response({
                    "error": "Không thể tạo network",
                    "details": net_res.json()
                }, status=net_res.status_code)

            network_id = net_res.json()["network"]["id"]

            # 2. Tạo subnet cho network
            subnet_payload = {
                "subnet": {
                    "network_id": network_id,
                    "ip_version": 4,
                    "cidr": network_cidr,
                    "name": subnet_name,
                    "enable_dhcp": enable_dhcp,
                    "gateway_ip": gateway_ip
                }
            }

            subnet_res = requests.post(f"{URL_AUTH}:9696/networking/v2.0/subnets", headers=headers, json=subnet_payload)
            if subnet_res.status_code != 201:
                return Response({
                    "error": "Không thể tạo subnet",
                    "details": subnet_res.json()
                }, status=subnet_res.status_code)

            return Response({
                "network": net_res.json()["network"],
                "subnet": subnet_res.json()["subnet"]
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, network_id):
        try:
            token = request.headers.get("X-Auth-Token")
            if not token:
                return Response({"error": "Thiếu X-Auth-Token"}, status=401)

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            network_name = request.data.get("name")
            admin_state_up = request.data.get("admin_state_up", True)
            payload = {
                "network": {
                    "name": network_name,
                    "admin_state_up": admin_state_up
                }
            }

            # Lấy thông tin cần cập nhật từ request
            if not payload:
                return Response({"error": "Không có dữ liệu cập nhật"}, status=400)

            # Gửi request đến Neutron API
            url = f"{URL_AUTH}:9696/networking/v2.0/networks/{network_id}"
            res = requests.put(url, headers=headers, json=payload)

            if res.status_code != 200:
                return Response({"error": "Không thể cập nhật network", "details": res.json()},
                                status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, network_id):
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            url = f"{URL_AUTH}:9696/networking/v2.0/networks/{network_id}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 204:
                return Response({"error": "Không thể xoá network"}, status=res.status_code)

            return Response({"message": "Xoá network thành công"}, status=204)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class SubnetAPIView(APIView):
    def get(self, request, network_id=None):
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            if network_id:
                url = f"{URL_AUTH}:9696/networking/v2.0/subnets?network_id={network_id}"
            else:
                url = f"{URL_AUTH}:9696/networking/v2.0/subnets"

            res = requests.get(url, headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không thể lấy danh sách subnets"}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request, network_id):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            name = request.data.get("name")
            cidr = request.data.get("cidr")
            gateway_ip = request.data.get("gateway_ip")
            ip_version = request.data.get("ip_version", 4)
            enable_dhcp = request.data.get("enable_dhcp", True)

            if not all([name, cidr]):
                return Response({"error": "Thiếu thông tin để tạo subnet"}, status=400)

            payload = {
                "subnet": {
                    "name": name,
                    "network_id": network_id,
                    "cidr": cidr,
                    "gateway_ip": gateway_ip,
                    "ip_version": ip_version,
                    "enable_dhcp": enable_dhcp
                }
            }

            url = f"{URL_AUTH}:9696/networking/v2.0/subnets"
            res = requests.post(url, headers=headers, json=payload)

            if res.status_code != 201:
                return Response({"error": "Không thể tạo subnet"}, status=res.status_code)

            return Response(res.json(), status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, subnet_id):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            name = request.data.get("name")
            gateway_ip = request.data.get("gateway_ip")
            enable_dhcp = request.data.get("enable_dhcp")

            if name is None and gateway_ip is None and enable_dhcp is None:
                return Response({"error": "Không có thông tin nào để cập nhật"}, status=400)

            payload = {
                "subnet": {}
            }

            if name is not None:
                payload["subnet"]["name"] = name
            if gateway_ip is not None:
                payload["subnet"]["gateway_ip"] = gateway_ip
            if enable_dhcp is not None:
                payload["subnet"]["enable_dhcp"] = enable_dhcp

            url = f"{URL_AUTH}:9696/v2.0/subnets/{subnet_id}"
            res = requests.put(url, headers=headers, json=payload)

            if res.status_code != 200:
                return Response({"error": "Không thể cập nhật subnet", "details": res.json()},
                                status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, subnet_id):
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            url = f"{URL_AUTH}:9696/v2.0/subnets/{subnet_id}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 204:
                return Response({"error": "Không thể xoá subnet"}, status=res.status_code)

            return Response({"message": "Xoá subnet thành công"}, status=204)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class PortAPIView(APIView):
    def get(self, request, network_id):
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            url = f"{URL_AUTH}:9696/networking/v2.0/ports?network_id={network_id}"
            res = requests.get(url, headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không thể lấy thông tin port"}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request, network_id=None):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            name = request.data.get("name")
            admin_state_up = request.data.get('admin_state_up', True)
            fixed_ips = request.data.get("fixed_ips")  # optional: [{"subnet_id": "...", "ip_address": "..."}]
            device_id = request.data.get("device_id")
            device_owner = request.data.get('device_owner')
            security_groups = request.data.get('security_groups', [])

            if not network_id:
                return Response({"error": "Thiếu network_id"}, status=400)

            payload = {
                "port": {
                    "network_id": network_id,
                }
            }

            if name:
                payload["port"]["name"] = name
            if admin_state_up:
                payload["port"]["admin_state_up"] = admin_state_up
            if fixed_ips:
                payload["port"]["fixed_ips"] = fixed_ips
            if device_id:
                payload["port"]["device_id"] = device_id
            if device_owner:
                payload["port"]["device_owner"] = device_owner
            if security_groups:
                payload["port"]["security_groups"] = security_groups

            url = f"{URL_AUTH}:9696/networking/v2.0/ports?network_id={network_id}"
            res = requests.post(url, headers=headers, json=payload)

            if res.status_code != 201:
                return Response({"error": "Không thể tạo port", "details": res.json()}, status=res.status_code)

            return Response(res.json(), status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, network_id):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            name = request.data.get("name")
            admin_state_up = request.data.get('admin_state_up', True)
            security_groups = request.data.get('security_groups', [])

            payload = {"port": {}}
            if name:
                payload["port"]["name"] = name
            if admin_state_up:
                payload["port"]["admin_state_up"] = admin_state_up
            if security_groups:
                payload["port"]["security_groups"] = security_groups

            if not payload["port"]:
                return Response({"error": "Không có thông tin cập nhật"}, status=400)

            url = f"{URL_AUTH}:9696/networking/v2.0/ports?network_id={network_id}"
            res = requests.put(url, headers=headers, json=payload)

            if res.status_code != 200:
                return Response({"error": "Không thể cập nhật port", "details": res.json()}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, network_id):
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            url = f"{URL_AUTH}:9696/networking/v2.0/ports?network_id={network_id}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 204:
                return Response({"error": "Không thể xoá port"}, status=res.status_code)

            return Response({"message": "Xoá port thành công"}, status=204)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class VolumeAPIView(APIView):
    def get(self, request, volume_id=None):
        try:
            token = request.headers.get("X-Auth-Token")
            project_id = request.headers.get("X-Project-Id")  # cần truyền thêm project_id

            headers = {
                "X-Auth-Token": token
            }

            if volume_id:
                url = f"{URL_AUTH}/volume/v3/{project_id}/volumes/{volume_id}"
            else:
                url = f"{URL_AUTH}/volume/v3/{project_id}/volumes/detail"

            res = requests.get(url, headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không thể lấy thông tin volume"}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            token = request.headers.get("X-Auth-Token")
            project_id = request.headers.get("X-Project-Id")

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            name = request.data.get("name")
            size = request.data.get("size")  # tính bằng GB

            payload = {
                "volume": {
                    "name": name,
                    "size": size
                }
            }

            url = f"{URL_AUTH}/volume/v3/{project_id}/volumes"
            res = requests.post(url, headers=headers, json=payload)

            if res.status_code != 202:
                return Response({"error": "Không thể tạo volume"}, status=res.status_code)

            return Response(res.json(), status=202)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, volume_id):
        try:
            token = request.headers.get("X-Auth-Token")
            project_id = request.headers.get("X-Project-Id")

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            name = request.data.get("name")
            description = request.data.get("description")

            payload = {
                "volume": {
                    "name": name
                }
            }

            if description:
                payload["volume"]["description"] = description

            url = f"{URL_AUTH}/volume/v3/{project_id}/volumes/{volume_id}"
            res = requests.put(url, headers=headers, json=payload)

            if res.status_code != 200:
                return Response({"error": "Không thể cập nhật volume"}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, volume_id):
        try:
            token = request.headers.get("X-Auth-Token")
            project_id = request.headers.get("X-Project-Id")

            headers = {
                "X-Auth-Token": token
            }

            url = f"{URL_AUTH}/volume/v3/{project_id}/volumes/{volume_id}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 202:
                return Response({"error": "Không thể xoá volume"}, status=res.status_code)

            return Response({"message": "Xoá volume thành công"}, status=202)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ImagesAPIView(APIView):
    def get(self, request):
        try:
            headers = {
                "X-Auth-Token": get_admin_token(),
                "Content-Type": "application/json"
            }

            url = f"{URL_AUTH}/image/v2/images"
            res = requests.get(url, headers=headers)

            if res.status_code != 200:
                return Response({
                    "error": "Không lấy được danh sách images",
                    "status_code": res.status_code,
                    "details": res.text
                }, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class VolumeSnapshotAPIView(APIView):
    def get(self, request, snapshot_id=None):
        try:
            token = request.headers.get("X-Auth-Token")
            project_id = request.headers.get("X-Project-Id")

            headers = {"X-Auth-Token": token}

            if snapshot_id:
                url = f"{URL_AUTH}/volume/v3/{project_id}/snapshots/{snapshot_id}"
            else:
                url = f"{URL_AUTH}/volume/v3/{project_id}/snapshots/detail"

            res = requests.get(url, headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không thể lấy thông tin snapshot volume"}, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            token = request.headers.get("X-Auth-Token")
            project_id = request.headers.get("X-Project-Id")

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            name = request.data.get("name")
            volume_id = request.data.get("volume_id")
            description = request.data.get("description", "")
            force = request.data.get("force", True)

            payload = {
                "snapshot": {
                    "name": name,
                    "volume_id": volume_id,
                    "description": description,
                    "force": force
                }
            }

            url = f"{URL_AUTH}/volume/v3/{project_id}/snapshots"
            res = requests.post(url, headers=headers, json=payload)

            if res.status_code != 202:
                return Response({"error": "Không thể tạo snapshot volume"}, status=res.status_code)

            return Response(res.json(), status=202)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, snapshot_id):
        try:
            token = request.headers.get("X-Auth-Token")
            project_id = request.headers.get("X-Project-Id")

            headers = {"X-Auth-Token": token}

            url = f"{URL_AUTH}/volume/v3/{project_id}/snapshots/{snapshot_id}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 202:
                return Response({"error": "Không thể xoá snapshot volume"}, status=res.status_code)

            return Response({"message": "Xoá snapshot volume thành công"}, status=202)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class InstanceSnapshotAPIView(APIView):
    def get(self, request, snapshot_id=None):
        try:
            token = request.headers.get("X-Auth-Token")
            project_id = request.headers.get("X-Project-Id")  # cần thêm header này
            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            if snapshot_id:
                url = f"{URL_AUTH}/image/v2/images/{snapshot_id}"
                res = requests.get(url, headers=headers)
                if res.status_code != 200:
                    return Response({"error": "Không thể lấy thông tin snapshot instance"}, status=res.status_code)
                return Response(res.json(), status=200)

            url = f"{URL_AUTH}/image/v2/images"
            res = requests.get(url, headers=headers)
            if res.status_code != 200:
                return Response({"error": "Không thể lấy danh sách snapshot instance"}, status=res.status_code)

            all_images = res.json().get("images", [])

            # ✅ Lọc ảnh do người dùng tạo (cùng project), đang active, và có visibility private
            snapshots = [
                img for img in all_images
                if img.get("owner") == project_id
                   and img.get("status") == "active"
                   and img.get("visibility") == "private"
            ]

            return Response({"snapshots": snapshots}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            token = request.headers.get("X-Auth-Token")
            server_id = request.data.get("server_id")
            name = request.data.get("name")

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            payload = {
                "createImage": {
                    "name": name
                }
            }

            url = f"{URL_AUTH}/compute/v2.1/servers/{server_id}/action"
            res = requests.post(url, headers=headers, json=payload)

            if res.status_code not in [202, 200]:
                return Response({"error": "Không thể tạo snapshot instance"}, status=res.status_code)

            return Response({"message": "Yêu cầu tạo snapshot đã được gửi"}, status=202)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, snapshot_id):
        try:
            token = request.headers.get("X-Auth-Token")
            headers = {"X-Auth-Token": token}

            url = f"{URL_AUTH}/image/v2/images/{snapshot_id}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 204:
                return Response({"error": "Không thể xoá snapshot instance"}, status=res.status_code)

            return Response({"message": "Xoá snapshot instance thành công"}, status=204)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class RestoreVolumeFromSnapshotAPIView(APIView):
    def post(self, request):
        try:
            token = request.headers.get("X-Auth-Token")
            project_id = request.data.get("project_id")
            snapshot_id = request.data.get("snapshot_id")
            new_volume_name = request.data.get("name", "restored-volume")

            if not all([project_id, snapshot_id]):
                return Response({"error": "Thiếu project_id hoặc snapshot_id"}, status=400)

            url = f"{URL_AUTH}/volume/v3/{project_id}/volumes"
            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            payload = {
                "volume": {
                    "name": new_volume_name,
                    "snapshot_id": snapshot_id
                }
            }

            res = requests.post(url, headers=headers, json=payload)

            if res.status_code not in [200, 202]:
                return Response({"error": "Không thể khôi phục volume từ snapshot", "details": res.json()}, status=res.status_code)

            return Response(res.json(), status=res.status_code)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class RestoreInstanceFromSnapshotAPIView(APIView):
    def post(self, request):
        try:
            token = request.headers.get("X-Auth-Token")
            snapshot_image_id = request.data.get("image_id")
            flavor_id = request.data.get("flavor_id")
            network_ids = request.data.get("networks", [])
            name = request.data.get("name", "restored-instance")

            if not all([snapshot_image_id, flavor_id, network_ids]):
                return Response({"error": "Thiếu thông tin tạo instance"}, status=400)

            url = f"{URL_AUTH}/compute/v2.1/servers"
            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            payload = {
                "server": {
                    "name": name,
                    "imageRef": snapshot_image_id,
                    "flavorRef": flavor_id,
                    "networks": [{"uuid": net_id} for net_id in network_ids]
                }
            }

            res = requests.post(url, headers=headers, json=payload)

            if res.status_code not in [200, 202]:
                return Response({"error": "Không thể khôi phục instance từ snapshot", "details": res.json()}, status=res.status_code)

            return Response(res.json(), status=res.status_code)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class RouterAPIView(APIView):
    def get(self, request, router_id=None):
        # Lấy thông tin router
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            if router_id:
                # Lấy thông tin router cụ thể
                url = f"{URL_AUTH}:9696/networking/v2.0/routers/{router_id}"
            else:
                # Lấy danh sách tất cả routers
                url = f"{URL_AUTH}:9696/networking/v2.0/routers"

            res = requests.get(url, headers=headers)

            if res.status_code != 200:
                return Response({
                    "error": "Không thể lấy thông tin router",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        # Tạo router mới
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            router_name = request.data.get("name")
            admin_state_up = request.data.get("admin_state_up", True)
            external_network_id = request.data.get("external_gateway_info")

            payload = {
                "router": {
                    "name": router_name,
                    "admin_state_up": admin_state_up
                }
            }

            # Nếu có external network (thường khi gán gateway)
            if external_network_id:
                payload["router"]["external_gateway_info"] = {
                    "network_id": external_network_id
                }

            res = requests.post(f"{URL_AUTH}:9696/networking/v2.0/routers", headers=headers, json=payload)

            if res.status_code != 201:
                return Response({
                    "error": "Không thể tạo router",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, router_id):
        # Cập nhật router theo ID
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            router_name = request.data.get("router_name")
            admin_state_up = request.data.get("admin_state_up")

            # Tạo payload với các trường cần cập nhật
            payload = {
                "router": {}
            }
            if router_name is not None:
                payload["router"]["name"] = router_name
            if admin_state_up is not None:
                payload["router"]["admin_state_up"] = admin_state_up

            url = f"{URL_AUTH}:9696/networking/v2.0/routers/{router_id}"
            res = requests.put(url, headers=headers, json=payload)

            if res.status_code != 200:
                return Response({
                    "error": "Không thể cập nhật router",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, router_id):
        # Xoá router theo ID
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            url = f"{URL_AUTH}:9696/networking/v2.0/routers/{router_id}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 204:
                return Response({"error": "Không thể xoá router"}, status=res.status_code)

            return Response({"message": "Xoá router thành công"}, status=204)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class RouterInterfaceAPIView(APIView):
    def post(self, request, router_id):
        # Add interface (subnet) vào router
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            subnet_id = request.data.get("subnet_id")

            payload = {
                "subnet_id": subnet_id
            }

            url = f"{URL_AUTH}:9696/networking/v2.0/routers/{router_id}/add_router_interface"
            res = requests.put(url, headers=headers, json=payload)

            if res.status_code != 200:
                return Response({
                    "error": "Không thể gán interface vào router",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, router_id):
        # Remove interface khỏi router
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            subnet_id = request.data.get("subnet_id")

            payload = {
                "subnet_id": subnet_id
            }

            url = f"{URL_AUTH}:9696/networking/v2.0/routers/{router_id}/remove_router_interface"
            res = requests.put(url, headers=headers, json=payload)

            if res.status_code != 200:
                return Response({
                    "error": "Không thể xoá interface khỏi router",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class FloatingIPAPIView(APIView):
    def post(self, request):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            # Lấy external network ID từ request data
            floating_network_id = request.data.get("floating_network_id")

            payload = {
                "floatingip": {
                    "floating_network_id": floating_network_id
                }
            }

            res = requests.post(f"{URL_AUTH}:9696/networking/v2.0/floatingips", headers=headers, json=payload)

            if res.status_code != 201:
                return Response({
                    "error": "Không thể tạo Floating IP",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, floating_ip_id):
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            url = f"{URL_AUTH}:9696/networking/v2.0/floatingips/{floating_ip_id}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 204:
                return Response({"error": "Không thể xoá Floating IP"}, status=res.status_code)

            return Response({"message": "Xoá Floating IP thành công"}, status=204)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class FloatingIPAssociateAPIView(APIView):
    def post(self, request):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            floating_ip_id = request.data.get("floating_ip_id")
            port_id = request.data.get("port_id")

            payload = {
                "floatingip": {
                    "port_id": port_id
                }
            }

            # Gửi request đến Neutron API để associate Floating IP
            res = requests.put(f"{URL_AUTH}:9696/networking/v2.0/floatingips/{floating_ip_id}/update", headers=headers, json=payload)

            if res.status_code != 200:
                return Response({
                    "error": "Không thể associate Floating IP",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class FloatingIPDisassociateAPIView(APIView):
    def post(self, request):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            floating_ip_id = request.data.get("floating_ip_id")

            payload = {
                "floatingip": {
                    "port_id": None  # Disassociate bằng cách đặt port_id là None
                }
            }

            # Gửi request đến Neutron API để disassociate Floating IP
            res = requests.put(f"{URL_AUTH}:9696/networking/v2.0/floatingips/{floating_ip_id}/update", headers=headers, json=payload)

            if res.status_code != 200:
                return Response({
                    "error": "Không thể disassociate Floating IP",
                    "details": res.json()
                }, status=res.status_code)

            return Response(res.json(), status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

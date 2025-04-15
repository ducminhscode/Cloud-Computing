import requests
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
                "project": project_name
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


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

            # Lấy dữ liệu cần thiết từ request
            name = request.data.get("name")
            image_ref = request.data.get("imageRef")
            flavor_ref = request.data.get("flavorRef")
            network_id = request.data.get("network_id", [])

            if not all([name, image_ref, flavor_ref, network_id]):
                return Response({"error": "Thiếu thông tin để tạo instance"}, status=400)

            networks = [{"uuid": net_id} for net_id in network_id]

            payload = {
                "server": {
                    "name": name,
                    "imageRef": image_ref,
                    "flavorRef": flavor_ref,
                    "networks": networks
                }
            }

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

class NetworkAPIView(APIView):

    def get(self, request, network_id=None):
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

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
            network_name = request.data.get("name")
            admin_state_up = request.data.get("admin_state_up", True)

            payload = {
                "network": {
                    "name": network_name,
                    "admin_state_up": admin_state_up
                }
            }

            res = requests.post(f"{URL_AUTH}:9696/networking/v2.0/networks", headers=headers, json=payload)

            if res.status_code != 201:
                return Response({"error": "Không thể tạo network"}, status=res.status_code)

            return Response(res.json(), status=201)

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
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class LoginKeystone(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        project = request.data.get("project", "demo")  # mặc định là demo

        keystone_url = "http://192.168.1.20/identity/v3/auth/tokens"  # sửa theo IP OpenStack

        payload = {
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
                        "name": project,
                        "domain": {"id": "default"}
                    }
                }
            }
        }

        try:
            res = requests.post(keystone_url, json=payload)
            if res.status_code != 201:
                return Response({"error": "Đăng nhập thất bại"}, status=status.HTTP_401_UNAUTHORIZED)

            token = res.headers["X-Subject-Token"]
            user = res.json()["token"]["user"]["name"]
            project_name = res.json()["token"]["project"]["name"]

            return Response({
                "token": token,
                "user": user,
                "project": project_name
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class InstancesAPIView(APIView):
    def get(self, request):
        try:
            # Lấy token admin
            token = request.headers.get("X-Auth-Token")

            headers = {
                "X-Auth-Token": token,
                "Content-Type": "application/json"
            }

            NOVA_URL = "http://192.168.1.20/compute/v2.1/servers"
            res = requests.get(NOVA_URL, headers=headers)
            if res.status_code != 200:
                return Response({"error": "Không lấy được danh sách instances"}, status=res.status_code)

            all_servers = res.json().get("servers", [])
            active_servers = [server for server in all_servers if server.get("status") == "ACTIVE"]

            return Response({
                "active_servers": active_servers,
                "total_active": len(active_servers)
            })

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
            network_id = request.data.get("network_id")

            payload = {
                "server": {
                    "name": name,
                    "imageRef": image_ref,
                    "flavorRef": flavor_ref,
                    "networks": [{"uuid": network_id}]
                }
            }

            NOVA_URL = "http://192.168.1.20/compute/v2.1/servers"
            res = requests.post(NOVA_URL, headers=headers, json=payload)

            if res.status_code not in [200, 202]:
                return Response({"error": "Không thể tạo instance"}, status=res.status_code)

            return Response(res.json(), status=res.status_code)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, server_id):
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

            NOVA_URL = f"http://192.168.1.20/compute/v2.1/servers/{server_id}"
            res = requests.put(NOVA_URL, headers=headers, json=payload)

            if res.status_code != 200:
                return Response({"error": "Không thể cập nhật instance"}, status=res.status_code)

            return Response({"message": "Cập nhật instance thành công"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, server_id):
        try:
            token = request.headers.get("X-Auth-Token")
            headers = {
                "X-Auth-Token": token
            }

            NOVA_URL = f"http://192.168.1.20/compute/v2.1/servers/{server_id}"
            res = requests.delete(NOVA_URL, headers=headers)

            if res.status_code != 204:
                return Response({"error": "Không thể xóa instance"}, status=res.status_code)

            return Response({"message": "Xóa instance thành công"}, status=204)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


GLANCE_URL = "http://192.168.1.20/image/v2/images"  # sửa theo IP OpenStack
class ImageAPIView(APIView):

    def get(self, request, image_id=None):
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            if image_id:
                url = f"{GLANCE_URL}/{image_id}"
                res = requests.get(url, headers=headers)
            else:
                res = requests.get(GLANCE_URL, headers=headers)

            if res.status_code != 200:
                return Response({"error": "Không thể lấy thông tin image"}, status=res.status_code)

            return Response(res.json())

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        token = request.headers.get("X-Auth-Token")
        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            # Chỉ tạo metadata, chưa upload file
            image_name = request.data.get("name")
            disk_format = request.data.get("disk_format", "qcow2")
            container_format = request.data.get("container_format", "bare")
            visibility = request.data.get("visibility", "private")

            payload = {
                "name": image_name,
                "disk_format": disk_format,
                "container_format": container_format,
                "visibility": visibility
            }

            res = requests.post(GLANCE_URL, headers=headers, json=payload)

            if res.status_code not in [201]:
                return Response({"error": "Không thể tạo image"}, status=res.status_code)

            return Response(res.json(), status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, image_id):
        token = request.headers.get("X-Auth-Token")
        headers = {"X-Auth-Token": token}

        try:
            url = f"{GLANCE_URL}/{image_id}"
            res = requests.delete(url, headers=headers)

            if res.status_code != 204:
                return Response({"error": "Không thể xoá image"}, status=res.status_code)

            return Response({"message": "Xoá image thành công"}, status=204)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


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

class ListImages(APIView):
    def get(self, request):
        token = request.headers.get("X-Auth-Token")
        if not token:
            return Response({"error": "Thiếu X-Auth-Token"}, status=status.HTTP_400_BAD_REQUEST)

        glance_url = "http://192.168.1.20/v2/images"  # Đổi IP theo máy OpenStack

        headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json"
        }

        try:
            res = requests.get(glance_url, headers=headers)
            if res.status_code != 200:
                return Response({"error": "Không lấy được danh sách images"}, status=res.status_code)

            return Response(res.json())

        except Exception as e:
            return Response({"error": str(e)}, status=500)
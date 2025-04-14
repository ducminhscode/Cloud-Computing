from django.urls import path
from .views import LoginKeystone, InstancesAPIView, ImageAPIView

urlpatterns = [
    path("login/", LoginKeystone.as_view()),
    path("instances/", InstancesAPIView.as_view()),
    path('instances/<str:server_id>/', InstancesAPIView.as_view(), name='instance_detail'),
    path('images/', ImageAPIView.as_view(), name='image-list'),
    path('images/<str:image_id>/', ImageAPIView.as_view(), name='image-detail')
]

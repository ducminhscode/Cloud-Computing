from django.urls import path
from .views import LoginKeystone, InstancesAPIView, NetworkAPIView, VolumeAPIView, SubnetAPIView
urlpatterns = [
    path("login/", LoginKeystone.as_view()),
    path("instances/", InstancesAPIView.as_view()),
    path('instances/<str:id>/', InstancesAPIView.as_view(), name='instance_detail'),

    path('networks/', NetworkAPIView.as_view()),
    path('networks/<str:network_id>/', NetworkAPIView.as_view()),

    path('subnets/', SubnetAPIView.as_view()),
    path('networks/<str:network_id>/subnets/', SubnetAPIView.as_view()),

    # path('ports/', PortAPIView.as_view()),
    # path('networks/<str:network_id>/ports/', PortAPIView.as_view()),

    path('volumes/', VolumeAPIView.as_view()),
    path('volumes/<str:volume_id>/', VolumeAPIView.as_view()),
]

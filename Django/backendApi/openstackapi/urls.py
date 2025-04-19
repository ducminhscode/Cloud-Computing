from django.urls import path
from .views import LoginKeystone, InstancesAPIView, NetworkAPIView, VolumeAPIView, SubnetAPIView, PortAPIView, \
    FlavorAPIView, RegisterAPIView, ImagesAPIView, SecurityGroupAPIView, KeyPairAPIView, \
    RestoreInstanceFromSnapshotAPIView, RestoreVolumeFromSnapshotAPIView, VolumeSnapshotAPIView, InstanceSnapshotAPIView

urlpatterns = [
    path("login/", LoginKeystone.as_view()),
    path("register/", RegisterAPIView.as_view()),

    path("instances/", InstancesAPIView.as_view()),
    path('instances/<str:id>/', InstancesAPIView.as_view()),

    path('flavors/', FlavorAPIView.as_view()),

    path('networks/', NetworkAPIView.as_view()),
    path('networks/<str:network_id>/', NetworkAPIView.as_view()),

    path('security-groups/', SecurityGroupAPIView.as_view()),
    path('key-pairs/', KeyPairAPIView.as_view()),
    path('key-pairs/<str:key_name>/', KeyPairAPIView.as_view()),

    path('subnets/', SubnetAPIView.as_view()),
    path('networks/<str:network_id>/subnets/', SubnetAPIView.as_view()),
    path('networks/<str:network_id>/ports/', PortAPIView.as_view()),

    path('volumes/', VolumeAPIView.as_view()),
    path('volumes/<str:volume_id>/', VolumeAPIView.as_view()),

    path("snapshot-volume/", VolumeSnapshotAPIView.as_view()),
    path("snapshot-volume/<str:snapshot_id>/", VolumeSnapshotAPIView.as_view()),

    path("snapshot-instance/", InstanceSnapshotAPIView.as_view()),
    path("snapshot-instance/<str:snapshot_id>/", InstanceSnapshotAPIView.as_view()),

    path('image/', ImagesAPIView.as_view()),

    path('snapshots-restore-instance/', RestoreInstanceFromSnapshotAPIView.as_view()),
    path('snapshots-restore-volume/', RestoreVolumeFromSnapshotAPIView.as_view())
]

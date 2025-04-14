from django.urls import path
from .views import LoginKeystone, ListImages

urlpatterns = [
    path("login/", LoginKeystone.as_view()),
    path('images/', ListImages.as_view())
]

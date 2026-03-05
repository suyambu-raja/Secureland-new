"""
API URL Configuration.
"""

from django.urls import path
from .views import (
    HealthCheckView,
    UserRegisterView,
    UserLoginView,
    UserProfileView,
    DigitalTwinRegisterView,
    DigitalTwinDetailView,
    DigitalTwinListView,
    BlockchainVerifyView,
    BlockchainChainView,
    BlockchainValidateView,
)

urlpatterns = [
    # Health
    path("health/", HealthCheckView.as_view(), name="health"),

    # Auth — User Management
    path("auth/register/", UserRegisterView.as_view(), name="user-register"),
    path("auth/login/", UserLoginView.as_view(), name="user-login"),
    path("auth/profile/<str:phone>/", UserProfileView.as_view(), name="user-profile"),

    # Digital Twin
    path("twin/register/", DigitalTwinRegisterView.as_view(), name="twin-register"),
    path("twin/<str:land_id>/", DigitalTwinDetailView.as_view(), name="twin-detail"),
    path("twins/<str:phone>/", DigitalTwinListView.as_view(), name="twin-list"),

    # Blockchain
    path("blockchain/verify/<str:land_id>/", BlockchainVerifyView.as_view(), name="blockchain-verify"),
    path("blockchain/chain/", BlockchainChainView.as_view(), name="blockchain-chain"),
    path("blockchain/validate/", BlockchainValidateView.as_view(), name="blockchain-validate"),
]

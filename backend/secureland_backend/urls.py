"""
secureland_backend URL Configuration.
Includes Swagger/ReDoc API documentation.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


# Swagger Schema View
schema_view = get_schema_view(
    openapi.Info(
        title="🔒 SecureLand API",
        default_version="v1",
        description="""
## SecureLand Backend API

**Django REST Framework** backend with **Firebase Authentication** and **Blockchain** integration.

### Features
- 🔐 **Firebase Auth** — JWT token verification
- ⛓️ **Blockchain** — SHA-256 hash chain with Proof-of-Work
- 🗺️ **Digital Twin** — Land registration and management
- 👤 **User Management** — Registration, login, profiles

### Authentication
Send Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <firebase_id_token>
```
        """,
        terms_of_service="https://secureland.app/terms/",
        contact=openapi.Contact(email="support@secureland.app"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)


def root_view(request):
    return JsonResponse({
        "service": "🔒 SecureLand Django Backend",
        "status": "running",
        "docs": {
            "swagger_ui": "/swagger/",
            "redoc": "/redoc/",
            "json_schema": "/swagger.json",
        },
        "api": "/api/",
    })


urlpatterns = [
    # Root
    path("", root_view, name="root"),

    # Swagger / API Docs
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="swagger-ui"),
    path("swagger.json", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    path("swagger.yaml", schema_view.without_ui(cache_timeout=0), name="schema-yaml"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="redoc"),

    # Admin
    path("admin/", admin.site.urls),

    # API
    path("api/", include("api.urls")),
]

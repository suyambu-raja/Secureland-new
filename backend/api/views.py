"""
SecureLand API Views — Django REST Framework.
All endpoints use Firebase Authentication.
Swagger-documented with drf-yasg.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from datetime import datetime
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Try importing Firebase — may fail without credentials
try:
    from firebase_admin import firestore
    _db = None

    def get_db():
        global _db
        if _db is None:
            _db = firestore.client()
        return _db

    FIREBASE_AVAILABLE = True
except Exception:
    FIREBASE_AVAILABLE = False

    def get_db():
        raise RuntimeError("Firebase not available. Add firebase-service-account.json.")


def firebase_error_response(e):
    """Standard error response for Firebase issues."""
    return Response({
        "error": "Firebase connection failed. Please add firebase-service-account.json to the backend/ folder.",
        "detail": str(e),
        "fix": "Download from: https://console.firebase.google.com/project/land-748e6/settings/serviceaccounts/adminsdk",
    }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


# =============================================
# HEALTH CHECK
# =============================================
class HealthCheckView(APIView):
    """Server health check endpoint."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Health Check",
        operation_description="Returns the server status and available features.",
        responses={200: openapi.Response("Server is running")},
    )
    def get(self, request):
        firebase_status = "connected"
        try:
            get_db()
        except Exception:
            firebase_status = "not connected — add service account key"

        return Response({
            "status": "ok",
            "service": "SecureLand Django Backend",
            "firebase": firebase_status,
            "features": [
                "firebase-auth",
                "blockchain",
                "digital-twin",
                "user-management",
                "swagger-docs",
            ],
            "docs": "/swagger/",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })


# =============================================
# USER REGISTRATION
# =============================================
class UserRegisterView(APIView):
    """Register a new user with name, phone, and password."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Register User",
        operation_description="Creates a new user account in Firestore.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["name", "phone", "password"],
            properties={
                "name": openapi.Schema(type=openapi.TYPE_STRING, description="Full name"),
                "phone": openapi.Schema(type=openapi.TYPE_STRING, description="10-digit mobile"),
                "password": openapi.Schema(type=openapi.TYPE_STRING, description="Password"),
            },
        ),
        responses={
            201: openapi.Response("User registered"),
            400: openapi.Response("Missing fields"),
            409: openapi.Response("Phone already registered"),
        },
    )
    def post(self, request):
        data = request.data
        name = data.get("name", "").strip()
        phone = data.get("phone", "").strip()
        password = data.get("password", "").strip()

        if not name or not phone or not password:
            return Response(
                {"error": "Name, phone, and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            db = get_db()
            user_ref = db.collection("users").document(phone)
            user_doc = user_ref.get()

            if user_doc.exists:
                return Response(
                    {"error": "Phone number already registered."},
                    status=status.HTTP_409_CONFLICT,
                )

            user_data = {
                "name": name,
                "phone": phone,
                "password": password,
                "createdAt": datetime.utcnow().isoformat() + "Z",
            }
            user_ref.set(user_data)

            return Response({
                "success": True,
                "message": "User registered successfully.",
                "user": {"name": name, "phone": phone},
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return firebase_error_response(e)


# =============================================
# USER LOGIN
# =============================================
class UserLoginView(APIView):
    """Login with phone number and password."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Login User",
        operation_description="Verifies credentials against Firestore.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["phone", "password"],
            properties={
                "phone": openapi.Schema(type=openapi.TYPE_STRING),
                "password": openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        responses={
            200: openapi.Response("Login successful"),
            401: openapi.Response("Incorrect password"),
            404: openapi.Response("Phone not registered"),
        },
    )
    def post(self, request):
        data = request.data
        phone = data.get("phone", "").strip()
        password = data.get("password", "").strip()

        if not phone or not password:
            return Response(
                {"error": "Phone and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            db = get_db()
            user_doc = db.collection("users").document(phone).get()

            if not user_doc.exists:
                return Response({"error": "Phone number not registered."}, status=status.HTTP_404_NOT_FOUND)

            user_data = user_doc.to_dict()
            if user_data.get("password") != password:
                return Response({"error": "Incorrect password."}, status=status.HTTP_401_UNAUTHORIZED)

            return Response({
                "success": True,
                "message": "Login successful.",
                "user": {"name": user_data.get("name"), "phone": user_data.get("phone")},
            })
        except Exception as e:
            return firebase_error_response(e)


# =============================================
# USER PROFILE
# =============================================
class UserProfileView(APIView):
    """Get user profile by phone number."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Get User Profile",
        operation_description="Returns user data (excluding password) from Firestore.",
        responses={200: openapi.Response("User profile"), 404: openapi.Response("Not found")},
    )
    def get(self, request, phone):
        try:
            db = get_db()
            user_doc = db.collection("users").document(phone).get()

            if not user_doc.exists:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            user_data = user_doc.to_dict()
            user_data.pop("password", None)
            return Response({"success": True, "user": user_data})
        except Exception as e:
            return firebase_error_response(e)


# =============================================
# DIGITAL TWIN — REGISTER LAND
# =============================================
class DigitalTwinRegisterView(APIView):
    """Register a new Digital Twin for a land parcel."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Register Digital Twin",
        operation_description="Creates a land record in Firestore and registers it on the blockchain.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["landId", "ownerName"],
            properties={
                "landId": openapi.Schema(type=openapi.TYPE_STRING),
                "ownerName": openapi.Schema(type=openapi.TYPE_STRING),
                "mobile": openapi.Schema(type=openapi.TYPE_STRING),
                "state": openapi.Schema(type=openapi.TYPE_STRING),
                "location": openapi.Schema(type=openapi.TYPE_STRING),
                "area": openapi.Schema(type=openapi.TYPE_NUMBER),
                "coordinates": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_OBJECT),
                ),
            },
        ),
        responses={201: openapi.Response("Twin created")},
    )
    def post(self, request):
        data = request.data
        land_id = data.get("landId")
        owner_name = data.get("ownerName")

        if not land_id or not owner_name:
            return Response({"error": "landId and ownerName are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from .blockchain import register_on_blockchain

            db = get_db()
            twin_data = {
                "landId": land_id,
                "ownerName": owner_name,
                "mobile": data.get("mobile", ""),
                "state": data.get("state", ""),
                "location": data.get("location", ""),
                "area": data.get("area", 0),
                "coordinates": data.get("coordinates", []),
                "polygon": data.get("polygon", data.get("coordinates", [])),
                "createdAt": datetime.utcnow().isoformat() + "Z",
            }
            db.collection("digitalTwins").document(land_id).set(twin_data)

            block = None
            try:
                block = register_on_blockchain(twin_data)
                twin_data["blockchainHash"] = block["hash"]
                twin_data["blockIndex"] = block["index"]
                twin_data["blockNonce"] = block["nonce"]
                twin_data["blockchainTimestamp"] = block["timestamp"]
                twin_data["blockchainVerified"] = True
            except Exception as be:
                print(f"Blockchain error: {be}")

            return Response({
                "success": True,
                "message": "Digital Twin created.",
                "twin": twin_data,
                "block": {"hash": block["hash"], "index": block["index"], "nonce": block["nonce"]} if block else None,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return firebase_error_response(e)


# =============================================
# DIGITAL TWIN — GET BY LAND ID
# =============================================
class DigitalTwinDetailView(APIView):
    """Get a specific Digital Twin by land ID."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Get Digital Twin",
        responses={200: openapi.Response("Twin data"), 404: openapi.Response("Not found")},
    )
    def get(self, request, land_id):
        try:
            db = get_db()
            doc = db.collection("digitalTwins").document(land_id).get()
            if not doc.exists:
                return Response({"error": "Digital Twin not found."}, status=status.HTTP_404_NOT_FOUND)
            return Response({"success": True, "twin": doc.to_dict()})
        except Exception as e:
            return firebase_error_response(e)


# =============================================
# DIGITAL TWIN — LIST BY USER
# =============================================
class DigitalTwinListView(APIView):
    """Get all Digital Twins registered by a user (by phone)."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="List User's Digital Twins",
        responses={200: openapi.Response("List of twins")},
    )
    def get(self, request, phone):
        try:
            db = get_db()
            docs = db.collection("digitalTwins").where("mobile", "==", phone).get()
            twins = [doc.to_dict() for doc in docs]
            return Response({"success": True, "twins": twins, "count": len(twins)})
        except Exception as e:
            return firebase_error_response(e)


# =============================================
# BLOCKCHAIN — VERIFY
# =============================================
class BlockchainVerifyView(APIView):
    """Verify a land record on the blockchain."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Verify Land on Blockchain",
        responses={200: openapi.Response("Verification result")},
    )
    def get(self, request, land_id):
        try:
            from .blockchain import verify_land_on_blockchain
            result = verify_land_on_blockchain(land_id)
            return Response({"success": True, **result})
        except Exception as e:
            return firebase_error_response(e)


# =============================================
# BLOCKCHAIN — FULL CHAIN
# =============================================
class BlockchainChainView(APIView):
    """Get the entire blockchain."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Get Full Blockchain",
        responses={200: openapi.Response("Full chain data")},
    )
    def get(self, request):
        try:
            from .blockchain import get_full_chain
            blocks = get_full_chain()
            return Response({"success": True, "totalBlocks": len(blocks), "chain": blocks})
        except Exception as e:
            return firebase_error_response(e)


# =============================================
# BLOCKCHAIN — VALIDATE
# =============================================
class BlockchainValidateView(APIView):
    """Validate the entire blockchain integrity."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Validate Blockchain",
        operation_description="Checks every block's hash and chain links for tampering.",
        responses={200: openapi.Response("Validation result")},
    )
    def get(self, request):
        try:
            from .blockchain import validate_chain
            result = validate_chain()
            return Response({"success": True, **result})
        except Exception as e:
            return firebase_error_response(e)

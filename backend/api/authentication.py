"""
Firebase Authentication Backend for Django REST Framework.
Verifies Firebase ID tokens sent in the Authorization header.
"""

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from rest_framework import authentication, exceptions
from django.conf import settings
import os


# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    sa_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "firebase-service-account.json"
    )

    if os.path.exists(sa_path):
        cred = credentials.Certificate(sa_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin initialized with service account key.")
    else:
        # Initialize without credentials — allows Firestore access if
        # GOOGLE_APPLICATION_CREDENTIALS env var is set, or running on GCP.
        # For LOCAL DEV: download service account key from Firebase Console.
        try:
            firebase_admin.initialize_app(options={
                "projectId": settings.FIREBASE_PROJECT_ID,
            })
            print(f"⚠️ Firebase Admin initialized with project ID only: {settings.FIREBASE_PROJECT_ID}")
            print(f"   📄 For full access, download service account key from:")
            print(f"   https://console.firebase.google.com/project/{settings.FIREBASE_PROJECT_ID}/settings/serviceaccounts/adminsdk")
            print(f"   Save it as: backend/firebase-service-account.json")
        except Exception as e:
            print(f"❌ Firebase Admin SDK init error: {e}")


class FirebaseUser:
    """A simple user object for Firebase-authenticated requests."""

    def __init__(self, uid, email=None, phone=None, name=None):
        self.uid = uid
        self.pk = uid
        self.id = uid
        self.email = email
        self.phone = phone
        self.name = name
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False

    def __str__(self):
        return self.uid


class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Authenticate requests using Firebase ID tokens.
    
    The frontend sends: Authorization: Bearer <firebase_id_token>
    This class verifies the token with Firebase Admin SDK.
    """

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")

        if not auth_header.startswith("Bearer "):
            return None  # No token, let other auth methods handle it

        token = auth_header.split("Bearer ")[1].strip()

        if not token:
            return None

        try:
            decoded_token = firebase_auth.verify_id_token(token)
            uid = decoded_token.get("uid")
            email = decoded_token.get("email")
            phone = decoded_token.get("phone_number")
            name = decoded_token.get("name", "")

            user = FirebaseUser(
                uid=uid,
                email=email,
                phone=phone,
                name=name,
            )
            return (user, decoded_token)

        except firebase_auth.ExpiredIdTokenError:
            raise exceptions.AuthenticationFailed("Firebase token has expired.")
        except firebase_auth.RevokedIdTokenError:
            raise exceptions.AuthenticationFailed("Firebase token has been revoked.")
        except firebase_auth.InvalidIdTokenError:
            raise exceptions.AuthenticationFailed("Invalid Firebase token.")
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Firebase auth error: {str(e)}")

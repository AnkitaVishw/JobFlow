from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import issue_token
from .models import Interview, JobApplication, Profile, Resume, StatusHistory
from .serializers import (
    InterviewSerializer,
    JobApplicationSerializer,
    LoginSerializer,
    ProfileSerializer,
    RegisterSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ResumeSerializer,
)


def claim_orphaned_records(user):
    if User.objects.count() != 1:
        return

    JobApplication.objects.filter(user__isnull=True).update(user=user)
    Interview.objects.filter(user__isnull=True).update(user=user)
    Resume.objects.filter(user__isnull=True).update(user=user)
    orphan_profile = Profile.objects.filter(user__isnull=True).first()
    if orphan_profile and not Profile.objects.filter(user=user).exists():
        orphan_profile.user = user
        orphan_profile.save()


def duplicate_application(user, company, role, exclude_id=None):
    queryset = JobApplication.objects.filter(
        user=user,
        company__iexact=company.strip(),
        role__iexact=role.strip(),
    )
    if exclude_id:
        queryset = queryset.exclude(pk=exclude_id)
    return queryset.first()


class OwnedMixin:
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)


class JobApplicationListCreateView(OwnedMixin, generics.ListCreateAPIView):
    queryset = (
        JobApplication.objects.select_related("resume")
        .prefetch_related("status_history")
        .all()
        .order_by("-created_at")
    )
    serializer_class = JobApplicationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.validated_data.get("company", "")
        role = serializer.validated_data.get("role", "")
        force = str(request.data.get("force", "")).lower() in ("1", "true", "yes")
        duplicate = duplicate_application(request.user, company, role)
        if duplicate and not force:
            return Response(
                {
                    "duplicate": True,
                    "detail": (
                        f"You already applied to {duplicate.company} "
                        f"for {duplicate.role}."
                    ),
                },
                status=status.HTTP_409_CONFLICT,
            )
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        application = serializer.save(user=self.request.user)
        StatusHistory.objects.create(
            application=application,
            from_status="",
            to_status=application.status,
        )


class JobApplicationDetailView(OwnedMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = (
        JobApplication.objects.select_related("resume")
        .prefetch_related("status_history")
        .all()
    )
    serializer_class = JobApplicationSerializer

    def perform_update(self, serializer):
        previous = self.get_object()
        previous_status = previous.status
        application = serializer.save()
        if application.status != previous_status:
            StatusHistory.objects.create(
                application=application,
                from_status=previous_status,
                to_status=application.status,
            )


class InterviewListCreateView(OwnedMixin, generics.ListCreateAPIView):
    queryset = Interview.objects.select_related("application").all()
    serializer_class = InterviewSerializer

    def perform_create(self, serializer):
        interview = serializer.save(user=self.request.user)
        application = interview.application
        if application.status in ("Applied", "Screening"):
            previous_status = application.status
            application.status = "Interview"
            application.save(update_fields=["status"])
            StatusHistory.objects.create(
                application=application,
                from_status=previous_status,
                to_status="Interview",
            )


class InterviewDetailView(OwnedMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Interview.objects.select_related("application").all()
    serializer_class = InterviewSerializer


class ResumeListCreateView(OwnedMixin, generics.ListCreateAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        resume = serializer.save(user=self.request.user)
        if resume.is_default:
            Resume.objects.filter(user=self.request.user).exclude(pk=resume.pk).update(
                is_default=False
            )


class ResumeDetailView(OwnedMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_update(self, serializer):
        resume = serializer.save()
        if resume.is_default:
            Resume.objects.filter(user=self.request.user).exclude(pk=resume.pk).update(
                is_default=False
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _created = Profile.objects.get_or_create(user=self.request.user)
        return profile


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        claim_orphaned_records(user)
        Profile.objects.get_or_create(user=user)
        token = issue_token(user)
        return Response(
            {
                "token": token.key,
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        user = User.objects.filter(username=identifier).first()
        if user is None:
            user = User.objects.filter(email__iexact=identifier).first()
        authenticated = None
        if user is not None:
            authenticated = authenticate(username=user.username, password=password)
        if authenticated is None:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        token = issue_token(authenticated)
        return Response({"token": token.key, "username": authenticated.username})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()
        reset_url = ""
        if user is not None and user.email:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
            reset_url = f"{frontend}/reset-password/{uid}/{token}"
            send_mail(
                subject="Reset your JobFlow password",
                message=(
                    f"Hi {user.username},\n\n"
                    "We received a request to reset your JobFlow password.\n"
                    f"Open this link to choose a new one:\n{reset_url}\n\n"
                    "If you did not ask for this, you can ignore this email.\n"
                ),
                from_email=getattr(
                    settings, "DEFAULT_FROM_EMAIL", "JobFlow <noreply@jobflow.local>"
                ),
                recipient_list=[user.email],
                fail_silently=True,
            )

        payload = {
            "detail": (
                "If an account exists for that email, we sent a password reset link."
            ),
        }
        if settings.DEBUG and reset_url:
            payload["reset_url"] = reset_url
        return Response(payload)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {"detail": "This reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(
            user, serializer.validated_data["token"]
        ):
            return Response(
                {"detail": "This reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password updated. You can sign in now."})

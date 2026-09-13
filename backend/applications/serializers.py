from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Interview, JobApplication, Profile, Resume, StatusHistory


class StatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusHistory
        fields = ("id", "from_status", "to_status", "changed_at")


class JobApplicationSerializer(serializers.ModelSerializer):
    resume_title = serializers.CharField(source="resume.title", read_only=True)
    resume_file_url = serializers.SerializerMethodField()
    status_history = StatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = JobApplication
        fields = "__all__"
        extra_kwargs = {
            "follow_up_on": {"allow_null": True, "required": False},
            "next_action": {"required": False, "allow_blank": True},
            "resume": {"allow_null": True, "required": False},
            "user": {"read_only": True},
            "recruiter_linkedin": {"required": False, "allow_blank": True},
            "recruiter_email": {"required": False, "allow_blank": True},
        }

    def get_resume_file_url(self, obj):
        if not obj.resume or not obj.resume.file:
            return ""
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.resume.file.url)
        return obj.resume.file.url

    def validate_resume(self, resume):
        request = self.context.get("request")
        if resume and request and request.user.is_authenticated:
            if resume.user_id not in (None, request.user.id):
                raise serializers.ValidationError("That resume does not belong to you.")
        return resume


class InterviewSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source="application.company", read_only=True)
    role = serializers.CharField(source="application.role", read_only=True)

    class Meta:
        model = Interview
        fields = "__all__"
        extra_kwargs = {
            "user": {"read_only": True},
        }

    def validate_application(self, application):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            if application.user_id not in (None, request.user.id):
                raise serializers.ValidationError("That application does not belong to you.")
        return application


class ResumeSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            "id",
            "title",
            "target_role",
            "notes",
            "file",
            "file_url",
            "is_default",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "file": {"write_only": True, "required": False},
        }

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        if obj.file:
            return obj.file.url
        return ""


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        exclude = ("user",)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("That username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("That email is already registered.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data["email"],
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)

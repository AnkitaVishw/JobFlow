from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from applications.views import (
    InterviewDetailView,
    InterviewListCreateView,
    LoginView,
    ProfileView,
    RegisterView,
    ForgotPasswordView,
    ResetPasswordView,
    ResumeDetailView,
    ResumeListCreateView,
)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/login/", LoginView.as_view()),
    path("api/auth/forgot-password/", ForgotPasswordView.as_view()),
    path("api/auth/reset-password/", ResetPasswordView.as_view()),
    path(
        "api/applications/",
        include("applications.urls"),
    ),
    path("api/interviews/", InterviewListCreateView.as_view()),
    path("api/interviews/<int:pk>/", InterviewDetailView.as_view()),
    path("api/resumes/", ResumeListCreateView.as_view()),
    path("api/resumes/<int:pk>/", ResumeDetailView.as_view()),
    path("api/profile/", ProfileView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

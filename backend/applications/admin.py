from django.contrib import admin
from .models import Interview, JobApplication, Profile, Resume, StatusHistory


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("company", "role", "status", "resume", "date_applied")


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ("application", "interview_type", "scheduled_at", "status")


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("title", "target_role", "is_default", "updated_at")


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "target_role", "weekly_goal")


@admin.register(StatusHistory)
class StatusHistoryAdmin(admin.ModelAdmin):
    list_display = ("application", "from_status", "to_status", "changed_at")

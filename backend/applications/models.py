from django.conf import settings
from django.db import models
from django.utils import timezone


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("Applied", "Applied"),
        ("Screening", "Screening"),
        ("Interview", "Interview"),
        ("Technical Round", "Technical Round"),
        ("Offer", "Offer"),
        ("Rejected", "Rejected"),
    ]

    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="Applied",
    )
    salary = models.CharField(max_length=100, blank=True)
    job_url = models.URLField(blank=True)
    date_applied = models.DateField(default=timezone.localdate)
    follow_up_on = models.DateField(blank=True, null=True)
    next_action = models.CharField(max_length=300, blank=True)
    recruiter_name = models.CharField(max_length=200, blank=True)
    recruiter_email = models.EmailField(blank=True)
    recruiter_linkedin = models.URLField(blank=True)
    resume = models.ForeignKey(
        "Resume",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applications",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company} - {self.role}"


class Interview(models.Model):
    TYPE_CHOICES = [
        ("Phone Screen", "Phone Screen"),
        ("HR", "HR"),
        ("Technical", "Technical"),
        ("Hiring Manager", "Hiring Manager"),
        ("Onsite", "Onsite"),
        ("Offer Discussion", "Offer Discussion"),
    ]
    STATUS_CHOICES = [
        ("Upcoming", "Upcoming"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="interviews",
    )
    scheduled_at = models.DateTimeField()
    interview_type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        default="Technical",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Upcoming",
    )
    meeting_link = models.CharField(max_length=500, blank=True)
    notes = models.TextField(blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interviews",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["scheduled_at"]

    def __str__(self):
        return f"{self.application.company} - {self.interview_type}"


class Resume(models.Model):
    title = models.CharField(max_length=200)
    target_role = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    file = models.FileField(upload_to="resumes/", blank=True, null=True)
    is_default = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resumes",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-updated_at"]

    def __str__(self):
        return self.title


class StatusHistory(models.Model):
    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="status_history",
    )
    from_status = models.CharField(max_length=50, blank=True)
    to_status = models.CharField(max_length=50)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["changed_at"]

    def __str__(self):
        return f"{self.application_id}: {self.from_status} → {self.to_status}"


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
        null=True,
        blank=True,
    )
    full_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    target_role = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    weekly_goal = models.PositiveIntegerField(default=5)
    notify_interviews = models.BooleanField(default=True)

    def __str__(self):
        return self.full_name or "JobFlow profile"


class AuthToken(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="auth_token",
    )
    key = models.CharField(max_length=40, unique=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.key
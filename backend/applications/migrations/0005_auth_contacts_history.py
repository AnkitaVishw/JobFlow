from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def backfill_status_history(apps, schema_editor):
    JobApplication = apps.get_model("applications", "JobApplication")
    StatusHistory = apps.get_model("applications", "StatusHistory")
    for application in JobApplication.objects.all():
        StatusHistory.objects.create(
            application=application,
            from_status="",
            to_status=application.status,
        )


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("applications", "0004_application_resume"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobapplication",
            name="recruiter_name",
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="recruiter_email",
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="recruiter_linkedin",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="applications",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="interview",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="interviews",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="resume",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="resumes",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="profile",
            name="user",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="profile",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.CreateModel(
            name="StatusHistory",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("from_status", models.CharField(blank=True, max_length=50)),
                ("to_status", models.CharField(max_length=50)),
                ("changed_at", models.DateTimeField(auto_now_add=True)),
                (
                    "application",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="status_history",
                        to="applications.jobapplication",
                    ),
                ),
            ],
            options={
                "ordering": ["changed_at"],
            },
        ),
        migrations.RunPython(backfill_status_history, migrations.RunPython.noop),
        migrations.CreateModel(
            name="AuthToken",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("key", models.CharField(max_length=40, unique=True)),
                ("created", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="auth_token",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]

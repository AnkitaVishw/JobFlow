from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Profile",
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
                ("full_name", models.CharField(blank=True, max_length=200)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("target_role", models.CharField(blank=True, max_length=200)),
                ("location", models.CharField(blank=True, max_length=200)),
                ("weekly_goal", models.PositiveIntegerField(default=5)),
                ("notify_interviews", models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name="Resume",
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
                ("title", models.CharField(max_length=200)),
                ("target_role", models.CharField(blank=True, max_length=200)),
                ("notes", models.TextField(blank=True)),
                (
                    "file",
                    models.FileField(blank=True, null=True, upload_to="resumes/"),
                ),
                ("is_default", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-is_default", "-updated_at"],
            },
        ),
        migrations.CreateModel(
            name="Interview",
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
                ("scheduled_at", models.DateTimeField()),
                (
                    "interview_type",
                    models.CharField(
                        choices=[
                            ("Phone Screen", "Phone Screen"),
                            ("HR", "HR"),
                            ("Technical", "Technical"),
                            ("Hiring Manager", "Hiring Manager"),
                            ("Onsite", "Onsite"),
                            ("Offer Discussion", "Offer Discussion"),
                        ],
                        default="Technical",
                        max_length=50,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("Upcoming", "Upcoming"),
                            ("Completed", "Completed"),
                            ("Cancelled", "Cancelled"),
                        ],
                        default="Upcoming",
                        max_length=20,
                    ),
                ),
                ("meeting_link", models.CharField(blank=True, max_length=500)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "application",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="interviews",
                        to="applications.jobapplication",
                    ),
                ),
            ],
            options={
                "ordering": ["scheduled_at"],
            },
        ),
    ]

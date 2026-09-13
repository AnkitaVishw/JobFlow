from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0002_interview_resume_profile"),
    ]

    operations = [
        migrations.AlterField(
            model_name="jobapplication",
            name="date_applied",
            field=models.DateField(default=django.utils.timezone.localdate),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="follow_up_on",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="next_action",
            field=models.CharField(blank=True, max_length=300),
        ),
    ]

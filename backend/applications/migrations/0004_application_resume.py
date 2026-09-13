from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0003_application_follow_up"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobapplication",
            name="resume",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="applications",
                to="applications.resume",
            ),
        ),
    ]

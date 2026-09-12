from django.db import models

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


    def __str__(self):
        return f"{self.company} - {self.role}"

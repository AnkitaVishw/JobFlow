from rest_framework import generics
from .models import JobApplication
from .serializers import JobApplicationSerializer


class JobApplicationListCreateView(generics.ListCreateAPIView):
    queryset = JobApplication.objects.all().order_by("-created_at")
    serializer_class = JobApplicationSerializer


class JobApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
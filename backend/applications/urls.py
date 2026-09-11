from django.urls import path
from .views import JobApplicationListCreateView


urlpatterns = [
    path(
        "",
        JobApplicationListCreateView.as_view(),
        name="application-list-create",
    ),
]
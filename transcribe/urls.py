from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/scribe-token", views.scribe_token, name="scribe_token"),
]

from django.urls import path
from . import views

urlpatterns = [
    path('', views.sessions, name='tracker'),
    path('daily/', views.daily_summary, name='daily_summary'),
    path('weekly/', views.weekly_summary, name='weekly_summary'),
]
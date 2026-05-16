from django.urls import path
from . import views

urlpatterns = [
    path('', views.subjects, name='subjects'),
    path('<int:subject_id>/', views.subject_detail, name='subject_detail'),
    path('<int:subject_id>/log/', views.log_subject_session, name='log_subject_session'),
    path('exams/', views.exams, name='exams'),
    path('exams/<int:exam_id>/', views.exam_detail, name='exam_detail'),
]
from django.urls import path
from . import views

urlpatterns = [
    path('', views.squads, name='squads'),
    path('join/', views.join_squad, name='join_squad'),
    path('<int:squad_id>/', views.squad_detail, name='squad_detail'),
    path('<int:squad_id>/leave/', views.leave_squad, name='leave_squad'),
]
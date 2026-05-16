from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/sessions/', include('focus_sessions.urls')),  # ← changed
    path('api/streaks/', include('streaks.urls')),
    path('api/squads/', include('squads.urls')),
    path('api/subjects/', include('subjects.urls')),
]
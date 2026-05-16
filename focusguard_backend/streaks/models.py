from django.db import models
from django.contrib.auth.models import User

class Streak(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    total_study_days = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.current_streak} days"
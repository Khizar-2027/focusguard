from django.db import models
from django.contrib.auth.models import User

class CustomUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    daily_study_goal = models.IntegerField(default=120)
    daily_reels_limit = models.IntegerField(default=60)
    distraction_sites = models.TextField(
        default='instagram.com,youtube.com,facebook.com,tiktok.com,twitter.com,reddit.com'
    )
    productive_sites = models.TextField(
        default='chatgpt.com,claude.ai,khanacademy.org,coursera.org,notion.so,github.com'
    )
    # Pomodoro settings
    pomodoro_work_minutes = models.IntegerField(default=45)
    pomodoro_break_minutes = models.IntegerField(default=10)
    playlist_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

    def get_distraction_sites(self):
        return [s.strip() for s in self.distraction_sites.split(',') if s.strip()]

    def get_productive_sites(self):
        return [s.strip() for s in self.productive_sites.split(',') if s.strip()]
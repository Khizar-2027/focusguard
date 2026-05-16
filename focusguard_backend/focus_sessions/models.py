from django.db import models
from django.contrib.auth.models import User

class FocusSession(models.Model):
    SESSION_TYPES = [
        ('study', 'Study'),
        ('reels', 'Reels/Distraction'),
        ('break', 'Break'),
    ]
    SOURCE_TYPES = [
        ('manual', 'Manual Timer'),
        ('extension', 'Browser Extension'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='focus_sessions')
    session_type = models.CharField(max_length=10, choices=SESSION_TYPES)
    source = models.CharField(max_length=10, choices=SOURCE_TYPES, default='manual')
    duration = models.IntegerField()  # in seconds
    date = models.DateField(auto_now_add=True)
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} - {self.session_type} - {self.duration}s"
from django.db import models
from django.contrib.auth.models import User

class Subject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#6C63FF')  # hex color
    target_hours = models.IntegerField(default=10)  # total hours goal
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"

class Exam(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exams')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exams', null=True, blank=True)
    name = models.CharField(max_length=200)
    exam_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['exam_date']

    def __str__(self):
        return f"{self.user.username} - {self.name} on {self.exam_date}"

class SubjectSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subject_sessions')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='sessions')
    duration = models.IntegerField()  # seconds
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject.name} - {self.duration}s"
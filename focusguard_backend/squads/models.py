from django.db import models
from django.contrib.auth.models import User
import random
import string

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class Squad(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=6, unique=True, default=generate_code)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_squads')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class SquadMember(models.Model):
    squad = models.ForeignKey(Squad, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='squad_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['squad', 'user']

    def __str__(self):
        return f"{self.user.username} in {self.squad.name}"
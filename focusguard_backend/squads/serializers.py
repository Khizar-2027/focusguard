from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Squad, SquadMember
from focus_sessions.models import FocusSession
from django.utils import timezone

class SquadMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    study_today = serializers.SerializerMethodField()
    streak = serializers.SerializerMethodField()

    class Meta:
        model = SquadMember
        fields = ['username', 'study_today', 'streak', 'joined_at']

    def get_study_today(self, obj):
        today = timezone.now().date()
        sessions = FocusSession.objects.filter(
            user=obj.user, date=today, session_type='study'
        )
        return sum(s.duration for s in sessions)

    def get_streak(self, obj):
        try:
            return obj.user.streak.current_streak
        except:
            return 0

class SquadSerializer(serializers.ModelSerializer):
    members = SquadMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Squad
        fields = ['id', 'name', 'code', 'created_by_username', 'member_count', 'members', 'created_at']

    def get_member_count(self, obj):
        return obj.members.count()
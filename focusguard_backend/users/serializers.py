from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    daily_study_goal = serializers.IntegerField(default=120)
    daily_reels_limit = serializers.IntegerField(default=60)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'daily_study_goal', 'daily_reels_limit']

    def create(self, validated_data):
        daily_study_goal = validated_data.pop('daily_study_goal', 120)
        daily_reels_limit = validated_data.pop('daily_reels_limit', 60)
        user = User.objects.create_user(**validated_data)
        CustomUser.objects.create(
            user=user,
            daily_study_goal=daily_study_goal,
            daily_reels_limit=daily_reels_limit,
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.CharField(source='user.email')
    distraction_sites_list = serializers.SerializerMethodField()
    productive_sites_list = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'username', 'email',
            'daily_study_goal', 'daily_reels_limit',
            'distraction_sites', 'productive_sites',
            'distraction_sites_list', 'productive_sites_list',
            'pomodoro_work_minutes', 'pomodoro_break_minutes',
            'playlist_url',
            'created_at',
        ]

    def get_distraction_sites_list(self, obj):
        return obj.get_distraction_sites()

    def get_productive_sites_list(self, obj):
        return obj.get_productive_sites()
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Streak
from .serializers import StreakSerializer
from focus_sessions.models import FocusSession  # ← was 'sessions.models'
from users.models import CustomUser

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_streak(request):
    streak, created = Streak.objects.get_or_create(user=request.user)
    today = timezone.now().date()

    # Check if user met their goal today
    today_sessions = FocusSession.objects.filter(user=request.user, date=today)
    study_today = sum(s.duration for s in today_sessions if s.session_type == 'study')

    try:
        profile = CustomUser.objects.get(user=request.user)
        goal_seconds = profile.daily_study_goal * 60
        goal_met = study_today >= goal_seconds
    except:
        goal_met = False
        goal_seconds = 7200

    # Update streak
    if goal_met and streak.last_active_date != today:
        from datetime import timedelta
        yesterday = today - timedelta(days=1)
        if streak.last_active_date == yesterday:
            streak.current_streak += 1
        else:
            streak.current_streak = 1
        streak.last_active_date = today
        streak.total_study_days += 1
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
        streak.save()

    serializer = StreakSerializer(streak)
    return Response({
        **serializer.data,
        'goal_met_today': goal_met,
        'study_today_seconds': study_today,
        'goal_seconds': goal_seconds,
    })
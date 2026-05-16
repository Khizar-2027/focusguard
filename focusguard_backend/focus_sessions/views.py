from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import FocusSession
from .serializers import FocusSessionSerializer
from users.models import CustomUser
from focus_sessions.models import FocusSession  # if self-referencing anywhere

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def sessions(request):
    if request.method == 'GET':
        date_filter = request.query_params.get('date', None)
        if date_filter:
            qs = FocusSession.objects.filter(user=request.user, date=date_filter)
        else:
            qs = FocusSession.objects.filter(user=request.user)
        serializer = FocusSessionSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = FocusSessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_summary(request):
    today = timezone.now().date()
    sessions_today = FocusSession.objects.filter(user=request.user, date=today)

    study_time = sum(s.duration for s in sessions_today if s.session_type == 'study')
    reels_time = sum(s.duration for s in sessions_today if s.session_type == 'reels')
    break_time = sum(s.duration for s in sessions_today if s.session_type == 'break')
    total_time = study_time + reels_time + break_time

    productivity_score = round((study_time / total_time * 100), 1) if total_time > 0 else 0

    try:
        profile = CustomUser.objects.get(user=request.user)
        reels_limit = profile.daily_reels_limit * 60  # convert to seconds
        limit_exceeded = reels_time > reels_limit
    except:
        limit_exceeded = False
        reels_limit = 3600

    return Response({
        'date': today,
        'study_time': study_time,
        'reels_time': reels_time,
        'break_time': break_time,
        'total_time': total_time,
        'productivity_score': productivity_score,
        'limit_exceeded': limit_exceeded,
        'reels_limit': reels_limit,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_summary(request):
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    sessions = FocusSession.objects.filter(user=request.user, date__gte=week_ago)

    daily_data = {}
    for i in range(7):
        day = today - timedelta(days=i)
        day_sessions = [s for s in sessions if s.date == day]
        study = sum(s.duration for s in day_sessions if s.session_type == 'study')
        reels = sum(s.duration for s in day_sessions if s.session_type == 'reels')
        daily_data[str(day)] = {'study': study, 'reels': reels}

    return Response(daily_data)
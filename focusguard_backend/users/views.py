from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserProfileSerializer
from .models import CustomUser

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    try:
        user_profile = CustomUser.objects.get(user=request.user)
    except CustomUser.DoesNotExist:
        user_profile = CustomUser.objects.create(user=request.user)

    if request.method == 'GET':
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)

    if request.method == 'PUT':
        try:
            if 'daily_study_goal' in request.data:
                val = int(request.data['daily_study_goal'])
                if val < 1:
                    return Response({'error': 'Study goal must be positive'}, status=400)
                user_profile.daily_study_goal = val

            if 'daily_reels_limit' in request.data:
                val = int(request.data['daily_reels_limit'])
                if val < 1:
                    return Response({'error': 'Reels limit must be positive'}, status=400)
                user_profile.daily_reels_limit = val

            if 'distraction_sites' in request.data:
                raw = request.data['distraction_sites']
                if isinstance(raw, list):
                    sites = [s.strip().lower() for s in raw if s.strip()]
                else:
                    sites = [s.strip().lower() for s in str(raw).split(',') if s.strip()]
                user_profile.distraction_sites = ','.join(sites)

            if 'productive_sites' in request.data:
                raw = request.data['productive_sites']
                if isinstance(raw, list):
                    sites = [s.strip().lower() for s in raw if s.strip()]
                else:
                    sites = [s.strip().lower() for s in str(raw).split(',') if s.strip()]
                user_profile.productive_sites = ','.join(sites)

            if 'pomodoro_work_minutes' in request.data:
                val = int(request.data['pomodoro_work_minutes'])
                if val < 1:
                    return Response({'error': 'Work minutes must be positive'}, status=400)
                user_profile.pomodoro_work_minutes = val

            if 'pomodoro_break_minutes' in request.data:
                val = int(request.data['pomodoro_break_minutes'])
                if val < 1:
                    return Response({'error': 'Break minutes must be positive'}, status=400)
                user_profile.pomodoro_break_minutes = val

            if 'playlist_url' in request.data:
                user_profile.playlist_url = request.data['playlist_url']

            user_profile.save()
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data)

        except (ValueError, TypeError) as e:
            return Response({'error': f'Invalid value: {str(e)}'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sites(request):
    try:
        user_profile = CustomUser.objects.get(user=request.user)
    except CustomUser.DoesNotExist:
        user_profile = CustomUser.objects.create(user=request.user)

    return Response({
        'distraction_sites': user_profile.get_distraction_sites(),
        'productive_sites': user_profile.get_productive_sites(),
    })
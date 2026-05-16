from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Subject, Exam, SubjectSession
from .serializers import SubjectSerializer, ExamSerializer, SubjectSessionSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subjects(request):
    if request.method == 'GET':
        qs = Subject.objects.filter(user=request.user).prefetch_related('sessions', 'exams')
        return Response(SubjectSerializer(qs, many=True).data)

    if request.method == 'POST':
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def subject_detail(request, subject_id):
    try:
        subject = Subject.objects.get(id=subject_id, user=request.user)
    except Subject.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if request.method == 'PUT':
        for field in ['name', 'color', 'target_hours']:
            if field in request.data:
                setattr(subject, field, request.data[field])
        subject.save()
        return Response(SubjectSerializer(subject).data)

    if request.method == 'DELETE':
        subject.delete()
        return Response({'message': 'Deleted'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_subject_session(request, subject_id):
    try:
        subject = Subject.objects.get(id=subject_id, user=request.user)
    except Subject.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    duration = request.data.get('duration')
    if not duration or int(duration) < 1:
        return Response({'error': 'Invalid duration'}, status=400)

    session = SubjectSession.objects.create(
        user=request.user,
        subject=subject,
        duration=int(duration)
    )
    return Response(SubjectSessionSerializer(session).data, status=201)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def exams(request):
    if request.method == 'GET':
        today = timezone.now().date()
        qs = Exam.objects.filter(user=request.user, exam_date__gte=today)
        return Response(ExamSerializer(qs, many=True).data)

    if request.method == 'POST':
        serializer = ExamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def exam_detail(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id, user=request.user)
    except Exam.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if request.method == 'PUT':
        if 'name' in request.data:
            exam.name = request.data['name']
        if 'exam_date' in request.data:
            exam.exam_date = request.data['exam_date']
        if 'notes' in request.data:
            exam.notes = request.data['notes']
        exam.save()
        return Response(ExamSerializer(exam).data)

    if request.method == 'DELETE':
        exam.delete()
        return Response({'message': 'Deleted'})
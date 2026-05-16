from rest_framework import serializers
from django.utils import timezone
from .models import Subject, Exam, SubjectSession

class SubjectSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectSession
        fields = '__all__'
        read_only_fields = ['user', 'date']

class SubjectSerializer(serializers.ModelSerializer):
    total_studied = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()
    exams = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'color', 'target_hours', 'total_studied', 'progress_percent', 'exams', 'created_at']
        read_only_fields = ['user']

    def get_total_studied(self, obj):
        total = sum(s.duration for s in obj.sessions.all())
        return total  # in seconds

    def get_progress_percent(self, obj):
        total = sum(s.duration for s in obj.sessions.all())
        target = obj.target_hours * 3600
        if target == 0:
            return 0
        return min(100, round((total / target) * 100, 1))

    def get_exams(self, obj):
        today = timezone.now().date()
        upcoming = obj.exams.filter(exam_date__gte=today).order_by('exam_date')
        return ExamSerializer(upcoming, many=True).data

class ExamSerializer(serializers.ModelSerializer):
    days_left = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    subject_color = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = ['id', 'name', 'exam_date', 'notes', 'subject', 'subject_name', 'subject_color', 'days_left', 'created_at']
        read_only_fields = ['user']

    def get_days_left(self, obj):
        today = timezone.now().date()
        delta = obj.exam_date - today
        return delta.days

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else None

    def get_subject_color(self, obj):
        return obj.subject.color if obj.subject else '#6C63FF'
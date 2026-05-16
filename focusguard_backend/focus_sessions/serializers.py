from rest_framework import serializers
from .models import FocusSession

class FocusSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSession
        fields = '__all__'
        read_only_fields = ['user', 'date']
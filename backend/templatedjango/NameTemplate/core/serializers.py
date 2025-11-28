from rest_framework import serializers

from .models import persons


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = persons
        fields = '__all__'


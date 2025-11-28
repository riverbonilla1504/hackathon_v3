from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import persons
from .serializers import PersonSerializer

class GetAllPersonsView(APIView):
    def get(self, request):
        persons_list = persons.objects.all()
        serializer = PersonSerializer(persons_list, many=True)
        return Response({"persons": serializer.data})

class GetPersonView(APIView):
    def get(self, request, name):
        person = persons.objects.filter(name=name)
        serializer = PersonSerializer(person, many=True)
        return Response({"person": serializer.data})

class CreatePersonView(APIView):
    def post(self, request):  # Asegúrate de que este método esté definido correctamente
        serializer = PersonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdatePersonView(APIView):
    def put(self, request, id):
        try:
            person = persons.objects.get(id=id)
        except persons.DoesNotExist:
            return Response({"error": "Person not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PersonSerializer(person, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeletePersonView(APIView):
    def delete(self, request, person_id):
        try:
            person = persons.objects.get(id=person_id)
            person.delete()
            return Response({"message": "Person deleted successfully"}, status=status.HTTP_200_OK)
        except persons.DoesNotExist:
            return Response({"error": "Person not found"}, status=status.HTTP_404_NOT_FOUND)


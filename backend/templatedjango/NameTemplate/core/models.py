from django.db import models
from core.managers import PersonManager

class persons(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    age = models.IntegerField()
    email = models.EmailField()
    objects = PersonManager()



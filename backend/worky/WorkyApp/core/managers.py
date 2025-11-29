from django.db import models

class PersonManager(models.Manager):
    def create_person(self, name, lastname, age, email):
        person = self.create(name=name, lastname=lastname, age=age, email=email)
        return person
    
    def get_person_by_name(self, name):
        return self.filter(name=name)
    
    def get_all_persons(self):
        return self.all()
    
    def update_person(self, id, name=None, lastname=None, age=None, email=None):
        person = self.get(id=id)
        if name:
            person.name = name
        if lastname:
            person.lastname = lastname
        if age:
            person.age = age
        if email:
            person.email = email
        person.save()
        return person
    
    def delete_person(self, id):
        person = self.get(id=id)
        person.delete()
        return person

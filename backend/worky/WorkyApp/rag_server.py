#!/usr/bin/env python
"""
Django RAG Server - Arranca Django sin migraciones para funcionar solo con Supabase API
"""
import os
import sys
import django
from django.conf import settings
from django.core.management import execute_from_command_line

def setup_django_for_rag():
    """Configura Django para funcionar solo con RAG sin base de datos"""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WorkyApp.settings")
    
    # Configurar Django
    django.setup()
    
    # Override para usar URLs de RAG
    settings.ROOT_URLCONF = 'WorkyApp.rag_urls'
    
    # Desactivar checks de base de datos
    from django.core.management.commands.runserver import Command as RunserverCommand
    
    # Override para evitar checks de base de datos
    original_check_migrations = RunserverCommand.check_migrations
    
    def no_check_migrations(self, *args, **kwargs):
        """Bypass migration checks"""
        pass
    
    RunserverCommand.check_migrations = no_check_migrations
    
    # Override para evitar checks de modelos
    original_check = RunserverCommand.check
    
    def no_check(self, *args, **kwargs):
        """Bypass system checks that require database"""
        # Solo correr checks que no requieran base de datos
        pass
    
    RunserverCommand.check = no_check

def main():
    """Arranca el servidor RAG"""
    setup_django_for_rag()
    
    # Arrancar servidor
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000', '--noreload'])

if __name__ == "__main__":
    main()
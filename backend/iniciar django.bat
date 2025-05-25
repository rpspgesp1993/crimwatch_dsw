@echo on

REM Ativa o ambiente virtual
call venv\Scripts\activate.bat

REM Executa o Django server usando python do venv
python manage.py runserver

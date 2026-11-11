FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Atualiza os pacotes do Linux e instala dependências necessárias para o PostgreSQL
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

# Documenta a porta utilizada
EXPOSE 8000

# Comando padrão de execução do container
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
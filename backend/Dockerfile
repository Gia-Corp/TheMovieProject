FROM python:3.12.4

WORKDIR /backend
COPY requirements.txt requirements.txt

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
RUN pip3 install --no-cache-dir --upgrade -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "-u","app.py"]
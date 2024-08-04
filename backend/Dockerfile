FROM python:3.12.4

WORKDIR /backend
COPY requirements.txt requirements.txt

RUN pip3 install --no-cache-dir --upgrade -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["flask", "run"]
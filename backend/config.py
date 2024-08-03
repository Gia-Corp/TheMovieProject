from os import getenv
from dotenv import load_dotenv

load_dotenv()

# Google Sheets config

SHEET_NAME = "test_movieproject"

CREDENTIALS = {
    "type": getenv("TYPE"),
    "project_id": getenv("PROJECT_ID"),
    "private_key_id": getenv("PRIVATE_KEY_ID"),
    "private_key": getenv("PRIVATE_KEY"),
    "client_email": getenv("CLIENT_EMAIL"),
    "client_id": getenv("CLIENT_ID"),
    "auth_uri": getenv("AUTH_URI"),
    "token_uri": getenv("TOKEN_URI"),
    "auth_provider_x509_cert_url": getenv("AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": getenv("CLIENT_X509_CERT_URL"),
}
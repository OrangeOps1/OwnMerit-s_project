from pymongo import MongoClient
from pymongo.database import Database

from app.config import settings


def create_client() -> MongoClient:
    return MongoClient(settings.mongodb_url)


def get_db(client: MongoClient) -> Database:
    return client[settings.mongodb_db_name]

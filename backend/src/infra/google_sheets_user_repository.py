import logging
import time

from src.domain import User
from src.application.exceptions import APIException


logger = logging.getLogger("api.db")


class GoogleSheetsUserRepository:
    def __init__(self, sheet):
        self.sheet = sheet

    # 1 CALL
    def total_users(self):
        start_time = time.perf_counter()
        try:
            total_users = len(self.sheet.col_values(1)) - 1
            logger.info(
                "db_operation",
                extra={
                    "operation": "total_users",
                    "sheet": "users",
                    "rows": total_users,
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return total_users
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "total_users",
                    "sheet": "users",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

    # 1 CALL
    def get_all(self):
        users_dicts = self.sheet.get_all_records(
            expected_headers=[
                "id",
                "nickname",
                "email",
                "hashed_password",
                "role",
                "profile_pic",
                "is_active",
            ]
        )
        return list(map(self._user_from_dict, users_dicts))

    # 1 CALL
    def get_by_id(self, id):
        start_time = time.perf_counter()
        try:
            users = self.get_all()
            user = next((u for u in users if u.id == id), None)
            if user is None:
                raise UserNotFoundError()

            logger.info(
                "db_operation",
                extra={
                    "operation": "get_by_id",
                    "sheet": "users",
                    "rows": len(users),
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return user
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "get_by_id",
                    "sheet": "users",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

    # 1 CALL
    def get_by_email(self, email):
        start_time = time.perf_counter()
        try:
            users = self.get_all()
            user = next((u for u in users if u.email == email), None)
            if user is None:
                raise UserNotFoundError()

            logger.info(
                "db_operation",
                extra={
                    "operation": "get_by_email",
                    "sheet": "users",
                    "rows": len(users),
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return user
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "get_by_email",
                    "sheet": "users",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

    def _user_from_dict(self, user_dict):
        return User(
            id=int(user_dict["id"]),
            nickname=user_dict["nickname"],
            email=user_dict["email"],
            hashed_password=user_dict["hashed_password"],
            role=user_dict["role"],
            profile_pic=user_dict["profile_pic"],
        )

    # 1 CALL
    def all_exist(self, ids):
        start_time = time.perf_counter()
        try:
            ids = set([str(id) for id in ids])
            existing_ids = set(self.sheet.col_values(1))
            all_exist = ids.issubset(existing_ids)
            logger.info(
                "db_operation",
                extra={
                    "operation": "all_exist",
                    "sheet": "users",
                    "rows": len(ids),
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return all_exist
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "all_exist",
                    "sheet": "users",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise


class UserNotFoundError(APIException):
    NOT_FOUND = 404

    def build_message(self, parameter):
        return "User not found"

    def get_status_code(self):
        return self.NOT_FOUND


class NotOwnUserError(APIException):
    FORBIDDEN = 403

    def build_message(self, parameter):
        return "That user is not yours"

    def get_status_code(self):
        return self.FORBIDDEN

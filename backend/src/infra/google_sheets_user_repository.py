from src.domain import User
from src.application.exceptions import APIException


class GoogleSheetsUserRepository:
    def __init__(self, sheet):
        self.sheet = sheet

    # 1 CALL
    def total_users(self):
        return len(self.sheet.col_values(1)) - 1

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
        users = self.get_all()
        for user in users:
            if user.id == id:
                return user

        raise UserNotFoundError()

    # 1 CALL
    def get_by_email(self, email):
        users = self.get_all()
        for user in users:
            if user.email == email:
                return user

        raise UserNotFoundError()

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
        ids = set([str(id) for id in ids])
        existing_ids = set(self.sheet.col_values(1))
        return ids.issubset(existing_ids)


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

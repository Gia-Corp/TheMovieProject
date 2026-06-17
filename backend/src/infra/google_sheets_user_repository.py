from gspread import utils
from src.domain import User
from src.application.exceptions import ApiException


class GoogleSheetsUserRepository:
    def __init__(self, sheet):
        self.sheet = sheet

    # 1 CALL
    def get_user_count(self):
        return len(self.get_all())

    # 1 CALL
    def get_all(self):
        raw_users = self.sheet.get_all_records()
        users = list(map(self._transform_into_user, raw_users))
        return users

    # 2 CALLS
    def get_by_id(self, id):
        cell = self.sheet.find(str(id), in_column=1)
        if not cell:
            return

        raw_users = self.sheet.get(f"A{cell.row}:G{cell.row}")
        users = self._dicts_to_users(raw_users)
        return users[0]

    # 2 CALLS
    def get_by_email(self, email):
        cell = self.sheet.find(str(email), in_column=3)
        if not cell:
            return

        raw_users = self.sheet.get(f"A{cell.row}:G{cell.row}")
        users = self._dicts_to_users(raw_users)
        return users[0]

    def _dicts_to_users(self, dicts):
        raw_users = utils.to_records(
            [
                "id",
                "nickname",
                "email",
                "hashed_password",
                "role",
                "profile_pic",
                "is_active",
            ],
            dicts,
        )
        return list(map(self._transform_into_user, raw_users))

    def _transform_into_user(self, raw_user):
        user = User(
            id=int(raw_user["id"]),
            nickname=raw_user["nickname"],
            email=raw_user["email"],
            hashed_password=raw_user["hashed_password"],
            role=raw_user["role"],
            profile_pic=raw_user["profile_pic"],
        )
        return user

    # 1 CALL
    def all_exist(self, ids):
        ids = set([str(id) for id in ids])
        existing_ids = set(self.sheet.col_values(1))
        return ids.issubset(existing_ids)


class UserNotFoundError(ApiException):
    NOT_FOUND = 404

    def build_message(self, parameter):
        return "User not found"

    def get_status_code(self):
        return self.NOT_FOUND

from gspread import utils
from src.domain import User
from src.application.exceptions import ApiException


class GoogleSheetsUserRepository:
    def __init__(self, sheet):
        self.sheet = sheet

    # 1 CALL
    def total_users(self):
        return len(self.sheet.col_values(1)) - 1

    # 1 CALL
    def get_all(self):
        users_dicts = self.sheet.get_all_records()
        return list(map(self._user_from_dict, users_dicts))

    # 1 CALL
    def get_by_id(self, id):
        users = self.get_all()
        for user in users:
            if user.id == id:
                return user

        raise UserNotFoundError()

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
        return list(map(self._user_from_dict, raw_users))

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


class UserNotFoundError(ApiException):
    NOT_FOUND = 404

    def build_message(self, parameter):
        return "User not found"

    def get_status_code(self):
        return self.NOT_FOUND

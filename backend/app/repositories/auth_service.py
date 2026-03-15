from typing import Optional
from app.repositories.auth_repo import get_user_by_email 

class AuthService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AuthService, cls).__new__(cls)
            cls._instance.current_user = None
        return cls._instance

    def login(self, email: str, password_hash: str):
        user = get_user_by_email(email)

        if user and user["password_hash"] == password_hash:
            self.current_user = user
            return user

        return None

    def logout(self):
        self.current_user = None

    def get_current_user(self) -> Optional[dict]:
        return self.current_user
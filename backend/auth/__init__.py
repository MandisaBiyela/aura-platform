"""Authentication (JWT, password hashing)."""

from backend.auth.deps import get_current_user
from backend.auth.router import router

__all__ = ["get_current_user", "router"]

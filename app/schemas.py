from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, StrictStr, field_validator


class UserCreate(BaseModel):
    username: StrictStr
    email: StrictStr

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if "@" not in value:
            raise ValueError("email must contain @")
        return value


class UserUpdate(BaseModel):
    username: StrictStr | None = None
    email: StrictStr | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is not None and "@" not in value:
            raise ValueError("email must contain @")
        return value


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    created_at: datetime


class URLOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    short_code: str
    original_url: str
    title: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class URLUpdate(BaseModel):
    title: StrictStr | None = None
    is_active: bool | None = None


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url_id: int | None
    user_id: int | None
    event_type: str
    timestamp: datetime
    details: dict[str, Any]

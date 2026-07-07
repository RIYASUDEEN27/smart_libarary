from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BookBase(BaseModel):
    book_name: str
    author: Optional[str] = "Unknown"
    book_id: Optional[str] = "AUTO_GENERATED"
    category: Optional[str] = "Programming"
    publisher: Optional[str] = "Unknown"
    edition: Optional[str] = "1st Edition"
    total_copies: int
    available_copies: int

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    book_name: Optional[str] = None
    author: Optional[str] = None
    book_id: Optional[str] = None
    category: Optional[str] = None
    publisher: Optional[str] = None
    edition: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None

class BookInDB(BookBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

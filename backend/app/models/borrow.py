from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BorrowBase(BaseModel):
    book_id: str

class BorrowCreate(BorrowBase):
    pass

class BorrowInDB(BorrowBase):
    id: str = Field(alias="_id")
    user_id: str
    borrow_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: str # "Borrowed" or "Returned"
    fine: float = 0.0

class ReturnBook(BaseModel):
    borrow_id: str

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.models.book import BookCreate, BookUpdate, BookInDB
from app.models.user import UserInDB
from app.routes.auth import get_current_admin, get_current_user
from app.database import db
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[BookInDB])
async def get_books(
    search: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    query = {}
    if search:
        query["$or"] = [
            {"book_name": {"$regex": search, "$options": "i"}},
            {"author": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]
    if category:
        query["category"] = category

    cursor = db.db["books"].find(query).skip(skip).limit(limit)
    books = await cursor.to_list(length=limit)
    for book in books:
        book["_id"] = str(book["_id"])
    return books

@router.post("/", response_model=BookInDB)
async def create_book(book: BookCreate, current_user: UserInDB = Depends(get_current_user)):
    clean_book = {k: v for k, v in book.dict().items() if v != ""}
    book_with_defaults = BookCreate(**clean_book)
    new_book = book_with_defaults.dict()
    new_book["created_at"] = datetime.utcnow()
    result = await db.db["books"].insert_one(new_book)
    new_book["_id"] = str(result.inserted_id)
    return new_book

@router.get("/{id}", response_model=BookInDB)
async def get_book(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    book = await db.db["books"].find_one({"_id": ObjectId(id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    book["_id"] = str(book["_id"])
    return book

@router.put("/{id}", response_model=BookInDB)
async def update_book(id: str, book_update: BookUpdate, current_user: UserInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    update_dict = book_update.dict(exclude_unset=True)
    update_data = {}
    for k, v in update_dict.items():
        if v is not None:
            if v == "":
                if k == "author": v = "Unknown"
                elif k == "book_id": v = "AUTO_GENERATED"
                elif k == "category": v = "Programming"
                elif k == "publisher": v = "Unknown"
                elif k == "edition": v = "1st Edition"
            update_data[k] = v

    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
        
    result = await db.db["books"].update_one(
        {"_id": ObjectId(id)}, {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Book not found or no changes made")
        
    updated_book = await db.db["books"].find_one({"_id": ObjectId(id)})
    updated_book["_id"] = str(updated_book["_id"])
    return updated_book

@router.delete("/{id}")
async def delete_book(id: str, current_user: UserInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    result = await db.db["books"].delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"message": "Book deleted successfully"}

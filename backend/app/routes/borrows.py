from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.borrow import BorrowCreate, BorrowInDB, ReturnBook
from app.models.user import UserInDB
from app.routes.auth import get_current_user, get_current_admin
from app.database import db
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter()

FINE_PER_DAY = 10.0

@router.post("/borrow", response_model=BorrowInDB)
async def borrow_book(borrow_data: BorrowCreate, current_user: UserInDB = Depends(get_current_user)):
    # Check if book exists and is available
    if not ObjectId.is_valid(borrow_data.book_id):
        raise HTTPException(status_code=400, detail="Invalid Book ID")
    
    book = await db.db["books"].find_one({"_id": ObjectId(borrow_data.book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book["available_copies"] <= 0:
        raise HTTPException(status_code=400, detail="Book is out of stock")
    
    # Check if user already borrowed this book and hasn't returned it
    existing_borrow = await db.db["borrow_history"].find_one({
        "user_id": current_user.id,
        "book_id": borrow_data.book_id,
        "status": "Borrowed"
    })
    
    if existing_borrow:
        raise HTTPException(status_code=400, detail="You have already borrowed this book and not returned it.")
    
    # Decrease available copies
    await db.db["books"].update_one(
        {"_id": ObjectId(borrow_data.book_id)},
        {"$inc": {"available_copies": -1}}
    )
    
    # Create borrow record
    borrow_record = {
        "user_id": current_user.id,
        "book_id": borrow_data.book_id,
        "borrow_date": datetime.utcnow(),
        "due_date": datetime.utcnow() + timedelta(days=14), # 14 days borrowing period
        "return_date": None,
        "status": "Borrowed",
        "fine": 0.0
    }
    
    result = await db.db["borrow_history"].insert_one(borrow_record)
    borrow_record["_id"] = str(result.inserted_id)
    
    return borrow_record

@router.post("/return", response_model=BorrowInDB)
async def return_book(return_data: ReturnBook, current_user: UserInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(return_data.borrow_id):
        raise HTTPException(status_code=400, detail="Invalid Borrow ID")
        
    borrow_record = await db.db["borrow_history"].find_one({
        "_id": ObjectId(return_data.borrow_id),
        "user_id": current_user.id
    })
    
    if not borrow_record:
        raise HTTPException(status_code=404, detail="Borrow record not found or not belonging to you")
    
    if borrow_record["status"] == "Returned":
        raise HTTPException(status_code=400, detail="Book already returned")
        
    return_date = datetime.utcnow()
    fine = 0.0
    
    # Calculate fine
    if return_date > borrow_record["due_date"]:
        days_late = (return_date - borrow_record["due_date"]).days
        if days_late > 0:
            fine = float(days_late * FINE_PER_DAY)
            
    # Update borrow record
    update_data = {
        "status": "Returned",
        "return_date": return_date,
        "fine": fine
    }
    
    await db.db["borrow_history"].update_one(
        {"_id": ObjectId(return_data.borrow_id)},
        {"$set": update_data}
    )
    
    # Increase available copies
    await db.db["books"].update_one(
        {"_id": ObjectId(borrow_record["book_id"])},
        {"$inc": {"available_copies": 1}}
    )
    
    borrow_record.update(update_data)
    borrow_record["_id"] = str(borrow_record["_id"])
    return borrow_record

@router.post("/renew", response_model=BorrowInDB)
async def renew_book(return_data: ReturnBook, current_user: UserInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(return_data.borrow_id):
        raise HTTPException(status_code=400, detail="Invalid Borrow ID")
        
    # Find the borrow record. If admin is trying to renew, they might not be the owner, but let's allow it if the user is owner or admin (for simplicity, we'll check if it exists).
    # Since we want admins to also use this, let's not restrict strictly by user_id if the user is admin.
    query = {"_id": ObjectId(return_data.borrow_id)}
    if current_user.role != 'admin':
        query["user_id"] = current_user.id
        
    borrow_record = await db.db["borrow_history"].find_one(query)
    
    if not borrow_record:
        raise HTTPException(status_code=404, detail="Borrow record not found or not belonging to you")
    
    if borrow_record["status"] == "Returned":
        raise HTTPException(status_code=400, detail="Cannot renew a returned book")
        
    # Extend due date by 14 days from the CURRENT due date
    new_due_date = borrow_record["due_date"] + timedelta(days=14)
    
    # Update borrow record
    update_data = {
        "due_date": new_due_date
    }
    
    await db.db["borrow_history"].update_one(
        {"_id": ObjectId(return_data.borrow_id)},
        {"$set": update_data}
    )
    
    borrow_record.update(update_data)
    borrow_record["_id"] = str(borrow_record["_id"])
    return borrow_record

@router.get("/history", response_model=List[dict])
async def get_user_history(current_user: UserInDB = Depends(get_current_user)):
    cursor = db.db["borrow_history"].aggregate([
        {"$match": {"user_id": current_user.id}},
        {"$addFields": {"book_obj_id": {"$toObjectId": "$book_id"}}},
        {
            "$lookup": {
                "from": "books",
                "localField": "book_obj_id",
                "foreignField": "_id",
                "as": "book_details"
            }
        },
        {"$unwind": "$book_details"}
    ])
    
    history = await cursor.to_list(length=100)
    
    result = []
    current_date = datetime.utcnow()
    for record in history:
        calculated_fine = record["fine"]
        duration_days = 0
        
        if record["status"] == "Borrowed":
            duration_days = (current_date - record["borrow_date"]).days
            if current_date > record["due_date"]:
                days_late = (current_date - record["due_date"]).days
                if days_late > 0:
                    calculated_fine = float(days_late * FINE_PER_DAY)
        else:
            if record["return_date"]:
                duration_days = (record["return_date"] - record["borrow_date"]).days

        result.append({
            "id": str(record["_id"]),
            "book_name": record["book_details"]["book_name"],
            "image": record["book_details"]["image"],
            "borrow_date": record["borrow_date"],
            "due_date": record["due_date"],
            "return_date": record["return_date"],
            "status": record["status"],
            "fine": calculated_fine,
            "duration_days": duration_days
        })
        
    return result

@router.get("/admin/history")
async def get_all_history(admin: UserInDB = Depends(get_current_admin)):
    cursor = db.db["borrow_history"].aggregate([
        {"$addFields": {"book_obj_id": {"$toObjectId": "$book_id"}, "user_obj_id": {"$toObjectId": "$user_id"}}},
        {
            "$lookup": {
                "from": "books",
                "localField": "book_obj_id",
                "foreignField": "_id",
                "as": "book_details"
            }
        },
        {"$unwind": "$book_details"},
        {
            "$lookup": {
                "from": "users",
                "localField": "user_obj_id",
                "foreignField": "_id",
                "as": "user_details"
            }
        },
        {"$unwind": "$user_details"}
    ])
    
    history = await cursor.to_list(length=500)
    result = []
    current_date = datetime.utcnow()
    for record in history:
        calculated_fine = record["fine"]
        duration_days = 0
        
        if record["status"] == "Borrowed":
            duration_days = (current_date - record["borrow_date"]).days
            if current_date > record["due_date"]:
                days_late = (current_date - record["due_date"]).days
                if days_late > 0:
                    calculated_fine = float(days_late * FINE_PER_DAY)
        else:
            if record["return_date"]:
                duration_days = (record["return_date"] - record["borrow_date"]).days

        result.append({
            "id": str(record["_id"]),
            "user_name": record["user_details"]["name"],
            "user_email": record["user_details"]["email"],
            "book_name": record["book_details"]["book_name"],
            "borrow_date": record["borrow_date"],
            "due_date": record["due_date"],
            "return_date": record["return_date"],
            "status": record["status"],
            "fine": calculated_fine,
            "duration_days": duration_days
        })
    return result

from fastapi import APIRouter, Depends, HTTPException
from app.routes.auth import get_current_admin, get_current_user
from app.models.user import UserInDB
from app.database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

FINE_PER_DAY = 10.0

@router.get("/dashboard")
async def get_dashboard_stats(admin: UserInDB = Depends(get_current_admin)):
    total_books = await db.db["books"].count_documents({})
    
    # Calculate available and borrowed books from copies
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_available": {"$sum": "$available_copies"},
                "total_copies": {"$sum": "$total_copies"}
            }
        }
    ]
    cursor = db.db["books"].aggregate(pipeline)
    result = await cursor.to_list(length=1)

    # Category breakdown
    category_pipeline = [
        {
            "$group": {
                "_id": "$category",
                "count": {"$sum": 1}
            }
        }
    ]
    cat_cursor = db.db["books"].aggregate(category_pipeline)
    cat_result = await cat_cursor.to_list(length=100)
    category_counts = {item["_id"]: item["count"] for item in cat_result}
    
    if result:
        total_available = result[0]["total_available"]
        total_copies = result[0]["total_copies"]
        borrowed_books = total_copies - total_available
    else:
        total_available = 0
        total_copies = 0
        borrowed_books = 0

    returned_books = await db.db["borrow_history"].count_documents({"status": "Returned"})
    total_users = await db.db["users"].count_documents({})
    
    now = datetime.utcnow()
    overdue_books = await db.db["borrow_history"].count_documents({
        "status": "Borrowed",
        "due_date": {"$lt": now}
    })

    # Calculate total fines (collected from returned books + accruing from overdue)
    fine_pipeline = [
        {"$match": {"status": "Returned", "fine": {"$gt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$fine"}}}
    ]
    fine_cursor = db.db["borrow_history"].aggregate(fine_pipeline)
    fine_result = await fine_cursor.to_list(length=1)
    total_fine_collected = fine_result[0]["total"] if fine_result else 0.0

    # Calculate pending fines from currently overdue books
    overdue_records_cursor = db.db["borrow_history"].find({
        "status": "Borrowed",
        "due_date": {"$lt": now}
    })
    overdue_records = await overdue_records_cursor.to_list(length=1000)
    pending_fine = 0.0
    for record in overdue_records:
        days_late = (now - record["due_date"]).days
        if days_late > 0:
            pending_fine += days_late * FINE_PER_DAY

    total_fine = total_fine_collected + pending_fine
    
    return {
        "total_books": total_copies,
        "available_books": total_available,
        "borrowed_books": borrowed_books,
        "returned_books": returned_books,
        "total_users": total_users,
        "overdue_books": overdue_books,
        "total_unique_titles": total_books,
        "total_fine": round(total_fine, 2),
        "total_fine_collected": round(total_fine_collected, 2),
        "pending_fine": round(pending_fine, 2),
        "categories": category_counts
    }

@router.get("/users")
async def get_all_users(admin: UserInDB = Depends(get_current_admin)):
    cursor = db.db["users"].find({}, {"password": 0})
    users = await cursor.to_list(length=500)
    for u in users:
        u["_id"] = str(u["_id"])
    return users

from app.models.user import UserCreate
from app.core.security import get_password_hash

@router.post("/users")
async def create_user(user: UserCreate, admin: UserInDB = Depends(get_current_admin)):
    existing = await db.db["users"].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password if user.password else "password123")
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": user.role if user.role else "student",
        "created_at": datetime.utcnow()
    }
    result = await db.db["users"].insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    return {"message": "User created successfully", "id": new_user["_id"]}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: UserInDB = Depends(get_current_admin)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    result = await db.db["users"].delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.get("/borrows")
async def get_all_borrows(admin: UserInDB = Depends(get_current_admin)):
    """Get all borrow records for admin management"""
    cursor = db.db["borrow_history"].aggregate([
        {"$addFields": {
            "book_obj_id": {"$toObjectId": "$book_id"},
            "user_obj_id": {"$toObjectId": "$user_id"}
        }},
        {"$lookup": {
            "from": "books",
            "localField": "book_obj_id",
            "foreignField": "_id",
            "as": "book_details"
        }},
        {"$unwind": "$book_details"},
        {"$lookup": {
            "from": "users",
            "localField": "user_obj_id",
            "foreignField": "_id",
            "as": "user_details"
        }},
        {"$unwind": "$user_details"},
        {"$sort": {"borrow_date": -1}}
    ])
    records = await cursor.to_list(length=500)
    now = datetime.utcnow()
    result = []
    for r in records:
        fine = r.get("fine", 0.0)
        if r["status"] == "Borrowed" and now > r["due_date"]:
            days_late = (now - r["due_date"]).days
            if days_late > 0:
                fine = float(days_late * FINE_PER_DAY)
        duration_days = 0
        if r["status"] == "Borrowed":
            duration_days = (now - r["borrow_date"]).days
        elif r.get("return_date"):
            duration_days = (r["return_date"] - r["borrow_date"]).days
        result.append({
            "id": str(r["_id"]),
            "user_id": r["user_id"],
            "user_name": r["user_details"]["name"],
            "user_email": r["user_details"]["email"],
            "book_id": r["book_id"],
            "book_name": r["book_details"]["book_name"],
            "borrow_date": r["borrow_date"],
            "due_date": r["due_date"],
            "return_date": r.get("return_date"),
            "status": r["status"],
            "fine": fine,
            "duration_days": duration_days
        })
    return result

@router.post("/return/{borrow_id}")
async def admin_return_book(borrow_id: str, admin: UserInDB = Depends(get_current_admin)):
    """Admin can return a book on behalf of any user"""
    if not ObjectId.is_valid(borrow_id):
        raise HTTPException(status_code=400, detail="Invalid borrow ID")
    record = await db.db["borrow_history"].find_one({"_id": ObjectId(borrow_id)})
    if not record:
        raise HTTPException(status_code=404, detail="Borrow record not found")
    if record["status"] == "Returned":
        raise HTTPException(status_code=400, detail="Book already returned")

    now = datetime.utcnow()
    fine = 0.0
    if now > record["due_date"]:
        days_late = (now - record["due_date"]).days
        if days_late > 0:
            fine = float(days_late * FINE_PER_DAY)

    await db.db["borrow_history"].update_one(
        {"_id": ObjectId(borrow_id)},
        {"$set": {"status": "Returned", "return_date": now, "fine": fine}}
    )
    await db.db["books"].update_one(
        {"_id": ObjectId(record["book_id"])},
        {"$inc": {"available_copies": 1}}
    )
    return {"message": "Book returned successfully", "fine": fine}

@router.post("/renew/{borrow_id}")
async def admin_renew_book(borrow_id: str, admin: UserInDB = Depends(get_current_admin)):
    """Admin can renew a book on behalf of any user"""
    if not ObjectId.is_valid(borrow_id):
        raise HTTPException(status_code=400, detail="Invalid borrow ID")
    from datetime import timedelta
    record = await db.db["borrow_history"].find_one({"_id": ObjectId(borrow_id)})
    if not record:
        raise HTTPException(status_code=404, detail="Borrow record not found")
    if record["status"] == "Returned":
        raise HTTPException(status_code=400, detail="Cannot renew a returned book")

    new_due_date = record["due_date"] + timedelta(days=14)
    await db.db["borrow_history"].update_one(
        {"_id": ObjectId(borrow_id)},
        {"$set": {"due_date": new_due_date}}
    )
    return {"message": "Book renewed successfully", "new_due_date": new_due_date}

@router.post("/borrow")
async def admin_borrow_book(
    book_id: str,
    user_id: str,
    admin: UserInDB = Depends(get_current_admin)
):
    """Admin can issue a book to any user"""
    from datetime import timedelta
    if not ObjectId.is_valid(book_id) or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    book = await db.db["books"].find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book["available_copies"] <= 0:
        raise HTTPException(status_code=400, detail="Book is out of stock")
    
    user = await db.db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = await db.db["borrow_history"].find_one({
        "user_id": user_id,
        "book_id": book_id,
        "status": "Borrowed"
    })
    if existing:
        raise HTTPException(status_code=400, detail="User has already borrowed this book")
    
    now = datetime.utcnow()
    borrow_record = {
        "user_id": user_id,
        "book_id": book_id,
        "borrow_date": now,
        "due_date": now + timedelta(days=14),
        "return_date": None,
        "status": "Borrowed",
        "fine": 0.0
    }
    result = await db.db["borrow_history"].insert_one(borrow_record)
    await db.db["books"].update_one(
        {"_id": ObjectId(book_id)},
        {"$inc": {"available_copies": -1}}
    )
    borrow_record["_id"] = str(result.inserted_id)
    return {"message": "Book issued successfully", "borrow_id": str(result.inserted_id)}

@router.get("/reports")
async def get_reports(admin: UserInDB = Depends(get_current_admin)):
    """Get detailed report data"""
    now = datetime.utcnow()
    
    # Most borrowed books
    most_borrowed_pipeline = [
        {"$group": {"_id": "$book_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
        {"$addFields": {"book_obj_id": {"$toObjectId": "$_id"}}},
        {"$lookup": {
            "from": "books",
            "localField": "book_obj_id",
            "foreignField": "_id",
            "as": "book"
        }},
        {"$unwind": "$book"}
    ]
    most_borrowed_cursor = db.db["borrow_history"].aggregate(most_borrowed_pipeline)
    most_borrowed = await most_borrowed_cursor.to_list(length=10)
    
    # Monthly borrow stats (last 6 months)
    monthly_pipeline = [
        {"$group": {
            "_id": {
                "year": {"$year": "$borrow_date"},
                "month": {"$month": "$borrow_date"}
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 6}
    ]
    monthly_cursor = db.db["borrow_history"].aggregate(monthly_pipeline)
    monthly_stats = await monthly_cursor.to_list(length=6)

    # Overdue summary
    overdue_pipeline = [
        {"$match": {"status": "Borrowed", "due_date": {"$lt": now}}},
        {"$addFields": {
            "book_obj_id": {"$toObjectId": "$book_id"},
            "user_obj_id": {"$toObjectId": "$user_id"}
        }},
        {"$lookup": {"from": "books", "localField": "book_obj_id", "foreignField": "_id", "as": "book"}},
        {"$unwind": "$book"},
        {"$lookup": {"from": "users", "localField": "user_obj_id", "foreignField": "_id", "as": "user"}},
        {"$unwind": "$user"},
        {"$limit": 20}
    ]
    overdue_cursor = db.db["borrow_history"].aggregate(overdue_pipeline)
    overdue_records = await overdue_cursor.to_list(length=20)
    
    overdue_list = []
    for r in overdue_records:
        days_late = (now - r["due_date"]).days
        fine = days_late * FINE_PER_DAY if days_late > 0 else 0
        overdue_list.append({
            "id": str(r["_id"]),
            "user_name": r["user"]["name"],
            "user_email": r["user"]["email"],
            "book_name": r["book"]["book_name"],
            "borrow_date": r["borrow_date"],
            "due_date": r["due_date"],
            "days_late": days_late,
            "fine": fine
        })

    return {
        "most_borrowed": [
            {"book_name": m["book"]["book_name"], "count": m["count"]} 
            for m in most_borrowed
        ],
        "monthly_stats": [
            {"month": f"{m['_id']['year']}-{m['_id']['month']:02d}", "count": m["count"]}
            for m in monthly_stats
        ],
        "overdue_list": overdue_list
    }

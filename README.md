# Smart Library Management System

A production-ready full-stack Library Management System built with React, FastAPI, and MongoDB Atlas.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Axios, React Router, Lucide Icons
- **Backend**: FastAPI, Motor (Async MongoDB), PyJWT, Passlib (bcrypt)
- **Database**: MongoDB Atlas

## Features
- **User Role:**
  - Browse available books with live search and category filtering.
  - Borrow books (automatically tracks available copies).
  - Return books (automatically calculates ₹10/day fine if overdue).
  - View personal dashboard and full borrow history.
- **Admin Role:**
  - View global statistics (total books, borrowed, returned, fines).
  - Manage Books (Create, Read, Update, Delete).
  - View all registered users.
- **Security:**
  - JWT Authentication.
  - Password Hashing (bcrypt).
  - Role-based Access Control (RBAC).

## Local Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB instance (local or Atlas)

### Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   # Activate it:
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` directory with:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=smart_library
   SECRET_KEY=supersecretkey_please_change_in_production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment
Please refer to the `DEPLOYMENT_GUIDE.md` file for instructions on deploying to Render (Backend) and Vercel (Frontend).

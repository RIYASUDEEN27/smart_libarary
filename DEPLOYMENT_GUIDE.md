# Deployment Guide

This guide will help you deploy the Smart Library Management System to production.

## 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new cluster (the free M0 tier is sufficient).
3. Under **Database Access**, create a new database user with a secure password.
4. Under **Network Access**, add `0.0.0.0/0` to allow access from anywhere (or restrict to Render's IPs if preferred).
5. Click **Connect**, choose "Connect your application", and copy the connection string. Replace `<password>` with your database user's password.

## 2. Backend Deployment (Render)
1. Go to [Render](https://render.com/) and create a free account.
2. Connect your GitHub repository containing this project.
3. Click **New +** and select **Web Service**.
4. Configure the Web Service:
   - **Name**: `smart-library-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `MONGODB_URL`: *(Your MongoDB Atlas Connection String from Step 1)*
   - `DATABASE_NAME`: `smart_library`
   - `SECRET_KEY`: *(Generate a secure random string)*
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
6. Click **Create Web Service**. Wait for the deployment to finish and copy your Render URL (e.g., `https://smart-library-backend.onrender.com`).

## 3. Frontend Deployment (Vercel)
1. Before deploying, you need to update the `baseURL` in the frontend code. Open `frontend/src/services/api.js` and change `http://localhost:8000/api` to your new Render Backend URL (e.g., `https://smart-library-backend.onrender.com/api`).
2. Go to [Vercel](https://vercel.com/) and create a free account.
3. Click **Add New** -> **Project**.
4. Import your GitHub repository.
5. In the configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Vercel will build and host your React application.
7. Once finished, Vercel will provide you with a live URL (e.g., `https://smart-library-frontend.vercel.app`).

## Conclusion
Your Smart Library Management System is now live! The frontend on Vercel will securely communicate with the backend on Render, which stores data in MongoDB Atlas.

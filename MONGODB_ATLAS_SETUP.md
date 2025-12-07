# 🚀 VapeShop POS System - Quick Start Guide

## ⚠️ IMPORTANT: MongoDB Atlas Setup Required

Before starting, you need to:
1. Replace `<db_password>` in your `.env` file with your actual MongoDB Atlas password
2. Whitelist your IP address in MongoDB Atlas Network Access

---

## 📝 Environment Setup

1. **Copy and update `.env` file:**
   ```bash
   cd backend
   copy .env.example .env
   ```

2. **Edit `backend/.env` and replace:**
   ```
   MONGO_URI=mongodb+srv://abdullahcheeema786_db_user:YOUR_ACTUAL_PASSWORD_HERE@vapeproject1.vf8k6ev.mongodb.net/
   ```

3. **Set `DISABLE_SEEDING=false` for first run** to create admin user and shops
   - After first successful run, change it back to `DISABLE_SEEDING=true`

---

## 🎯 Running the Application

### **Terminal 1: Backend API**
```powershell
cd h:\Vape_Shop_Project\backend
npm run dev
```
**Wait for:** `✅ Server running on port 5000`

---

### **Terminal 2: Frontend**
```powershell
cd h:\Vape_Shop_Project\frontend
npm run dev
```
**Wait for:** `➜  Local:   http://localhost:5173/`

---

## 🌐 Access the Application

Open browser: **http://localhost:5173**

### 🔐 Login Credentials

**Admin:**
- Username: `admin`
- Password: `vapeshop121!`

**Shopkeeper** (created via admin panel):
- Username: Created by admin
- Password: Auto-generated (shown once)

---

## 📊 MongoDB Atlas Cloud Database

- **No local MongoDB needed!**
- All data stored in cloud
- Real-time synchronization
- Accessible from anywhere

---

## ✅ Features Available

### Admin:
- ✅ Create/manage shops
- ✅ Add/delete products (NO images, NO QR)
- ✅ Create/delete shopkeepers
- ✅ View analytics
- ✅ Download session reports

### Shopkeeper:
- ✅ View products
- ✅ Sell products (inventory auto-updates)
- ✅ Search & filter
- ✅ Session tracking

---

## 🛑 Stopping the Application

Press `Ctrl + C` in both terminals

---

## 🆘 Troubleshooting

**Connection Error?**
- Check MongoDB Atlas password in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure internet connection

**No admin user?**
- Set `DISABLE_SEEDING=false` in `.env`
- Restart backend
- Change back to `DISABLE_SEEDING=true`

---

Made with ❤️ for VapeShop Management

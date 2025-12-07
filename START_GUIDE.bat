@echo off
echo ========================================
echo VapeShop POS System - Startup Guide
echo ========================================
echo.
echo You need to run these commands in 3 SEPARATE terminals:
echo.
echo Terminal 1 - MongoDB:
echo   mongod --dbpath C:\data\db
echo.
echo Terminal 2 - Backend:
echo   cd h:\Vape_Shop_Project\backend
echo   npm run dev
echo.
echo Terminal 3 - Frontend:
echo   cd h:\Vape_Shop_Project\frontend
echo   npm run dev
echo.
echo ========================================
echo After all 3 are running, open browser to:
echo   http://localhost:5173
echo.
echo Login Credentials:
echo   Admin: admin / vapeshop121!
echo   Shopkeeper: shopkeeper1 / password123
echo ========================================
pause

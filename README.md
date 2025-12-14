# VAPE-Store-Solution



# VapeShop Inventory & POS System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing vape shop inventory and point-of-sale operations across multiple shop locations.


## 🚀 Features

### Admin Features
- **Multi-Shop Management**: Manage 3+ vape shops from a single dashboard
- **Product Management**: Add, edit, delete products with image uploads
- **QR Code Generation**: Generate unique QR codes for products
- **Shopkeeper Management**: Create and manage shopkeeper accounts per shop
- **Analytics Dashboard**: View daily/monthly profit trends across all shops
- **Session Reports**: Download CSV/PDF reports of shopkeeper sessions
- **Autofill Forms**: Speed up product entry with previous entry autofill

### Shopkeeper Features
- **Point of Sale**: Quick product selling interface
- **Inventory View**: Real-time stock levels
- **Search & Filter**: Find products by name, brand, or category
- **QR Code Scanning**: Hardware and camera-based scanning
- **Session Tracking**: Automatic session start/end with report generation
- **Responsive Design**: Mobile-first interface

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- React Router v6 for navigation
- Tailwind CSS for styling
- Axios for API calls
- Recharts for analytics visualization

**Backend:**
- Node.js & Express
- MongoDB with Mongoose (Multi-database architecture)
- JWT authentication with bcrypt
- Multer for file uploads
- QRCode library for QR generation
- PDFKit & fast-csv for reports

**DevOps:**
- Docker & Docker Compose
- MongoDB containerized database

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v7 or higher) OR Docker
- npm or yarn

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Vape_Shop_Project

# Start all services with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

### Option 2: Manual Setup

**1. Install MongoDB**
```bash
# Download and install MongoDB Community Edition
# Start MongoDB service on port 27017
```

**2. Setup Backend**
```bash
cd backend
npm install
npm run dev
```

**3. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `vapeshop121!`

**Shopkeeper Accounts** (one per shop):
- Username: `shopkeeper1` / Password: `password123`
- Username: `shopkeeper2` / Password: `password123`
- Username: `shopkeeper3` / Password: `password123`

⚠️ **IMPORTANT**: Change these credentials in production!

## 📁 Project Structure

```
Vape_Shop_Project/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, upload
│   │   ├── services/        # QR, reports, sessions
│   │   ├── utils/           # Helpers & seeding
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── uploads/             # Product images
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context (Auth)
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin dashboard & features
│   │   │   └── shop/        # Shopkeeper POS interface
│   │   ├── services/        # API service layer
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Tailwind styles
│   ├── .env                 # Frontend environment
│   └── package.json
│
├── docker-compose.yml       # Docker services orchestration
└── README.md
```

## 🗄️ Database Architecture

### Multi-Database Approach
The system uses **3 separate MongoDB databases** (one per shop):
- `vapeshop_admin` - Admin users & shop configuration
- `shop_db_1` - Shop 1 products, shopkeepers, transactions
- `shop_db_2` - Shop 2 products, shopkeepers, transactions
- `shop_db_3` - Shop 3 products, shopkeepers, transactions

This provides strict data isolation between shops while allowing centralized admin management.

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/shopkeeper/login` - Shopkeeper login
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/admin/shops` - List all shops
- `POST /api/admin/shops` - Create new shop
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/shops/:shopId/products` - List products
- `POST /api/admin/shops/:shopId/products` - Create product
- `POST /api/admin/shops/:shopId/shopkeepers` - Create shopkeeper
- `GET /api/admin/reports` - Get session reports
- `GET /api/admin/reports/:id/download?format=csv|pdf` - Download report

### Shopkeeper
- `GET /api/shop/:shopDbName/products` - List products
- `POST /api/shop/:shopDbName/sell` - Sell product
- `POST /api/shop/:shopDbName/logout` - End session & generate report
- `POST /api/shop/:shopDbName/scan` - Search by QR code

## 🎨 Design Features

- **Vaporwave Aesthetic**: Purple/cyan/pink gradient color scheme
- **Glassmorphism**: Frosted glass effect on cards
- **Dark Mode**: Eye-friendly dark theme
- **Responsive**: Mobile-first design with breakpoints
- **Accessibility**: Keyboard navigation and ARIA labels

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🔒 Security Features

- JWT authentication with 24h expiration
- Bcrypt password hashing (12 rounds)
- Rate limiting on login endpoints (5 attempts / 15 min)
- Helmet.js security headers
- CORS configuration
- Input validation & sanitization
- File upload validation (images only, 5MB limit)

## 📊 Database Seeding

On first run, the system automatically seeds:
- 1 admin user
- 3 shops (Shop 1, Shop 2, Shop 3)
- 6 sample products per shop (devices, coils, e-liquids)
- 1 shopkeeper per shop

## 🚧 Known Limitations

- Session tracking uses in-memory storage (use Redis in production)
- Product autofill cache is in-memory (persist to database for production)
- Default credentials should be changed
- MongoDB runs without authentication in development

## 🔮 Future Enhancements

- [ ] AWS S3 for image storage
- [ ] Redis for session management
- [ ] Email notifications for low stock
- [ ] Advanced analytics with charts
- [ ] Product categories management
- [ ] Customer management
- [ ] Loyalty program
- [ ] Tax calculation
- [ ] Multi-currency support

## 📝 Environment Variables

**Backend (.env)**
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=vapeshop121!
JWT_SECRET=your_jwt_secret_here
MONGO_URI=mongodb://localhost:27017
SHOP_DB_PREFIX=shop_db_
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
UPLOAD_PATH=./uploads
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Built with ❤️ for vape shop inventory management

## 🆘 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [AdeebTechnologyLab@gmail.com]

---

**⚠️ Production Deployment Checklist:**
- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable MongoDB authentication
- [ ] Use environment-specific configs
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set up proper logging
- [ ] Configure backup strategy
- [ ] Use Redis for sessions
- [ ] Implement rate limiting site-wide
- [ ] Set up monitoring (PM2, New Relic, etc.)

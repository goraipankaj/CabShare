# 🚖 CabShare – Smart Ride Sharing Platform

CabShare is a full-stack MERN-based ride-sharing platform that connects passengers and drivers in a secure, efficient, and user-friendly environment. The platform provides ride booking, ride management, wallet, payment integration, live tracking, notifications, and an admin dashboard.

---

## 📌 Features

### 👤 Authentication
- JWT Authentication
- User Registration & Login
- Password Encryption (bcrypt)
- Role-Based Access Control
- Protected Routes

### 🚗 Ride Management
- Create Ride
- Search Ride
- Book Ride
- Cancel Booking
- Ride History
- Ride Tracking

### 👨‍✈️ Driver Module
- Driver Registration
- Vehicle Management
- Ride Management
- Passenger Requests
- Driver Dashboard

### 👥 Passenger Module
- Search Available Rides
- Book Seats
- Ride History
- Wallet
- Reviews & Ratings

### 💳 Payment & Wallet
- Razorpay Integration
- Wallet Management
- Transaction History
- Payment Records

### 📍 Maps & Location
- Google Maps Integration
- Route Calculation
- Distance Estimation
- Live Ride Tracking

### 🔔 Notifications
- Email Notifications
- SMS OTP (Twilio)
- Firebase Push Notifications
- Real-time Updates using Socket.IO

### 🛡️ Admin Panel
- Dashboard
- User Management
- Driver Management
- Ride Management
- Booking Management
- Reports & Analytics

---

# 🛠️ Tech Stack

## Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- RTK Query
- React Router

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

## Third Party Services
- Razorpay
- Twilio
- Cloudinary
- Firebase
- Google Maps API

---

# 📂 Project Structure

```
CabShare/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── socket/
│   ├── uploads/
│   ├── package.json
│   └── server.js
│
├── docs/
├── docker-compose.yml
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/goraipankaj/CabShare.git

cd CabShare
```

---

## Backend Setup

```bash
cd server

cp .env.example .env

npm install

npm run dev
```

Backend runs at

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# 🔑 Environment Variables

Create `.env` inside the **server** directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_ACCESS_SECRET=your_secret

JWT_REFRESH_SECRET=your_secret

GOOGLE_MAPS_API_KEY=your_key

RAZORPAY_KEY_ID=your_key

RAZORPAY_KEY_SECRET=your_secret

TWILIO_ACCOUNT_SID=your_sid

TWILIO_AUTH_TOKEN=your_token

CLOUDINARY_CLOUD_NAME=your_cloud

CLOUDINARY_API_KEY=your_key

CLOUDINARY_API_SECRET=your_secret
```

---

# 🚀 API Documentation

Complete API documentation is available inside:

```
docs/API.md
```

Postman Collection:

```
docs/CabShare.postman_collection.json
```

---

# 📸 Screenshots

Add screenshots here.

```
Landing Page

Login

Dashboard

Ride Booking

Admin Panel
```

---

# 🔮 Future Enhancements

- AI Ride Recommendation
- Route Optimization
- Corporate Ride Sharing
- Carpool Scheduling
- Mobile Application
- Real-time GPS Tracking
- Multi-language Support

---

# 👨‍💻 Contributors

**Pankaj Gorai**

GitHub:
https://github.com/goraipankaj

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

## 📄 License

This project is developed for educational and learning purposes.

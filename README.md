# 🚖 CabShare

A modern full-stack **Cab Sharing Platform** that enables passengers to find rides, drivers to manage trips, and administrators to monitor the entire system through a secure and user-friendly interface.

---

## ✨ Features

- 🔐 Secure User Authentication
- 👥 Role-Based Access (Passenger, Driver & Admin)
- 🚖 Ride Search & Booking
- 📍 Live Ride Tracking
- 💳 Wallet & Payment Management
- 🚗 Driver Dashboard
- 📊 Admin Dashboard
- 📅 Booking & Ride History
- ⭐ Ratings & Reviews
- 🔔 Real-Time Notifications
- 📈 Reports & Analytics
- 📱 Responsive User Interface
- ⚡ RESTful API Integration
- 🔒 JWT Authentication
- 🐳 Docker Support

---

## 📂 Project Structure

```text
CabShare/
│
├── client/                         # React Frontend
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── ui/
│       │   ├── cards/
│       │   ├── forms/
│       │   ├── tables/
│       │   ├── charts/
│       │   ├── navbar/
│       │   ├── sidebar/
│       │   ├── footer/
│       │   └── common/
│       │
│       ├── pages/
│       │   ├── Landing/
│       │   ├── Login/
│       │   ├── Register/
│       │   ├── Passenger/
│       │   ├── Driver/
│       │   ├── Admin/
│       │   ├── Wallet/
│       │   ├── RideSearch/
│       │   ├── Booking/
│       │   ├── Profile/
│       │   ├── Settings/
│       │   └── Reports/
│       │
│       ├── layouts/
│       ├── hooks/
│       ├── redux/
│       ├── services/
│       ├── routes/
│       ├── context/
│       ├── constants/
│       ├── utils/
│       ├── types/
│       ├── styles/
│       ├── App.tsx
│       └── main.tsx
│
├── server/                         # Node.js Backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── socket/
│       ├── validators/
│       ├── database/
│       ├── utils/
│       ├── uploads/
│       ├── app.ts
│       └── server.ts
│
├── docs/
│   ├── API.md
│   ├── Architecture.md
│   ├── DatabaseSchema.md
│   ├── Deployment.md
│   └── PostmanCollection.json
│
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
└── LICENSE
```

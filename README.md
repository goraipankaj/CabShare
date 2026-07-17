CabShare/
│
├── client/                         # React Frontend
│   └── src/
│       ├── assets/                 # Images, icons, fonts
│       ├── components/             # Reusable UI components
│       │   ├── ui/                 # Button, Input, Modal, Card
│       │   ├── cards/              # Dashboard cards
│       │   ├── forms/              # Login, Register, Ride forms
│       │   ├── tables/             # Data tables
│       │   ├── charts/             # Analytics charts
│       │   ├── navbar/             # Top navigation
│       │   ├── sidebar/            # Sidebar navigation
│       │   ├── footer/             # Footer
│       │   └── common/             # Loader, Pagination, Skeleton
│       │
│       ├── pages/                  # Application pages
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
│       ├── layouts/                # Main, Dashboard & Auth layouts
│       ├── hooks/                  # Custom React Hooks
│       ├── redux/                  # Redux Store & Slices
│       ├── services/               # API Services
│       ├── routes/                 # React Router
│       ├── context/                # React Context
│       ├── constants/              # Constant values
│       ├── utils/                  # Helper functions
│       ├── types/                  # TypeScript Interfaces
│       ├── styles/                 # Global CSS
│       ├── App.tsx
│       └── main.tsx
│
├── server/                         # Node.js Backend
│   └── src/
│       ├── config/                 # Database, JWT, Cloudinary Config
│       ├── controllers/            # Business Logic
│       ├── middleware/             # Authentication & Error Handling
│       ├── models/                 # MongoDB Models
│       ├── routes/                 # API Routes
│       ├── services/               # Email, Payment, Notification Services
│       ├── socket/                 # Socket.IO
│       ├── validators/             # Request Validation
│       ├── database/               # MongoDB Connection
│       ├── utils/                  # Backend Helpers
│       ├── uploads/                # Uploaded Files
│       ├── app.ts                  # Express App
│       └── server.ts               # Server Entry Point
│
├── docs/                           # Project Documentation
│   ├── API.md
│   ├── Architecture.md
│   ├── DatabaseSchema.md
│   ├── Deployment.md
│   └── PostmanCollection.json
│
├── README.md                       # Project Guide
├── docker-compose.yml              # Docker Configuration
├── .env.example                    # Environment Variables Template
├── .gitignore                      # Git Ignore Rules
├── package.json                    # Root Package
└── LICENSE                         # Project License

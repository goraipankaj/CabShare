# CabShare — Smart Ride Sharing Platform

A full-stack MERN ride-sharing app (Uber Pool / BlaBlaCar style) with three roles — **Passenger**, **Driver**,
and **Admin** — built with React 19 + TypeScript on the frontend and Node/Express/MongoDB on the backend.

> **Scope note:** This is a genuinely working core platform — real auth, real database models, real REST
> APIs, real Socket.IO, and real integration code for Razorpay/Twilio/Firebase/Google Maps. Those third-party
> integrations need *your own* API keys to actually send SMS, take payments, etc. — see Environment
> Variables below. Things intentionally left lighter than a production SaaS: the CSV
> export is a simple flat dump (not a formatted report builder), and there's no in-app map rendering widget
> (the backend exposes geocode/distance/directions endpoints, ready for a `@react-google-maps/api` widget to
> be dropped in).

---

## 1. Tech Stack

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Redux Toolkit + RTK Query, React Router, React Hook
Form + Zod, React Hot Toast, Framer Motion, Chart.js, Socket.IO client.

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT (access + refresh tokens), Bcrypt, Multer +
Cloudinary, Nodemailer, Twilio, Firebase Admin, Socket.IO, Helmet, Morgan, express-validator, express-rate-limit.

**Payments:** Razorpay · **Maps:** Google Maps Platform · **Database:** MongoDB (local or Atlas)

---

## 2. Folder Structure

```
cabshare/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Navbar, Sidebar, cards, layouts
│       ├── pages/          # Route-level pages (+ pages/admin)
│       ├── redux/          # store, slices, RTK Query API modules
│       ├── routes/         # ProtectedRoute
│       ├── hooks/          # typed redux hooks, auth bootstrap
│       ├── context/        # Socket.IO provider
│       ├── types/          # shared TS types
│       └── constants/
├── server/                 # Express backend
│   ├── config/             # db, cloudinary, razorpay, mailer, twilio, firebase
│   ├── controllers/        # route handlers
│   ├── middlewares/        # auth, error handler, validation, upload
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── services/           # walletService, mapsService
│   ├── validators/         # express-validator chains
│   ├── socket/             # Socket.IO server
│   ├── database/seed.js    # sample data generator
│   └── tests/              # Jest + Supertest
├── docs/                   # API.md, Postman collection
└── docker-compose.yml
```

---

## 3. Local Setup

### Prerequisites
Node.js 20+, npm, and either a local MongoDB instance or a free MongoDB Atlas cluster.

### Backend

```bash
cd server
cp .env.example .env       # then fill in MONGO_URI and JWT secrets at minimum
npm install
npm run dev                # http://localhost:5000
```

Seed sample data (1 admin, 40 passengers, 15 drivers, 80 rides, bookings):
```bash
npm run seed
```
Admin login after seeding: `admin@cabshare.app` / `Admin@12345`

### Frontend

```bash
cd client
cp .env.example .env       # defaults work with the backend running on :5000
npm install
npm run dev                # http://localhost:5173
```

The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:5000`, so no CORS config is needed locally.

### Run tests
```bash
cd server
npm test
```
(Uses `mongodb-memory-server`, which downloads a local MongoDB binary on first run — needs internet access once.)

---

## 4. Environment Variables

See `server/.env.example` and `client/.env.example` for the full list. Minimum to run locally:

| Variable | Required for |
|---|---|
| `MONGO_URI` | Everything — the app won't start without a database |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Auth |
| `CLOUDINARY_*` | Driver/vehicle document & avatar uploads |
| `SMTP_*` | Email verification / password reset (falls back to console logging if unset) |
| `TWILIO_*` | OTP / SMS (falls back to console logging if unset) |
| `FIREBASE_*` | Push notifications (falls back to console logging if unset) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Card/UPI payments and wallet top-ups |
| `GOOGLE_MAPS_API_KEY` | Route distance/ETA, geocoding, autocomplete |

Everything except `MONGO_URI` and the JWT secrets degrades gracefully in development — the relevant feature
just logs to the console instead of calling the real third-party API, so you can run and demo the whole app
before wiring up any paid service.

---

## 5. Architecture

- **Auth:** short-lived JWT access tokens (returned to the client and kept in memory/Redux) + long-lived
  refresh tokens (httpOnly cookie). RTK Query's `baseApi` automatically retries a request once after a
  silent `/auth/refresh` on a 401.
- **Roles:** `passenger | driver | admin` stored on the `User` document; `protect` + `authorize(...roles)`
  middleware guard every sensitive route both server- and client-side (`ProtectedRoute`).
- **Ride matching:** `GET /api/rides/search` filters by date, seats, price, gender preference, and a
  bounding-box proximity check on source/destination coordinates.
- **Booking lifecycle:** `pending → accepted/rejected → confirmed → ongoing → completed`, with seat counts
  and wallet refunds handled transactionally in the controller.
- **Real-time:** Socket.IO authenticates via the same JWT, and supports ride rooms for live location
  broadcast, in-ride chat, and an SOS broadcast to a dedicated `admins` room.
- **Payments:** Razorpay order creation + HMAC signature verification on both booking payments and wallet
  top-ups; wallet debits/credits are handled by a single `walletService` so the ledger (`Transaction` model)
  stays consistent.

---

## 6. Deployment

- **Frontend → Vercel:** set the build command to `npm run build`, output directory `dist`, and add the
  `VITE_*` env vars from `client/.env.example` in the Vercel dashboard.
- **Backend → Render:** create a Web Service pointing at `server/`, build command `npm install`, start
  command `npm start`, and add every variable from `server/.env.example`.
- **Database → MongoDB Atlas:** create a free cluster, whitelist Render's IP (or `0.0.0.0/0` for simplicity),
  and use the connection string as `MONGO_URI`.
- **Docker (self-hosted):**
  ```bash
  cp server/.env.example server/.env   # fill in secrets
  docker compose up --build
  ```
  This starts MongoDB, the API on `:5000`, and an Nginx-served frontend build on `:5173`.

---

## 7. Documentation

- `docs/API.md` — full REST endpoint reference
- `docs/CabShare.postman_collection.json` — importable Postman collection covering auth, rides, and bookings

---

## 8. What's Deliberately Out of Scope Here

To keep this a genuinely working codebase rather than hundreds of half-finished stubs, a few items from a
full enterprise spec were left as clearly-marked next steps rather than faked:

- **In-browser map rendering** (Google Maps JS widget for pickup/drop pin-dropping) — the backend endpoints
  (`/api/maps/*`) are ready; add `@react-google-maps/api` to the ride-creation form when you have a key.
- **Push notifications** require a real Firebase project + service account; the code path is wired and logs
  to the console until you add credentials.
- **CSV/PDF report exports** are functional but intentionally simple (raw CSV dump) rather than a styled
  report builder.
- **Corporate pooling** has schema support (`Ride.isCorporatePool`, `corporateCode`) but no dedicated admin
  UI yet — a natural next feature to add on top of the existing ride/booking APIs.

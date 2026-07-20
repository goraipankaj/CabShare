# CabShare API Reference

Base URL (local): `http://localhost:5000/api`

All authenticated endpoints expect `Authorization: Bearer <accessToken>`. The refresh token is stored in an
httpOnly cookie and is not accessible to JavaScript.

## Auth — `/auth`
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register a passenger or driver |
| POST | `/login` | Login with email/password |
| POST | `/admin/login` | Admin login |
| POST | `/refresh` | Exchange refresh cookie for a new access token |
| POST | `/logout` | Invalidate current session |
| POST | `/send-otp` | Send a phone OTP (Twilio) |
| POST | `/verify-otp` | Verify phone OTP |
| GET | `/verify-email?token=&email=` | Verify email |
| POST | `/forgot-password` | Request password reset email |
| POST | `/reset-password` | Reset password with token |
| POST | `/google` | Login/register via Google account |
| GET | `/me` | Get current user |

## Users — `/users`
`PATCH /me`, `POST /me/avatar`, `POST|DELETE /me/addresses[/:id]`, `POST|DELETE /me/emergency-contacts[/:id]`,
`POST /me/favorite-drivers/:driverId`, and admin-only `GET /`, `GET /:id`, `PATCH /:id/status`.

## Drivers — `/drivers`
`POST /register`, `POST /documents`, `GET /me`, `PATCH /availability`, `PATCH /location`, `GET /earnings`,
`POST /vehicles`, `GET /vehicles/me`, `POST /vehicles/:id/documents`, and admin `GET /`, `PATCH /:id/verify`,
`PATCH /vehicles/:id/verify`.

## Rides — `/rides`
`GET /search` (public), `GET /:id` (public), `POST /` (driver), `PATCH /:id`, `DELETE /:id`, `PATCH /:id/cancel`,
`PATCH /:id/start`, `PATCH /:id/complete`, `PATCH /:id/location`, `GET /driver/me`, admin `GET /admin/all`.

## Bookings — `/bookings`
`POST /` (passenger), `GET /me`, `GET /driver/me`, `GET /:id`, `PATCH /:id/accept`, `PATCH /:id/reject`,
`PATCH /:id/cancel`, `POST /:id/share-trip`.

## Payments — `/payments`
`POST /create-order`, `POST /verify`, `POST /wallet/topup/create-order`, `POST /wallet/topup/verify`,
`GET /history`, admin `POST /:id/refund`.

## Wallet — `/wallet`
`GET /`, `GET /transactions`, admin `GET /all`.

## Reviews — `/reviews`
`POST /`, `GET /user/:userId`.

## Notifications — `/notifications`
`GET /`, `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id`.

## Support — `/support`
`POST /`, `GET /me`, `POST /:id/messages`, admin `GET /`, `PATCH /:id/status`.

## Promo Codes — `/promo-codes`
`POST /validate`, admin `POST /`, `GET /`, `PATCH /:id`, `DELETE /:id`.

## Admin — `/admin`
`GET /dashboard`, `GET /analytics/revenue`, `GET /analytics/rides`, `GET /analytics/bookings`,
`GET /analytics/export`, `GET /settings`, `PATCH /settings`.

## Maps — `/maps`
`GET /autocomplete`, `GET /geocode`, `GET /distance`, `GET /directions` (all require `GOOGLE_MAPS_API_KEY`).

All list endpoints support `?page=&limit=&sort=&fields=&search=` and Mongo-style operators
(`?price[gte]=100`) via the shared `ApiFeatures` helper.

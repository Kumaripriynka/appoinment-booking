## MERN Appointment Booking System

### Folder Structure

- **backend**
  - `package.json`
  - `src`
    - `index.js` (Express server bootstrap)
    - `app.js` (Express app, middleware, routes)
    - `config/db.js` (MongoDB Atlas connection)
    - `models`
      - `User.js`
      - `Slot.js`
      - `BookingHistory.js`
    - `controllers`
      - `authController.js`
      - `slotController.js`
      - `bookingController.js`
    - `routes`
      - `authRoutes.js`
      - `slotRoutes.js`
      - `bookingRoutes.js`
    - `middleware`
      - `authMiddleware.js` (JWT & role-based access)
      - `rateLimiter.js` (login & booking rate limiting)
      - `cacheMiddleware.js` (in-memory caching for available slots)
      - `errorMiddleware.js` (error handling)

- **frontend**
  - `package.json`
  - `vite.config.js`
  - `index.html`
  - `src`
    - `main.jsx`
    - `App.jsx`
    - `api.js`

### Environment Variables

Create a `.env` file **inside the `backend` folder** (same level as `backend/package.json`) with:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
PORT=5000
```

> Do **not** commit your real `.env` file. Only commit an `.env.example` if needed with placeholder values.

For the frontend (optional), you can create `frontend/.env` if your API URL is different:

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend Setup

```bash
cd backend
npm install
npm run dev   # or: npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Then open the URL shown by Vite (default: `http://localhost:5173`).

### Usage Notes

- Patients can **register and login** from the UI.
- Doctors must be created directly in the database with `role: "doctor"` (no admin panel).
- Doctors:
  - Create availability slots.
  - View booked appointments.
- Patients:
  - View available slots.
  - Book appointments.
  - View own appointments and cancel them.



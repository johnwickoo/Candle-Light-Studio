# Candle Light Studio – Booking System (MVP v1)

A production-ready booking system built as an MVP for a photography studio, featuring real-time availability, serverless backend logic, database persistence, and automated email confirmations.

This project documents not just *what* was built, but *how* real-world engineering problems were solved during development and deployment.

---

## Live Demo

* **Frontend:** [https://candle-light-studio-xaxc.vercel.app](https://candle-light-studio-xaxc.vercel.app)
* **Backend:** Appwrite Serverless Functions

---

## Project Overview

The goal of this project was to build a **realistic booking workflow**:

1. Users select a date
2. Available time slots are dynamically calculated
3. Bookings are created securely on the backend
4. Confirmation emails are sent automatically
5. The UI updates instantly without page reloads

---

## Tech Stack

### Frontend

* React (TypeScript)
* Vite
* Local caching + state synchronization
* Calendar & time slot components

### Backend

* **Appwrite Functions (Node.js)**
* Appwrite Databases
* Serverless architecture
* Function-to-function execution

### Deployment

* Vercel (frontend)
* Appwrite Cloud (backend & database)

---

##Core Concepts Implemented

### 1. Serverless Architecture

All backend logic runs in Appwrite Functions:

* No persistent server
* Stateless execution
* Scales automatically

---

### 2. Secure API Design

* Frontend **never talks directly to the database**
* All database access happens inside serverless functions
* Prevents API key exposure

---

### 3. CORS Handling (Real-World)

Implemented **manual CORS handling** inside serverless functions:

```js
Access-Control-Allow-Origin
Access-Control-Allow-Methods
Access-Control-Allow-Headers
OPTIONS preflight handling
```

Handled:

* `localhost` (development)
* Vercel production domain

---

### 4. Date-Based Booking Logic

Bookings are queried by date:

```js
Query.equal("date", selectedDate)
```

Time ranges are calculated dynamically:

```js
startMin = hours * 60 + minutes
endMin = startMin + duration
```

This enables:

* Collision detection
* Accurate availability rendering

---

### 5. Function → Function Execution

After creating a booking:

* The **booking function triggers an email function**
* Uses Appwrite’s `functions.createExecution()`

This decouples:

* Business logic (booking)
* Side effects (email notifications)

---

### 6. Non-Blocking Email Sending

Email execution is **fire-and-forget**:

```js
sendEmailConfirmation().catch(...)
```

Result:

* Booking succeeds even if email fails
* Better UX and reliability

---

### 7. State Synchronization & Cache Invalidation

Frontend implements:

* Local cache by date for Improve load speed
* Reload triggers after successful booking
* Automatic UI refresh without page reload

---

## Major Errors Encountered (And How They Were Fixed)

### CORS Errors (Blocked Requests)

**Problem**

* Requests worked on localhost but failed in production

**Fix**

* Implemented explicit CORS headers
* Properly handled `OPTIONS` preflight requests
* Ensured allowed origins matched deployment URLs

---

### `405 Method Not Allowed`

**Problem**

```text
POST https://domain.vercel.app/undefined
```

**Cause**

* Environment variable missing in production
* Endpoint resolved to `undefined`

**Fix**

* Verified all env vars in Vercel
* Added runtime validation

---


### State Not Updating After Booking

**Problem**

* `setBookings()` appeared to “not work”

**Cause**

* React state updates are async
* Cache was being written with stale state

**Fix**

* Updated cache using returned API data
* Removed reliance on immediately updated state

---

###  Function Logs Missing

**Problem**

* No logs appearing in production

**Cause**

* Code tested on a different Git branch

**Fix**

* Merged experimental branch correctly
* Deployed the correct branch

---

###  Function-to-Function Calls Worked Locally but Not in Prod

**Cause**

* Missing Appwrite API Key permissions in production

**Fix**

* Created Appwrite API key
* Granted `functions.execute` permission
* Added key to environment variables

---

## Development Philosophy

* **Build → Break → Understand → Fix**
* Debug with logs, not guesses
* Treat localhost ≠ production
* Ship MVP first, refine later

---

## MVP Status

✅ Booking creation
✅ Time slot availability
✅ Database persistence
✅ Email confirmations
✅ Production deployment

**This is v1.**

---

## What’s Next (Planned)

* Admin dashboard
* Payment integration
* Booking limits per day
* Calendar sync (Google / iCal)
* Booking cancellation flow
* Consultation before booking enabled

---

## 🏁 Final Note

This project represents:

* Real backend debugging
* Real deployment issues
* Real production constraints

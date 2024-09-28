![Node.js](https://img.shields.io/badge/Node.js-green)
![Express.js](https://img.shields.io/badge/Express.js-black)
![MongoDB](https://img.shields.io/badge/MongoDB-lightgreen)

# 🚗 Car Finder Backend

This is the backend repository for the **Car Finder** platform, a second-hand car buy-and-sell platform. This API serves various endpoints for managing car listings, user data, bookings, payments, and more. It is built using **Node.js**, **Express**, **MongoDB**, and integrates **Stripe** for payment processing.

## Frontend Repository

You can find the frontend repository at the following link: [FourWheeler Frontend Repo](https://github.com/sanisaha/Car-finder-MERN).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)

---

## Features

- **Car Listings**: Users can view cars, filter them by categories, and post new listings (for sellers).
- **Bookings**: Buyers can book cars and view their bookings.
- **User Management**: Manage users, including buyers and sellers.
- **Payment Integration**: Stripe payment gateway is integrated for processing payments.
- **Authentication & Authorization**: Based on user roles (buyer, seller, admin).
- **MongoDB Integration**: All data related to users, cars, and bookings is stored in MongoDB.

---

## Tech Stack

- **Node.js**: Runtime environment.
- **Express.js**: Web framework for building the API.
- **MongoDB**: NoSQL database for data persistence.
- **Stripe**: Payment gateway integration.
- **Cors & Express.json**: For handling cross-origin requests and JSON payloads.

---

## Environment Variables

The project uses environment variables for sensitive data (like API keys, database credentials, etc.). Create a `.env` file in the root directory of the project and add the following environment variables:

```plaintext
PORT=5000
DB_USER=your_mongo_user
DB_PASSWORD=your_mongo_password
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## API Endpoints

### Car Routes

- **GET /category/:id**  
  Retrieve cars by category (gearbox, engine type, etc.).

- **GET /cars**  
  Retrieve all cars with optional filters (type, gearbox, engine, price range, etc.).

- **POST /cars**  
  Add a new car listing (for sellers).

- **PUT /cars/item/:id**  
  Update a specific car (e.g., mark as advertised).

- **DELETE /cars/:id**  
  Delete a car listing.

- **GET /cars/item/:id**  
  Retrieve details for a specific car.

---

### User Routes

- **POST /users**  
  Register a new user.

- **GET /users**  
  Retrieve all users.

- **GET /users/admin/:email**  
  Check if the user is an admin.

- **PUT /users/admin/:id**  
  Promote a user to admin.

- **GET /buyers**  
  Retrieve all buyers.

- **GET /sellers**  
  Retrieve all sellers.

---

### Booking Routes

- **POST /bookings**  
  Create a new booking.

- **GET /bookings**  
  Retrieve all bookings by user email.

- **GET /bookings/:id**  
  Retrieve a specific booking.

- **DELETE /bookedItems/:id**  
  Delete a specific booking.

---

### Payment Routes

- **POST /create-payment-intent**  
  Create a Stripe payment intent.

- **POST /payments**  
  Save payment details and update the booking status.

## Getting Started

### Prerequisites

- **Node.js** and **npm** should be installed on your machine.
- **MongoDB** should be running (either locally or via a cloud provider like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).
- A **Stripe** account with a secret API key.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sanisaha/car-finder-server-MERN
   ```
2. **Install the dependencies**
   ```bash
   npm install
   ```
3. **Start the server**
   ```bash
   npm start
   ```

---

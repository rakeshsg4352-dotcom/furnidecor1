# FurniDecor

A full-stack furniture and interior-decoration e-commerce platform. Built as a college major project with a professional, production-style architecture.

**Tagline:** Transform Your Space. Define Your Style.

---

## Features

### Customer-Facing
- Browse, search, and filter furniture by category, price, and material
- Sort products by featured, newest, price, or rating
- View detailed product pages with specs and related items
- **Design Your Space** - select a room type and get curated furniture recommendations with an interactive selection preview
- User registration and login with secure password hashing
- Shopping cart with quantity management and stock validation
- Checkout with shipping address and payment method selection
- Order placement with automatic inventory deduction
- Order history and order detail tracking
- Editable user profile

### Admin Panel
- Dashboard with live statistics (revenue, orders, users, stock alerts)
- Full product management (create, edit, delete)
- Category management
- Room management
- Order management with status updates
- Inventory view with stock status (In Stock / Low Stock / Out of Stock)
- User list

---

## Technology Stack

**Frontend:** React.js (Vite), React Router, Context API, Axios, CSS3

**Backend:** Node.js, Express.js

**Database:** MySQL (mysql2 driver)

**Authentication:** JWT (jsonwebtoken), bcryptjs for password hashing

**Other:** dotenv, cors, express-validator, nodemon (dev)

---

## System Architecture

\\\
React.js Frontend (Vite, port 5173)
        |
    REST API (Axios)
        |
Node.js + Express.js Backend (port 5000)
        |
    MySQL Database (furnidecor)
\\\

The frontend never talks to MySQL directly. All data flows through the Express REST API, which validates requests, applies business logic (e.g. stock checks), and queries MySQL using parameterized queries to prevent SQL injection.

---

## Folder Structure

\\\
furnidecor/
+-- backend/
¦   +-- config/db.js              MySQL connection pool
¦   +-- controllers/              Business logic per resource
¦   +-- middleware/                Auth, admin-check, error handling
¦   +-- routes/                   Express route definitions
¦   +-- server.js                 App entry point
¦   +-- .env                      Environment variables (not committed)
+-- frontend/
¦   +-- src/
¦       +-- components/           Reusable UI (Navbar, ProductCard, etc.)
¦       +-- pages/                Route-level page components
¦       +-- admin/                Admin panel pages
¦       +-- context/               AuthContext, CartContext
¦       +-- services/api.js        Central Axios instance
+-- database/
    +-- furnidecor.sql            Full schema + seed data
\\\

---

## Database Design

**Tables:** users, categories, products, rooms, room_recommendations, cart, cart_items, orders, order_items

**Key relationships:**
- \products.category_id\ -> \categories.id\ (ON DELETE SET NULL)
- \oom_recommendations\ links rooms to products (many-to-many)
- \cart\ / \cart_items\ scoped per user
- \orders\ / \order_items\ preserve price at time of purchase (so later price changes never affect past orders)

Foreign keys and indexes are defined in \database/furnidecor.sql\, which is safe to re-run from scratch (drops and recreates all tables).

---

## API Documentation

### Auth
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/profile | Private |
| PUT | /api/auth/profile | Private |

### Products
| Method | Route | Access |
|---|---|---|
| GET | /api/products | Public (supports ?search, ?category, ?minPrice, ?maxPrice, ?material, ?color, ?sort, ?page, ?limit) |
| GET | /api/products/:id | Public |
| POST | /api/products | Admin |
| PUT | /api/products/:id | Admin |
| DELETE | /api/products/:id | Admin |

### Categories
| Method | Route | Access |
|---|---|---|
| GET | /api/categories | Public |
| GET | /api/categories/:id | Public |
| POST / PUT / DELETE | /api/categories(/:id) | Admin |

### Rooms
| Method | Route | Access |
|---|---|---|
| GET | /api/rooms | Public |
| GET | /api/rooms/:id | Public |
| GET | /api/rooms/:id/recommendations | Public |
| POST / PUT / DELETE | /api/rooms(/:id) | Admin |

### Cart (all Private)
| Method | Route |
|---|---|
| GET | /api/cart |
| POST | /api/cart/items |
| PUT | /api/cart/items/:id |
| DELETE | /api/cart/items/:id |

### Orders (all Private)
| Method | Route |
|---|---|
| POST | /api/orders |
| GET | /api/orders |
| GET | /api/orders/:id |

### Admin (all Admin-only)
| Method | Route |
|---|---|
| GET | /api/admin/dashboard |
| GET | /api/admin/users |
| GET | /api/admin/orders |
| PUT | /api/admin/orders/:id/status |
| GET | /api/admin/inventory |

---

## Installation & Setup

### Prerequisites
- Node.js and npm
- MySQL Server

### 1. Database Setup

Log into MySQL and run the schema file:

\\\ash
mysql -u root -p < database/furnidecor.sql
\\\

This creates the \urnidecor\ database, all tables, and seeds 15 categories, 31 products, 6 rooms, and room recommendations.

### 2. Backend Setup

\\\ash
cd backend
npm install
\\\

Create a \.env\ file in \ackend/\:

\\\env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=furnidecor
JWT_SECRET=your_secret_key_here
\\\

Run the backend:

\\\ash
npm run dev
\\\

Server starts at http://localhost:5000

### 3. Frontend Setup

\\\ash
cd frontend
npm install
npm run dev
\\\

App runs at http://localhost:5173

### 4. Create an Admin Account

Register a normal account through the UI, then promote it to admin directly in MySQL:

\\\sql
UPDATE users SET role='ADMIN' WHERE email='your_email_here';
\\\

---

## How Key Features Work

**Authentication:** Passwords are hashed with bcrypt before storage (never stored in plain text). On login, a JWT containing the user's id and role is issued and stored in the browser's localStorage. Every subsequent request attaches this token via an Axios interceptor, and protected backend routes verify it before allowing access.

**Room Recommendations:** The \oom_recommendations\ table links specific products to specific rooms with a priority order. When a user selects a room, the frontend fetches this join and displays furniture tailored to that space.

**Cart & Stock:** Adding to cart checks current stock before allowing the add. At checkout, stock is re-validated for every item, then deducted atomically as the order is created, and the cart is cleared.

**Admin Authorization:** A two-layer middleware system (\protect\ then \dmin\) ensures a request is both authenticated and belongs to a user with the ADMIN role before reaching any admin-only controller. Regular users receive a 403 Forbidden response.

---

## Sample Login Credentials

**Admin:** create via the steps above (no default admin ships with the seed data for security)

**Any registered user:** register through the UI at /register

---

## Future Enhancements

- Wishlist functionality
- Real payment gateway integration
- Product reviews and ratings from customers
- Email notifications for order status changes
- Image upload instead of URL-only product images
- Room recommendation management UI in the admin panel

---

## Author's Note

This project was built incrementally: database schema first, then a fully tested REST API (verified endpoint-by-endpoint before any frontend code was written), then the React frontend built page by page against the real, working API. Every feature listed above was manually tested end-to-end during development.

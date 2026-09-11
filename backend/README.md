# Personal Finance Tracker API

A backend API for tracking income/expenses, organizing transactions into categories,
uploading profile pictures, viewing monthly summaries, and protecting data with JWT auth.

## Folder Structure

```
backend/
├── config/           # Database & Cloudinary configuration
│   ├── db.js
│   └── cloudinary.js
├── models/           # Mongoose schemas
│   ├── User.js
│   ├── Transaction.js
│   └── Category.js
├── controllers/       # Route handler logic
│   ├── authController.js
│   ├── transactionController.js
│   ├── categoryController.js
│   ├── uploadController.js
│   └── adminController.js
├── routes/            # Express routers + Swagger JSDoc annotations
│   ├── authRoutes.js
│   ├── transactionRoutes.js
│   ├── categoryRoutes.js
│   ├── uploadRoutes.js
│   └── adminRoutes.js
├── middlewares/        # Auth, admin check, logger, error handling, upload, validation
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   ├── errorHandler.js
│   ├── notFound.js
│   ├── logger.js
│   ├── uploadMiddleware.js
│   └── validate.js
├── validators/         # Zod request schemas
│   ├── authValidator.js
│   └── transactionValidator.js
├── utils/              # Helper functions
│   ├── generateToken.js
│   ├── uploadToCloudinary.js
│   ├── asyncHandler.js
│   └── seedCategories.js
├── docs/
│   └── swagger.js      # Swagger/OpenAPI spec configuration
├── server.js           # App entry point
├── package.json
├── .env.example
└── .gitignore
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your real values:
   ```
   cp .env.example .env
   ```
   You'll need:
   - `MONGO_URI_DEV` for local development and/or `MONGO_URI_PRO` (MongoDB Atlas)
     for production — `NODE_ENV` picks which one is used
   - A JWT secret (any long random string)
   - Cloudinary credentials (cloud name, API key, API secret)

3. (Optional) Seed default categories:
   ```
   node utils/seedCategories.js
   ```

4. Run in development (auto-restart on changes):
   ```
   npm run dev
   ```
   Or in production:
   ```
   npm start
   ```

5. Open API docs at:
   ```
   http://localhost:5000/docs
   ```

## Endpoints Summary

| Method | Endpoint | Access |
|---|---|---|
| POST | /auth/register | Public |
| POST | /auth/login | Public |
| GET | /auth/profile | Private |
| POST | /transactions | Private |
| GET | /transactions | Private |
| GET | /transactions/monthly-summary | Private |
| PUT | /transactions/:id | Private |
| DELETE | /transactions/:id | Private |
| GET | /categories | Private |
| POST | /categories | Private |
| POST | /upload/profile-picture | Private |
| GET | /admin/overview | Private/Admin |

## Deployment (Render)

1. Push this repo to GitHub.
2. Create a new Web Service on Render, pointing to the repo.
3. Set the build command to `npm install` and start command to `npm start`.
4. Add all `.env` variables in the Render dashboard's Environment tab.
5. Once deployed, update `SERVER_URL` in your environment variables to your live
   Render URL so the Swagger docs "Try it out" feature points to the right server.

## Notes

- Passwords are hashed with `bcryptjs` before saving.
- JWTs are issued on register/login and required (as a Bearer token) for all
  private routes.
- File uploads use `multer.memoryStorage()` streamed directly to Cloudinary —
  no files are written to disk, and there's no dependency on
  `multer-storage-cloudinary`, which avoids peer-dependency conflicts with
  Cloudinary v2.
- Route order matters: `/transactions/monthly-summary` is registered before
  `/transactions/:id` so Express doesn't mistake "monthly-summary" for an ID.

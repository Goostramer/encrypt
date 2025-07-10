# Encryption App Backend

This is the backend API for the Encryption App, built with Node.js, Express, and MongoDB.

## Features

- User authentication (login/register)
- Encrypted data storage and retrieval
- RSA key pair storage
- RESTful API endpoints

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/encryption-app
   JWT_SECRET=your_jwt_secret
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Start the production server:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user

### Encryption
- `POST /api/encryption/data` - Save encrypted text
- `POST /api/encryption/file` - Save encrypted file
- `GET /api/encryption/data` - Get all encrypted data
- `GET /api/encryption/data/:id` - Get encrypted data by ID
- `DELETE /api/encryption/data/:id` - Delete encrypted data

### Key Pairs
- `POST /api/encryption/keys` - Save a key pair
- `GET /api/encryption/keys` - Get all key pairs
- `GET /api/encryption/keys/:id` - Get key pair by ID
- `DELETE /api/encryption/keys/:id` - Delete key pair

## Project Structure

- `src/` - Source code
  - `controllers/` - Route controllers
  - `models/` - MongoDB models
  - `routes/` - API routes
  - `server.js` - Express server

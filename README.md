# Encryption App

A full-stack web application for secure encryption and decryption of text and files, featuring user authentication and RSA key pair management.

## Features

- User authentication (login/register)
- Text encryption/decryption
- File encryption/decryption
- RSA key pair generation and management
- Dark/light theme toggle
- Responsive design

## Project Structure

The project is organized into two main parts:

- **Backend**: Node.js/Express API with MongoDB database
- **Frontend**: React application built with Vite and TypeScript

## Prerequisites

- Node.js (v14+)
- MongoDB (local installation or MongoDB Atlas)

## Setup and Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd encryption-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd frontend
npm install

```

## Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```



### 2. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

### 3. Access the Application

## Usage

1. Register a new account or log in with existing credentials
2. Use the different tabs to access various encryption features:
   - **Text Encryption**: Encrypt and decrypt text messages
   - **File Encryption**: Encrypt and decrypt files
   - **RSA Encryption**: Use RSA encryption for asymmetric cryptography
   - **Key Generator**: Generate and manage RSA key pairs
3. Toggle between dark and light themes using the theme button
4. View your saved encrypted data by clicking the "Saved Data" button

## Technologies Used

- **Backend**:
  - Node.js
  - Express
  - MongoDB with Mongoose
  - JWT for authentication
  - bcryptjs for password hashing

- **Frontend**:
  - React
  - TypeScript
  - Vite
  - Web Crypto API for encryption
  - TailwindCSS for styling
  - Lucide React for icons

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Client-side encryption using Web Crypto API
- Secure key storage with encrypted private keys

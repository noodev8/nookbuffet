# Nook Server

Backend server for the Nook Buffet application built with Node.js and Express.js.

## Setup Guide

### Step 1: Install Node.js (If you don't have it) 

### Step 2: Navigate to the Server Folder 

### Step 3: Install Required Packages

1. **Install all dependencies:**
   npm install

### Step 4: Start the Server
   npm run dev


2. **For Production
   npm start


## What Each File Does 

```
nook-server/
├── server.js           # Main file - starts the server
├── package.json        # Lists all the packages we need
├── .env               # Settings like port number
├── .gitignore         # Tells git which files to ignore
├── node_modules/      # All the downloaded packages (don't touch!)
├── controllers/       # Code that handles different requests
├── middleware/        # Code that runs before handling requests
├── models/           # Code that defines data structure
├── routes/           # Code that defines URL paths
└── utils/            # Helper code used throughout the app
```

## Configuration File (.env)

The `.env` file contains settings:
```
PORT=3013              # What port the server runs on
NODE_ENV=development   # Tells the server it's in development mode
```

You can change the port number if needed (like if 3013 is already being used).


## What is Installed

- **express** - The main web server framework
- **cors** - Allows your frontend to talk to the server
- **dotenv** - Reads settings from the .env file
- **nodemon** - Automatically restarts server when you make changes

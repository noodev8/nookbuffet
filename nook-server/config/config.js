/*
=======================================================================================================================================
Configuration File
=======================================================================================================================================
Purpose: Centralized configuration for authentication and other application settings
=======================================================================================================================================
*/

// JWT Configuration
const jwtConfig = {
  // Secret key for signing JWT tokens - should be a strong, random string
  // Store this in your .env file as JWT_SECRET
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',

  // Token expiration time
  // Examples: '24h', '7d', '30d', 3600 (seconds)
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Algorithm used for signing tokens
  algorithm: 'HS256'
};

// Application Configuration
const appConfig = {
  // Environment (development, production, test)
  environment: process.env.NODE_ENV || 'development',

  // Server settings
  port: process.env.PORT || 3013,
  host: process.env.SERVER_HOST || 'localhost',

  // API settings
  apiVersion: '1.0.0',
  apiPrefix: '/api'
};

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Connection pool settings
  poolMax: 200,
  poolIdleTimeout: 60000,
  poolConnectionTimeout: 60000
};

// Email Configuration (for contact forms, notifications, etc.)
const emailConfig = {
  // Email service API key
  apiKey: process.env.RESEND_API_KEY,

  // Default sender email
  fromEmail: process.env.FROM_EMAIL,

  // Default recipient email
  toEmail: process.env.TO_EMAIL
};

// Export all configurations
module.exports = {
  jwtConfig,
  appConfig,
  dbConfig,
  emailConfig
};


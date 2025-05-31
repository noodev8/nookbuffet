-- =====================================================
-- NOOK BUFFET DATABASE SCHEMA
-- Complete SQL script to create all required tables
-- Based on Flutter application data models analysis
-- =====================================================

-- Create database (uncomment if needed)
-- CREATE DATABASE nook_buffet;
-- USE nook_buffet;

-- =====================================================
-- 1. USERS TABLE
-- Stores customer account information
-- =====================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribe_newsletter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 2. BUFFET_OPTIONS TABLE
-- Stores the different buffet packages available
-- =====================================================
CREATE TABLE buffet_options (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_path VARCHAR(255),
    is_popular BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_price (price),
    INDEX idx_popular (is_popular),
    INDEX idx_available (is_available),
    INDEX idx_display_order (display_order)
);

-- =====================================================
-- 3. MENU_ITEMS TABLE
-- Stores individual food items (sandwiches, sides, etc.)
-- =====================================================
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category ENUM('sandwich', 'side', 'drink', 'dessert', 'other') NOT NULL,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    description TEXT,
    allergens TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_vegetarian (is_vegetarian),
    INDEX idx_vegan (is_vegan),
    INDEX idx_available (is_available)
);

-- =====================================================
-- 4. BUFFET_MENU_ITEMS TABLE
-- Links buffet options to their included menu items
-- =====================================================
CREATE TABLE buffet_menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buffet_id VARCHAR(50) NOT NULL,
    menu_item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (buffet_id) REFERENCES buffet_options(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_buffet_item (buffet_id, menu_item_id),
    INDEX idx_buffet_id (buffet_id),
    INDEX idx_menu_item_id (menu_item_id)
);

-- =====================================================
-- 5. DIETARY_OPTIONS TABLE
-- Stores dietary information for buffet options
-- =====================================================
CREATE TABLE dietary_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buffet_id VARCHAR(50) NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (buffet_id) REFERENCES buffet_options(id) ON DELETE CASCADE,
    INDEX idx_buffet_id (buffet_id)
);

-- =====================================================
-- 6. BOOKINGS TABLE
-- Stores customer buffet bookings
-- =====================================================
CREATE TABLE bookings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL, -- NULL for guest bookings
    buffet_id VARCHAR(50) NOT NULL,
    buffet_name VARCHAR(100) NOT NULL, -- Denormalized for historical data
    buffet_price DECIMAL(10,2) NOT NULL, -- Price at time of booking
    booking_date DATE NOT NULL,
    booking_time VARCHAR(10) NOT NULL,
    number_of_people INT NOT NULL,
    dietary_preference ENUM('none', 'vegetarian', 'vegan', 'mixed') DEFAULT 'none',
    special_requests TEXT,
    status ENUM('pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (buffet_id) REFERENCES buffet_options(id),
    INDEX idx_user_id (user_id),
    INDEX idx_buffet_id (buffet_id),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status),
    INDEX idx_customer_email (customer_email),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 7. BUSINESS_SETTINGS TABLE
-- Stores business configuration and settings
-- =====================================================
CREATE TABLE business_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Whether setting can be accessed by app
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);

-- =====================================================
-- 8. BOOKING_STATUS_HISTORY TABLE
-- Tracks status changes for bookings (audit trail)
-- =====================================================
CREATE TABLE booking_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    old_status ENUM('pending', 'confirmed', 'rejected', 'cancelled'),
    new_status ENUM('pending', 'confirmed', 'rejected', 'cancelled') NOT NULL,
    changed_by VARCHAR(100), -- Admin user or system
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 9. AVAILABLE_TIME_SLOTS TABLE
-- Stores available booking time slots
-- =====================================================
CREATE TABLE available_time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    time_slot VARCHAR(10) NOT NULL, -- e.g., '11:00 AM'
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_time_slot (time_slot),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
);

-- =====================================================
-- 10. ADMIN_USERS TABLE
-- Stores admin/staff user accounts
-- =====================================================
CREATE TABLE admin_users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role ENUM('admin', 'staff', 'manager') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

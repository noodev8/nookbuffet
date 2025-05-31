# Nook Buffet Database Documentation

## Overview
This document describes the complete database schema for the Nook Buffet Flutter application. The database is designed to support a buffet ordering system with user management, booking functionality, and menu management.

## Database Schema

### Core Tables

#### 1. `users` - Customer Accounts
Stores registered customer information for the mobile app.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| first_name | VARCHAR(100) | Customer's first name |
| last_name | VARCHAR(100) | Customer's last name |
| email | VARCHAR(255) | Unique email address |
| phone | VARCHAR(20) | Contact phone number |
| password_hash | VARCHAR(255) | Encrypted password |
| is_active | BOOLEAN | Account status |
| subscribe_newsletter | BOOLEAN | Newsletter subscription preference |
| created_at | TIMESTAMP | Account creation date |
| updated_at | TIMESTAMP | Last update timestamp |

#### 2. `buffet_options` - Available Buffet Packages
Stores the different buffet packages offered (Classic, Enhanced, Deluxe).

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) | Primary key (e.g., 'buffet_1') |
| name | VARCHAR(100) | Buffet name (e.g., 'Classic Buffet') |
| description | TEXT | Buffet description |
| price | DECIMAL(10,2) | Price per person |
| image_path | VARCHAR(255) | Path to buffet image |
| is_popular | BOOLEAN | Popular badge flag |
| is_available | BOOLEAN | Availability status |
| display_order | INT | Display order in app |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### 3. `menu_items` - Individual Food Items
Stores all food items that can be included in buffets.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| name | VARCHAR(200) | Item name |
| category | ENUM | 'sandwich', 'side', 'drink', 'dessert', 'other' |
| is_vegetarian | BOOLEAN | Vegetarian flag |
| is_vegan | BOOLEAN | Vegan flag |
| is_gluten_free | BOOLEAN | Gluten-free flag |
| description | TEXT | Item description |
| allergens | TEXT | Allergen information |
| is_available | BOOLEAN | Availability status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### 4. `buffet_menu_items` - Buffet-Item Relationships
Links buffet options to their included menu items (many-to-many relationship).

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| buffet_id | VARCHAR(50) | Foreign key to buffet_options |
| menu_item_id | INT | Foreign key to menu_items |
| created_at | TIMESTAMP | Creation timestamp |

#### 5. `bookings` - Customer Bookings
Stores all buffet bookings made through the app.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| user_id | VARCHAR(36) | Foreign key to users (NULL for guests) |
| buffet_id | VARCHAR(50) | Foreign key to buffet_options |
| buffet_name | VARCHAR(100) | Buffet name at time of booking |
| buffet_price | DECIMAL(10,2) | Price per person at booking time |
| booking_date | DATE | Date of the buffet |
| booking_time | VARCHAR(10) | Time slot (e.g., '12:00 PM') |
| number_of_people | INT | Party size |
| dietary_preference | ENUM | 'none', 'vegetarian', 'vegan', 'mixed' |
| special_requests | TEXT | Customer special requests |
| status | ENUM | 'pending', 'confirmed', 'rejected', 'cancelled' |
| total_price | DECIMAL(10,2) | Total booking price |
| customer_name | VARCHAR(200) | Customer name |
| customer_email | VARCHAR(255) | Customer email |
| customer_phone | VARCHAR(20) | Customer phone |
| created_at | TIMESTAMP | Booking creation time |
| updated_at | TIMESTAMP | Last update timestamp |

### Supporting Tables

#### 6. `dietary_options` - Buffet Dietary Information
Stores dietary information for each buffet option.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| buffet_id | VARCHAR(50) | Foreign key to buffet_options |
| option_name | VARCHAR(100) | Dietary option name |
| description | TEXT | Option description |
| created_at | TIMESTAMP | Creation timestamp |

#### 7. `available_time_slots` - Booking Time Slots
Stores available time slots for bookings.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| time_slot | VARCHAR(10) | Time slot (e.g., '11:00 AM') |
| is_active | BOOLEAN | Availability status |
| display_order | INT | Display order in app |
| created_at | TIMESTAMP | Creation timestamp |

#### 8. `business_settings` - Application Configuration
Stores business settings and configuration values.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| setting_key | VARCHAR(100) | Setting identifier |
| setting_value | TEXT | Setting value |
| setting_type | ENUM | 'string', 'number', 'boolean', 'json' |
| description | TEXT | Setting description |
| is_public | BOOLEAN | Whether app can access this setting |
| updated_at | TIMESTAMP | Last update timestamp |

#### 9. `booking_status_history` - Audit Trail
Tracks status changes for bookings.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| booking_id | VARCHAR(36) | Foreign key to bookings |
| old_status | ENUM | Previous status |
| new_status | ENUM | New status |
| changed_by | VARCHAR(100) | Who made the change |
| change_reason | TEXT | Reason for change |
| created_at | TIMESTAMP | Change timestamp |

#### 10. `admin_users` - Administrative Users
Stores admin/staff accounts for backend management.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| username | VARCHAR(100) | Unique username |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Encrypted password |
| full_name | VARCHAR(200) | Full name |
| role | ENUM | 'admin', 'staff', 'manager' |
| is_active | BOOLEAN | Account status |
| last_login | TIMESTAMP | Last login time |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update timestamp |

## Installation Instructions

### 1. Create Database
```sql
CREATE DATABASE nook_buffet;
USE nook_buffet;
```

### 2. Run Schema Creation
```bash
mysql -u username -p nook_buffet < nookbuffet_database_schema.sql
```

### 3. Insert Sample Data
```bash
mysql -u username -p nook_buffet < nookbuffet_sample_data.sql
```

## Key Relationships

- **Users → Bookings**: One-to-many (users can have multiple bookings)
- **Buffet Options → Bookings**: One-to-many (buffets can have multiple bookings)
- **Buffet Options ↔ Menu Items**: Many-to-many (via buffet_menu_items)
- **Buffet Options → Dietary Options**: One-to-many
- **Bookings → Status History**: One-to-many (audit trail)

## Indexes

The schema includes strategic indexes for optimal performance:
- Primary keys on all tables
- Foreign key indexes
- Email indexes for quick user lookup
- Date indexes for booking queries
- Status indexes for filtering

## Data Flow

1. **User Registration**: Data flows to `users` table
2. **Buffet Browsing**: Data retrieved from `buffet_options`, `menu_items`, `buffet_menu_items`, `dietary_options`
3. **Booking Creation**: Data flows to `bookings` table
4. **Status Updates**: Changes tracked in `booking_status_history`
5. **Configuration**: App settings stored in `business_settings`

## Security Considerations

- All passwords are hashed using bcrypt
- User IDs are UUIDs to prevent enumeration
- Foreign key constraints maintain data integrity
- Soft deletes used where appropriate (is_active flags)
- Audit trail for booking status changes

## Backup Strategy

- Regular backups of all tables
- Separate backup of configuration data
- Export booking data for historical analysis
- Test restore procedures regularly

## Performance Optimization

- Proper indexing on frequently queried columns
- Denormalized data in bookings table for historical accuracy
- Efficient queries provided in utility script
- Regular table analysis and optimization

This database schema supports the complete functionality of the Nook Buffet Flutter application while maintaining data integrity, performance, and scalability.

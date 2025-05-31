# The Nook Buffet Flutter App - UI/UX Documentation

## Overview
This Flutter mobile application provides a seamless buffet ordering experience for The Nook Buffet customers. The app focuses on intuitive navigation, clean design, and frictionless user experience.

## Design Philosophy
- **Bold simplicity** with intuitive navigation creating frictionless experiences
- **Breathable whitespace** complemented by strategic colour accents for visual hierarchy
- **Strategic negative space** calibrated for cognitive breathing room and content prioritization
- **Systematic colour theory** applied through subtle gradients and purposeful accent placement
- **Typography hierarchy** utilizing weight variance and proportional scaling for information architecture

## App Structure

### Folder Organization
```
lib/
├── config/
│   └── app_config.dart          # App-wide configuration, colors, typography
├── models/
│   ├── buffet_option.dart       # Buffet data model
│   └── booking.dart             # Booking data model
├── screens/
│   ├── splash_screen.dart       # App launch screen
│   ├── welcome_screen.dart      # Main browsing screen
│   ├── buffet_details_screen.dart # Detailed buffet view
│   ├── booking_screen.dart      # Booking form
│   ├── order_confirmation_screen.dart # Confirmation
│   ├── login_user_screen.dart   # User login
│   └── register_user_screen.dart # User registration
├── widgets/
│   ├── custom_button.dart       # Reusable button components
│   └── buffet_card.dart         # Buffet option display card
└── main.dart                    # App entry point
```

## Screen Flow

### 1. Splash Screen (`splash_screen.dart`)
- **Purpose**: Brand introduction and app initialization
- **Features**:
  - Animated logo display
  - Smooth transition to welcome screen
  - 5-second duration with fade animations

### 2. Welcome Screen (`welcome_screen.dart`)
- **Purpose**: Main browsing interface for buffet options
- **Features**:
  - Browse all 3 buffet options without login requirement
  - Business information display (address, phone)
  - Guest browsing capability
  - Quick access to login/register
  - Bottom action bar for selected buffet

### 3. Buffet Details Screen (`buffet_details_screen.dart`)
- **Purpose**: Detailed view of selected buffet option
- **Features**:
  - Complete menu item listing
  - Vegetarian filter toggle
  - Dietary information display
  - Visual indicators for vegetarian items
  - Pricing and item count summary

### 4. Booking Screen (`booking_screen.dart`)
- **Purpose**: Complete booking process
- **Features**:
  - Date and time selection
  - Party size adjustment
  - Dietary preference selection
  - Customer information form
  - Special requests text area
  - Real-time price calculation

### 5. Order Confirmation Screen (`order_confirmation_screen.dart`)
- **Purpose**: Booking confirmation and next steps
- **Features**:
  - Booking reference number
  - Complete order summary
  - Customer contact details
  - Next steps information
  - Return to home navigation

### 6. Login Screen (`login_user_screen.dart`)
- **Purpose**: User authentication
- **Features**:
  - Email and password fields
  - Remember me option
  - Forgot password functionality
  - Guest continuation option
  - Registration link

### 7. Register Screen (`register_user_screen.dart`)
- **Purpose**: New user account creation
- **Features**:
  - Complete user information form
  - Password confirmation
  - Terms and conditions agreement
  - Newsletter subscription option
  - Form validation

## Key Components

### Custom Button (`custom_button.dart`)
- Multiple button types: Primary, Secondary, Outline, Text
- Loading state support
- Icon integration
- Consistent styling across app

### Buffet Card (`buffet_card.dart`)
- Attractive buffet option display
- Popular badge for featured items
- Item preview with dietary indicators
- Selection state management
- Action buttons for details and selection

## Data Models

### BuffetOption (`buffet_option.dart`)
- Three buffet tiers: £9.90, £10.90, £13.90
- Complete menu item listings
- Dietary option categorization
- Vegetarian item filtering
- Static data with future API integration support

### Booking (`booking.dart`)
- Complete booking information
- Status tracking (pending, confirmed, rejected, cancelled)
- Dietary preference enumeration
- Customer contact details
- JSON serialization for future API integration

## Color Scheme
- **Primary**: Charcoal Black (#212121) with elegant gradients
- **Secondary**: Medium Gray (#757575) with subtle gradients
- **Background**: Off-white (#FAFAFA) with gradient overlays
- **Surface**: Pure White (#FFFFFF) with card gradients
- **Text Primary**: Dark Gray (#212121)
- **Success**: Dark Green (#2E7D32)
- **Error**: Red (#D32F2F)

### Gradient System
- **Primary Gradient**: Three-stop gradient from light gray to charcoal to black
- **Secondary Gradient**: Three-stop light gray gradient optimized for dark text visibility
- **Card Gradient**: Subtle white to light gray gradient for depth
- **Background Gradient**: Soft off-white gradient for visual interest

## Typography
- **Font Family**: Roboto
- **Heading Large**: 32px, Bold
- **Heading Medium**: 24px, Semi-bold
- **Heading Small**: 20px, Semi-bold
- **Body Large**: 16px, Normal
- **Body Medium**: 14px, Normal
- **Body Small**: 12px, Normal

## User Experience Features

### Guest Browsing
- Users can browse all buffet options without registration
- Login/registration only required at booking confirmation
- Seamless transition between guest and authenticated states

### Accessibility
- High contrast ratios for text readability
- Intuitive navigation patterns
- Clear visual hierarchy
- Touch-friendly button sizes
- Screen reader compatible structure

### Responsive Design
- Optimized for both iOS and Android
- Consistent spacing using design system
- Adaptive layouts for different screen sizes
- Material Design 3 compliance

## Future Enhancements
- API integration for real-time data
- Payment processing integration
- Push notifications for booking updates
- User account management
- Booking history and favorites
- Social media integration
- Multi-language support

## Testing
- Basic widget tests included
- UI component testing structure
- Screen navigation testing framework
- Form validation testing

## Assets
- Logo and branding images included
- Buffet example images for visual appeal
- Icon placeholders for future expansion
- Optimized image formats for mobile performance

This documentation provides a comprehensive overview of the UI/UX implementation for the Nook Buffet Flutter application, focusing on user experience, design consistency, and maintainable code structure.

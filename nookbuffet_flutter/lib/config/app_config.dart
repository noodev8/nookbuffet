/*
App Configuration file for Nook Buffet Flutter Application
Centralized configuration with polished black/white gradient theme
Contains app information, business details, and design system
*/

import 'package:flutter/material.dart';

class AppConfig {
  // App Information
  static const String appName = 'The Nook';
  static const String appVersion = '1.0.1';

  // Business Information
  static const String businessName = 'Nook Buffet';
  static const String businessEmail = 'NOOKBUFFET@GMAIL.COM';
  static const String businessPhone = '07551428162';
  static const String businessAddress = '42 High Street, Welshpool, SY21 7JQ';

  // Asset Paths
  static const String logoPath = 'assets/nookbuffet_logo.png';

  // Color Palette - Polished Black & White with Gradients
  static const Color primaryBlack = Color(0xFF000000);
  static const Color primaryWhite = Color(0xFFFFFFFF);
  static const Color softBlack = Color(0xFF1A1A1A);
  static const Color charcoalGray = Color(0xFF2D2D2D);
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color mediumGray = Color(0xFF9E9E9E);
  static const Color accentGray = Color(0xFF424242);

  // Gradient Definitions
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [softBlack, primaryBlack],
  );

  // Animated Splash Screen Gradient: Black-to-Grey-to-Light Grey
  static const LinearGradient splashGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      primaryBlack,      // Black at top
      charcoalGray,      // Grey in middle
      Color(0xFF757575), // Light Grey at bottom
    ],
    stops: [0.0, 0.5, 1.0],
  );

  static const LinearGradient lightGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryWhite, lightGray],
  );

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryWhite, Color(0xFFFAFAFA)],
  );

  // Dashboard/Welcome Screen Gradient: Elegant black-to-grey full background
  static const LinearGradient dashboardGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      primaryBlack,      // Black at top
      softBlack,         // Soft black in middle
      charcoalGray,      // Charcoal grey at bottom
    ],
    stops: [0.0, 0.4, 1.0],
  );

  // Spacing Constants
  static const double spacingXS = 4.0;
  static const double spacingS = 8.0;
  static const double spacingM = 16.0;
  static const double spacingL = 24.0;
  static const double spacingXL = 32.0;
  static const double spacingXXL = 48.0;

  // Border Radius
  static const double radiusS = 8.0;
  static const double radiusM = 12.0;
  static const double radiusL = 16.0;
  static const double radiusXL = 24.0;

  // Typography
  static const String fontFamily = 'Roboto';

  static const TextStyle headingLarge = TextStyle(
    fontSize: 28.0,
    fontWeight: FontWeight.bold,
    color: primaryBlack,
    letterSpacing: -0.5,
  );

  static const TextStyle headingMedium = TextStyle(
    fontSize: 22.0,
    fontWeight: FontWeight.w600,
    color: primaryBlack,
    letterSpacing: -0.25,
  );

  static const TextStyle headingSmall = TextStyle(
    fontSize: 18.0,
    fontWeight: FontWeight.w600,
    color: primaryBlack,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16.0,
    fontWeight: FontWeight.normal,
    color: primaryBlack,
    height: 1.5,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14.0,
    fontWeight: FontWeight.normal,
    color: primaryBlack,
    height: 1.4,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 12.0,
    fontWeight: FontWeight.normal,
    color: mediumGray,
    height: 1.3,
  );

  static const TextStyle buttonText = TextStyle(
    fontSize: 16.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
  );

  // Animation Durations
  static const Duration animationFast = Duration(milliseconds: 200);
  static const Duration animationMedium = Duration(milliseconds: 300);
  static const Duration animationSlow = Duration(milliseconds: 500);
  static const Duration splashAnimationDuration = Duration(milliseconds: 1200); // 1.2 seconds for animation
  static const Duration splashDuration = Duration(seconds: 5); // 5 seconds total display time

  // Responsive Design Constants
  static const double tabletBreakpoint = 600.0; // Screen width threshold for tablet detection
  static const double mobileLogoSize = 120.0;
  static const double tabletLogoSize = 160.0;
  static const double mobileFontSizeLarge = 32.0;
  static const double tabletFontSizeLarge = 42.0;
  static const double mobileFontSizeMedium = 18.0;
  static const double tabletFontSizeMedium = 24.0;
}

/*
App Configuration file for Nook Buffet Flutter Application
Contains all the app-wide constants, colors, and configuration settings
This centralizes all the styling and branding elements for easy maintenance
*/

import 'package:flutter/material.dart';

class AppConfig {
  // App Information
  static const String appName = 'Nook Buffet';
  static const String appVersion = '1.0.0';
  
  // Business Information
  static const String businessName = 'Nook Buffet';
  static const String businessEmail = 'NOOKBUFFET@GMAIL.COM';
  static const String businessPhone = '07551428162';
  static const String businessAddress = '42 High Street, Welshpool, SY21 7JQ';
  
  // Color Palette - Following aesthetic guidelines for bold simplicity
  static const Color primaryColor = Color(0xFF2E7D32);        // Deep green
  static const Color primaryLightColor = Color(0xFF4CAF50);   // Light green
  static const Color primaryDarkColor = Color(0xFF1B5E20);    // Dark green
  
  static const Color secondaryColor = Color(0xFFFF8F00);      // Warm orange
  static const Color secondaryLightColor = Color(0xFFFFB74D); // Light orange
  static const Color secondaryDarkColor = Color(0xFFE65100);  // Dark orange
  
  static const Color backgroundColor = Color(0xFFFAFAFA);     // Off-white
  static const Color surfaceColor = Color(0xFFFFFFFF);       // Pure white
  static const Color cardColor = Color(0xFFFFFFFF);          // Card background
  
  static const Color textPrimaryColor = Color(0xFF212121);   // Dark gray
  static const Color textSecondaryColor = Color(0xFF757575); // Medium gray
  static const Color textLightColor = Color(0xFFBDBDBD);     // Light gray
  
  static const Color errorColor = Color(0xFFD32F2F);         // Red
  static const Color successColor = Color(0xFF388E3C);       // Green
  static const Color warningColor = Color(0xFFF57C00);       // Orange
  
  // Typography - Weight variance and proportional scaling
  static const String fontFamily = 'Roboto';
  
  static const TextStyle headingLarge = TextStyle(
    fontSize: 32.0,
    fontWeight: FontWeight.bold,
    color: textPrimaryColor,
    letterSpacing: -0.5,
  );
  
  static const TextStyle headingMedium = TextStyle(
    fontSize: 24.0,
    fontWeight: FontWeight.w600,
    color: textPrimaryColor,
    letterSpacing: -0.25,
  );
  
  static const TextStyle headingSmall = TextStyle(
    fontSize: 20.0,
    fontWeight: FontWeight.w600,
    color: textPrimaryColor,
  );
  
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16.0,
    fontWeight: FontWeight.normal,
    color: textPrimaryColor,
    height: 1.5,
  );
  
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14.0,
    fontWeight: FontWeight.normal,
    color: textPrimaryColor,
    height: 1.4,
  );
  
  static const TextStyle bodySmall = TextStyle(
    fontSize: 12.0,
    fontWeight: FontWeight.normal,
    color: textSecondaryColor,
    height: 1.3,
  );
  
  static const TextStyle buttonText = TextStyle(
    fontSize: 16.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
  );
  
  static const TextStyle captionText = TextStyle(
    fontSize: 12.0,
    fontWeight: FontWeight.normal,
    color: textSecondaryColor,
  );
  
  // Spacing and Layout - Strategic negative space
  static const double spacingXSmall = 4.0;
  static const double spacingSmall = 8.0;
  static const double spacingMedium = 16.0;
  static const double spacingLarge = 24.0;
  static const double spacingXLarge = 32.0;
  static const double spacingXXLarge = 48.0;
  
  // Border Radius
  static const double borderRadiusSmall = 8.0;
  static const double borderRadiusMedium = 12.0;
  static const double borderRadiusLarge = 16.0;
  static const double borderRadiusXLarge = 24.0;
  
  // Elevation
  static const double elevationLow = 2.0;
  static const double elevationMedium = 4.0;
  static const double elevationHigh = 8.0;
  
  // Animation Durations - Physics-based transitions
  static const Duration animationFast = Duration(milliseconds: 200);
  static const Duration animationMedium = Duration(milliseconds: 300);
  static const Duration animationSlow = Duration(milliseconds: 500);
  
  // Asset Paths
  static const String logoPath = 'assets/images/nookbuffet_logo.jpg';
  static const String barImagePath = 'assets/images/nookbuffet_bar.png';
  static const String buffetImagePath = 'assets/images/buffet-example-1.jpg';
  
  // App Theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.light,
        surface: surfaceColor,
        background: backgroundColor,
      ),
      fontFamily: fontFamily,
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: elevationLow,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(
            horizontal: spacingLarge,
            vertical: spacingMedium,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadiusMedium),
          ),
          textStyle: buttonText,
        ),
      ),
      cardTheme: CardTheme(
        color: cardColor,
        elevation: elevationLow,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadiusMedium),
        ),
        margin: const EdgeInsets.all(spacingSmall),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadiusMedium),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: spacingMedium,
          vertical: spacingMedium,
        ),
      ),
    );
  }
}

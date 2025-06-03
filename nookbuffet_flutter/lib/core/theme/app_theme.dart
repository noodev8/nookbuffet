/*
Core App Theme for Nook Buffet Flutter Application
Implements polished black and white gradient design system
Provides centralized theming for consistent UI/UX across the app
*/

import 'package:flutter/material.dart';
import '../../config/app_config.dart';

class AppTheme {
  // Main app theme with gradient black backgrounds and polished styling
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: AppConfig.fontFamily,
      
      // Color scheme based on black/white with gradients
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppConfig.primaryBlack,
        brightness: Brightness.light,
        primary: AppConfig.primaryBlack,
        secondary: AppConfig.accentGray,
        surface: AppConfig.primaryWhite,
        background: AppConfig.lightGray,
      ),
      
      // Scaffold background with light gradient
      scaffoldBackgroundColor: AppConfig.lightGray,
      
      // AppBar theme with gradient black background
      appBarTheme: const AppBarTheme(
        backgroundColor: AppConfig.primaryBlack,
        foregroundColor: AppConfig.primaryWhite,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppConfig.primaryWhite,
          letterSpacing: 0.5,
        ),
      ),
      
      // Elevated button theme with gradient styling
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppConfig.primaryBlack,
          foregroundColor: AppConfig.primaryWhite,
          elevation: 2,
          padding: const EdgeInsets.symmetric(
            horizontal: AppConfig.spacingL,
            vertical: AppConfig.spacingM,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConfig.radiusM),
          ),
          textStyle: AppConfig.buttonText.copyWith(
            color: AppConfig.primaryWhite,
          ),
        ),
      ),
      
      // Outlined button theme for secondary actions
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppConfig.primaryBlack,
          side: const BorderSide(color: AppConfig.primaryBlack, width: 1.5),
          padding: const EdgeInsets.symmetric(
            horizontal: AppConfig.spacingL,
            vertical: AppConfig.spacingM,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConfig.radiusM),
          ),
          textStyle: AppConfig.buttonText.copyWith(
            color: AppConfig.primaryBlack,
          ),
        ),
      ),
      
      // Card theme with gradient background
      cardTheme: CardTheme(
        color: AppConfig.primaryWhite,
        elevation: 4,
        shadowColor: AppConfig.primaryBlack.withOpacity(0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConfig.radiusL),
        ),
        margin: const EdgeInsets.all(AppConfig.spacingS),
      ),
      
      // Input decoration theme for forms
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppConfig.primaryWhite,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.radiusM),
          borderSide: const BorderSide(color: AppConfig.mediumGray),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.radiusM),
          borderSide: const BorderSide(color: AppConfig.mediumGray),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.radiusM),
          borderSide: const BorderSide(color: AppConfig.primaryBlack, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppConfig.spacingM,
          vertical: AppConfig.spacingM,
        ),
        labelStyle: AppConfig.bodyMedium.copyWith(
          color: AppConfig.mediumGray,
        ),
        hintStyle: AppConfig.bodyMedium.copyWith(
          color: AppConfig.mediumGray,
        ),
      ),
      
      // Text theme using our custom typography
      textTheme: const TextTheme(
        headlineLarge: AppConfig.headingLarge,
        headlineMedium: AppConfig.headingMedium,
        headlineSmall: AppConfig.headingSmall,
        bodyLarge: AppConfig.bodyLarge,
        bodyMedium: AppConfig.bodyMedium,
        bodySmall: AppConfig.bodySmall,
        labelLarge: AppConfig.buttonText,
      ),
      
      // Divider theme
      dividerTheme: const DividerThemeData(
        color: AppConfig.mediumGray,
        thickness: 1,
        space: AppConfig.spacingM,
      ),
      
      // Bottom navigation bar theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppConfig.primaryWhite,
        selectedItemColor: AppConfig.primaryBlack,
        unselectedItemColor: AppConfig.mediumGray,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}

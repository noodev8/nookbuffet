/*
Main entry point for Nook Buffet Flutter Application
Sets up the app theme, routing, and initial screen
Uses the app configuration for consistent styling throughout
*/

import 'package:flutter/material.dart';
import 'config/app_config.dart';
import 'screens/splash_screen.dart';

void main() {
  runApp(const NookBuffetApp());
}

class NookBuffetApp extends StatelessWidget {
  const NookBuffetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      theme: AppConfig.lightTheme,
      home: const SplashScreen(),
      debugShowCheckedModeBanner: false,

      // Global app settings
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: const TextScaler.linear(1.0), // Prevent text scaling issues
          ),
          child: child!,
        );
      },
    );
  }
}



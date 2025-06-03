/*
Main entry point for Nook Buffet Flutter Application
Complete buffet ordering app with polished UI/UX design
Features splash screen, buffet selection, and booking functionality
*/

import 'package:flutter/material.dart';
import 'config/app_config.dart';
import 'core/theme/app_theme.dart';
import 'features/splash/presentation/splash_screen.dart';

void main() {
  runApp(const NookBuffetApp());
}

class NookBuffetApp extends StatelessWidget {
  const NookBuffetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      theme: AppTheme.lightTheme,
      home: const SplashScreen(),
      debugShowCheckedModeBanner: false,

      // Global app settings for consistent behavior
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



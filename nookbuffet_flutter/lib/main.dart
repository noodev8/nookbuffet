/*
Main entry point for Nook Buffet Flutter Application
Minimal app structure for fresh UI development
*/

import 'package:flutter/material.dart';
import 'config/app_config.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const NookBuffetApp());
}

class NookBuffetApp extends StatelessWidget {
  const NookBuffetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
      ),
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}



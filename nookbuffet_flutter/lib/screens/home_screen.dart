/*
Home Screen for Nook Buffet Flutter Application
Simple starting point with minimal "Hello" display
Clean foundation for building new UI design patterns
*/

import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('The Nook'),
        centerTitle: true,
      ),
      body: const Center(
        child: Text(
          'Hello',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

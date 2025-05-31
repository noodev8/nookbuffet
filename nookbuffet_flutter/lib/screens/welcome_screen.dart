/*
Welcome Screen for Nook Buffet App
Main landing page showing available buffet options
Allows users to browse without requiring login/registration
*/

import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../models/buffet_option.dart';
import '../widgets/buffet_card.dart';
import '../widgets/custom_button.dart';
import 'buffet_details_screen.dart';
import 'login_user_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  List<BuffetOption> buffetOptions = [];
  String? selectedBuffetId;

  @override
  void initState() {
    super.initState();
    _loadBuffetOptions();
  }

  void _loadBuffetOptions() {
    setState(() {
      buffetOptions = BuffetOption.getAllBuffetOptions();
    });
  }

  void _selectBuffet(String buffetId) {
    setState(() {
      selectedBuffetId = buffetId;
    });
  }

  void _viewBuffetDetails(BuffetOption buffet) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BuffetDetailsScreen(buffet: buffet),
      ),
    );
  }

  void _proceedToBooking() {
    if (selectedBuffetId != null) {
      final selectedBuffet = BuffetOption.getBuffetById(selectedBuffetId!);
      if (selectedBuffet != null) {
        _viewBuffetDetails(selectedBuffet);
      }
    }
  }

  void _showLoginOptions() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const LoginUserScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConfig.backgroundColor,
      appBar: AppBar(
        title: const Text(AppConfig.businessName),
        backgroundColor: AppConfig.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: _showLoginOptions,
            tooltip: 'Login / Register',
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Header section
            _buildHeader(),
            
            // Buffet options list
            Expanded(
              child: _buildBuffetList(),
            ),
            
            // Bottom action bar
            if (selectedBuffetId != null) _buildBottomActionBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: AppConfig.primaryColor,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(AppConfig.borderRadiusLarge),
          bottomRight: Radius.circular(AppConfig.borderRadiusLarge),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Choose Your Perfect Buffet',
              style: AppConfig.headingMedium.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingSmall),
            
            Text(
              'Browse our delicious buffet options and book your perfect meal',
              style: AppConfig.bodyMedium.copyWith(
                color: Colors.white.withOpacity(0.9),
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingMedium),
            
            // Business info
            Row(
              children: [
                const Icon(
                  Icons.location_on,
                  color: Colors.white,
                  size: 16,
                ),
                const SizedBox(width: AppConfig.spacingXSmall),
                Expanded(
                  child: Text(
                    AppConfig.businessAddress,
                    style: AppConfig.bodySmall.copyWith(
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: AppConfig.spacingXSmall),
            
            Row(
              children: [
                const Icon(
                  Icons.phone,
                  color: Colors.white,
                  size: 16,
                ),
                const SizedBox(width: AppConfig.spacingXSmall),
                Text(
                  AppConfig.businessPhone,
                  style: AppConfig.bodySmall.copyWith(
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBuffetList() {
    if (buffetOptions.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: AppConfig.spacingMedium),
      itemCount: buffetOptions.length,
      itemBuilder: (context, index) {
        final buffet = buffetOptions[index];
        return BuffetCard(
          buffet: buffet,
          isSelected: selectedBuffetId == buffet.id,
          onTap: () => _viewBuffetDetails(buffet),
          onSelect: () => _selectBuffet(buffet.id),
        );
      },
    );
  }

  Widget _buildBottomActionBar() {
    final selectedBuffet = BuffetOption.getBuffetById(selectedBuffetId!);
    
    return Container(
      padding: const EdgeInsets.all(AppConfig.spacingMedium),
      decoration: BoxDecoration(
        color: AppConfig.surfaceColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Selected: ${selectedBuffet?.name}',
                        style: AppConfig.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        selectedBuffet?.formattedPrice ?? '',
                        style: AppConfig.bodyLarge.copyWith(
                          color: AppConfig.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                CustomButton(
                  text: 'Book Now',
                  onPressed: _proceedToBooking,
                  icon: Icons.arrow_forward,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/*
Welcome Dashboard for Nook Buffet Flutter Application
Elegant full-screen gradient design with classy header
Informational buffet options with prominent call-to-action
Sophisticated black-to-grey gradient background
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../buffet/presentation/buffet_selection_screen.dart';
import '../../auth/presentation/login_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Full-screen elegant gradient background
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppConfig.dashboardGradient,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Classy gradient header
                _buildClassyHeader(context),

                // Welcome hero section with elegant styling
                _buildElegantHeroSection(context),

                // Informational buffet options
                _buildInformationalBuffetSection(context),

                // Prominent call-to-action
                _buildProminentActionButton(context),

                // Business information with dark theme
                _buildDarkBusinessInfo(context),

                // Footer spacing
                const SizedBox(height: AppConfig.spacingXL),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildClassyHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppConfig.spacingL),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppConfig.primaryBlack.withValues(alpha: 0.9),
            AppConfig.primaryBlack.withValues(alpha: 0.7),
            Colors.transparent,
          ],
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Elegant app branding
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppConfig.appName,
                style: AppConfig.headingLarge.copyWith(
                  color: AppConfig.primaryWhite,
                  fontWeight: FontWeight.w300,
                  fontSize: 32,
                  letterSpacing: 2.0,
                  shadows: [
                    Shadow(
                      color: AppConfig.primaryBlack.withValues(alpha: 0.8),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppConfig.spacingXS),
              Text(
                'Buffet Excellence',
                style: AppConfig.bodyMedium.copyWith(
                  color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                  fontWeight: FontWeight.w200,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),

          // Elegant login button
          Container(
            decoration: BoxDecoration(
              border: Border.all(
                color: AppConfig.primaryWhite.withValues(alpha: 0.3),
                width: 1,
              ),
              borderRadius: BorderRadius.circular(AppConfig.radiusM),
            ),
            child: TextButton(
              onPressed: () => _navigateToLogin(context),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppConfig.spacingL,
                  vertical: AppConfig.spacingM,
                ),
              ),
              child: Text(
                'Login',
                style: AppConfig.bodyMedium.copyWith(
                  color: AppConfig.primaryWhite,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildElegantHeroSection(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingL),
      padding: const EdgeInsets.all(AppConfig.spacingXL),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppConfig.primaryWhite.withValues(alpha: 0.15),
            AppConfig.primaryWhite.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(AppConfig.radiusXL),
        border: Border.all(
          color: AppConfig.primaryWhite.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Welcome to\n${AppConfig.businessName}',
            style: AppConfig.headingLarge.copyWith(
              color: AppConfig.primaryWhite,
              fontSize: 28,
              fontWeight: FontWeight.w400,
              height: 1.3,
              shadows: [
                Shadow(
                  color: AppConfig.primaryBlack.withValues(alpha: 0.6),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
          ),

          const SizedBox(height: AppConfig.spacingM),

          Text(
            'Delicious buffets crafted with fresh ingredients and served with care. Perfect for any occasion.',
            style: AppConfig.bodyLarge.copyWith(
              color: AppConfig.primaryWhite.withValues(alpha: 0.9),
              height: 1.6,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInformationalBuffetSection(BuildContext context) {
    final buffets = [
      {'name': 'Classic Buffet', 'description': 'Traditional favorites with timeless appeal'},
      {'name': 'Premium Buffet', 'description': 'Elevated dishes with premium ingredients'},
      {'name': 'Deluxe Buffet', 'description': 'Our finest selection for special occasions'},
    ];

    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingL),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section title
          Text(
            'Our Buffet Options',
            style: AppConfig.headingLarge.copyWith(
              color: AppConfig.primaryWhite,
              fontSize: 24,
              fontWeight: FontWeight.w400,
              letterSpacing: 1.0,
              shadows: [
                Shadow(
                  color: AppConfig.primaryBlack.withValues(alpha: 0.6),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
          ),

          const SizedBox(height: AppConfig.spacingS),

          Text(
            'Choose from our carefully crafted buffet selections',
            style: AppConfig.bodyMedium.copyWith(
              color: AppConfig.primaryWhite.withValues(alpha: 0.7),
              fontSize: 16,
            ),
          ),

          const SizedBox(height: AppConfig.spacingXL),

          // Informational buffet cards
          ...buffets.map((buffet) => Container(
            margin: const EdgeInsets.only(bottom: AppConfig.spacingM),
            padding: const EdgeInsets.all(AppConfig.spacingL),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppConfig.primaryWhite.withValues(alpha: 0.1),
                  AppConfig.primaryWhite.withValues(alpha: 0.05),
                ],
              ),
              borderRadius: BorderRadius.circular(AppConfig.radiusL),
              border: Border.all(
                color: AppConfig.primaryWhite.withValues(alpha: 0.15),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        buffet['name']!,
                        style: AppConfig.headingMedium.copyWith(
                          color: AppConfig.primaryWhite,
                          fontWeight: FontWeight.w500,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: AppConfig.spacingXS),
                      Text(
                        buffet['description']!,
                        style: AppConfig.bodyMedium.copyWith(
                          color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.restaurant_menu,
                  color: AppConfig.primaryWhite.withValues(alpha: 0.6),
                  size: 24,
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildProminentActionButton(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingL),
      child: Column(
        children: [
          // Prominent Browse Buffets button
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppConfig.primaryWhite,
                  AppConfig.lightGray,
                ],
              ),
              borderRadius: BorderRadius.circular(AppConfig.radiusL),
              boxShadow: [
                BoxShadow(
                  color: AppConfig.primaryBlack.withValues(alpha: 0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => _navigateToBuffetSelection(context),
                borderRadius: BorderRadius.circular(AppConfig.radiusL),
                child: Padding(
                  padding: const EdgeInsets.all(AppConfig.spacingL),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.restaurant_menu,
                        color: AppConfig.primaryBlack,
                        size: 28,
                      ),
                      const SizedBox(width: AppConfig.spacingM),
                      Text(
                        'Browse Our Buffets',
                        style: AppConfig.headingMedium.copyWith(
                          color: AppConfig.primaryBlack,
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: AppConfig.spacingM),

          // Secondary contact button
          TextButton(
            onPressed: () => _showContactDialog(context),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                horizontal: AppConfig.spacingL,
                vertical: AppConfig.spacingM,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.phone,
                  color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                  size: 20,
                ),
                const SizedBox(width: AppConfig.spacingS),
                Text(
                  'Contact Us',
                  style: AppConfig.bodyMedium.copyWith(
                    color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDarkBusinessInfo(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingL),
      padding: const EdgeInsets.all(AppConfig.spacingL),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppConfig.primaryWhite.withValues(alpha: 0.1),
            AppConfig.primaryWhite.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(AppConfig.radiusL),
        border: Border.all(
          color: AppConfig.primaryWhite.withValues(alpha: 0.15),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Get in Touch',
            style: AppConfig.headingMedium.copyWith(
              color: AppConfig.primaryWhite,
              fontWeight: FontWeight.w500,
              fontSize: 20,
            ),
          ),

          const SizedBox(height: AppConfig.spacingS),

          Text(
            'We\'re here to help with your buffet needs',
            style: AppConfig.bodyMedium.copyWith(
              color: AppConfig.primaryWhite.withValues(alpha: 0.8),
            ),
          ),

          const SizedBox(height: AppConfig.spacingL),

          // Contact information
          _buildContactItem(Icons.location_on, AppConfig.businessAddress),
          const SizedBox(height: AppConfig.spacingM),
          _buildContactItem(Icons.phone, AppConfig.businessPhone),
          const SizedBox(height: AppConfig.spacingM),
          _buildContactItem(Icons.email, AppConfig.businessEmail),
        ],
      ),
    );
  }

  void _navigateToBuffetSelection(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const BuffetSelectionScreen(),
      ),
    );
  }

  void _navigateToLogin(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const LoginScreen(),
      ),
    );
  }

  void _showContactDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Contact Information'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildContactItem(Icons.location_on, AppConfig.businessAddress),
            const SizedBox(height: AppConfig.spacingM),
            _buildContactItem(Icons.phone, AppConfig.businessPhone),
            const SizedBox(height: AppConfig.spacingM),
            _buildContactItem(Icons.email, AppConfig.businessEmail),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildContactItem(IconData icon, String text) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: AppConfig.primaryWhite.withValues(alpha: 0.7),
        ),
        const SizedBox(width: AppConfig.spacingS),
        Expanded(
          child: Text(
            text,
            style: AppConfig.bodyMedium.copyWith(
              color: AppConfig.primaryWhite.withValues(alpha: 0.9),
            ),
          ),
        ),
      ],
    );
  }
}

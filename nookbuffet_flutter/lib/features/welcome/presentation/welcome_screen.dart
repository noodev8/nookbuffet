/*
Welcome Screen for Nook Buffet Flutter Application
Main landing page showcasing buffet options and business information
Allows users to browse without requiring login/registration
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/models/buffet_option.dart';
import '../../buffet/presentation/buffet_selection_screen.dart';
import '../../auth/presentation/login_screen.dart';
import '../widgets/welcome_hero_section.dart';
import '../widgets/buffet_preview_card.dart';
import '../widgets/business_info_section.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GradientContainer.light(
        width: double.infinity,
        height: double.infinity,
        child: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with app name and login option
                _buildHeader(context),
                
                // Hero section with welcome message
                const WelcomeHeroSection(),
                
                // Buffet options preview
                _buildBuffetPreviewSection(context),
                
                // Call-to-action buttons
                _buildActionButtons(context),
                
                // Business information
                const BusinessInfoSection(),
                
                // Footer spacing
                const SizedBox(height: AppConfig.spacingXL),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // App logo and name
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppConfig.primaryWhite,
                  borderRadius: BorderRadius.circular(AppConfig.radiusS),
                  boxShadow: [
                    BoxShadow(
                      color: AppConfig.primaryBlack.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppConfig.radiusS),
                  child: Image.asset(
                    AppConfig.logoPath,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(
                        Icons.restaurant,
                        color: AppConfig.primaryBlack,
                        size: 24,
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(width: AppConfig.spacingS),
              Text(
                AppConfig.appName,
                style: AppConfig.headingMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          
          // Login button
          CustomButton.outlined(
            text: 'Login',
            onPressed: () => _navigateToLogin(context),
            padding: const EdgeInsets.symmetric(
              horizontal: AppConfig.spacingM,
              vertical: AppConfig.spacingS,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBuffetPreviewSection(BuildContext context) {
    final buffets = BuffetData.allBuffets;
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppConfig.spacingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Our Buffet Options',
            style: AppConfig.headingMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          
          const SizedBox(height: AppConfig.spacingS),
          
          Text(
            'Choose from our carefully crafted buffet selections',
            style: AppConfig.bodyMedium.copyWith(
              color: AppConfig.mediumGray,
            ),
          ),
          
          const SizedBox(height: AppConfig.spacingL),
          
          // Buffet preview cards
          SizedBox(
            height: 200,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: buffets.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.only(
                    right: index < buffets.length - 1 ? AppConfig.spacingM : 0,
                  ),
                  child: BuffetPreviewCard(
                    buffet: buffets[index],
                    onTap: () => _navigateToBuffetSelection(context),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Column(
        children: [
          // Primary action - Browse buffets
          CustomButton.primary(
            text: 'Browse Our Buffets',
            onPressed: () => _navigateToBuffetSelection(context),
            width: double.infinity,
            icon: Icons.restaurant_menu,
          ),
          
          const SizedBox(height: AppConfig.spacingM),
          
          // Secondary action - Contact us
          CustomButton.outlined(
            text: 'Contact Us',
            onPressed: () => _showContactDialog(context),
            width: double.infinity,
            icon: Icons.phone,
          ),
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
        Icon(icon, size: 20, color: AppConfig.mediumGray),
        const SizedBox(width: AppConfig.spacingS),
        Expanded(
          child: Text(
            text,
            style: AppConfig.bodyMedium,
          ),
        ),
      ],
    );
  }
}

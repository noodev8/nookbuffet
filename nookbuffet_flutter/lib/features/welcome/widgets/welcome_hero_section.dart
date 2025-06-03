/*
Welcome Hero Section Widget for Nook Buffet Flutter Application
Displays the main welcome message and value proposition
Features gradient background and engaging typography
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';

class WelcomeHeroSection extends StatelessWidget {
  const WelcomeHeroSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingM),
      child: GradientContainer.card(
        padding: const EdgeInsets.all(AppConfig.spacingXL),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Main welcome heading
            Text(
              'Welcome to\n${AppConfig.businessName}',
              style: AppConfig.headingLarge.copyWith(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                height: 1.2,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingM),
            
            // Subtitle with value proposition
            Text(
              'Delicious buffets crafted with fresh ingredients and served with care. Perfect for any occasion.',
              style: AppConfig.bodyLarge.copyWith(
                color: AppConfig.mediumGray,
                height: 1.5,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingL),
            
            // Key features row
            _buildFeatureRow(),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureRow() {
    return Row(
      children: [
        Expanded(
          child: _buildFeatureItem(
            icon: Icons.restaurant,
            title: 'Fresh Quality',
            description: 'Made daily with premium ingredients',
          ),
        ),
        
        const SizedBox(width: AppConfig.spacingM),
        
        Expanded(
          child: _buildFeatureItem(
            icon: Icons.schedule,
            title: 'Easy Booking',
            description: 'Simple online ordering process',
          ),
        ),
        
        const SizedBox(width: AppConfig.spacingM),
        
        Expanded(
          child: _buildFeatureItem(
            icon: Icons.local_dining,
            title: 'Variety',
            description: 'Options for every dietary need',
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureItem({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Column(
      children: [
        // Icon container with gradient background
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            gradient: AppConfig.primaryGradient,
            borderRadius: BorderRadius.circular(AppConfig.radiusM),
            boxShadow: [
              BoxShadow(
                color: AppConfig.primaryBlack.withOpacity(0.2),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(
            icon,
            color: AppConfig.primaryWhite,
            size: 24,
          ),
        ),
        
        const SizedBox(height: AppConfig.spacingS),
        
        // Feature title
        Text(
          title,
          style: AppConfig.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
          textAlign: TextAlign.center,
        ),
        
        const SizedBox(height: AppConfig.spacingXS),
        
        // Feature description
        Text(
          description,
          style: AppConfig.bodySmall.copyWith(
            color: AppConfig.mediumGray,
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}

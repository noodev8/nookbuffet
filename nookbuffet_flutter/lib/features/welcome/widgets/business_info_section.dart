/*
Business Info Section Widget for Nook Buffet Flutter Application
Displays business contact information and location details
Features clean layout with gradient styling
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';

class BusinessInfoSection extends StatelessWidget {
  const BusinessInfoSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingM),
      child: GradientContainer.card(
        padding: const EdgeInsets.all(AppConfig.spacingL),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section title
            Text(
              'Get in Touch',
              style: AppConfig.headingMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingS),
            
            Text(
              'We\'re here to help with your buffet needs',
              style: AppConfig.bodyMedium.copyWith(
                color: AppConfig.mediumGray,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingL),
            
            // Contact information
            _buildContactInfo(),
          ],
        ),
      ),
    );
  }

  Widget _buildContactInfo() {
    return Column(
      children: [
        // Address
        _buildContactItem(
          icon: Icons.location_on,
          title: 'Address',
          content: AppConfig.businessAddress,
          iconColor: Colors.red,
        ),
        
        const SizedBox(height: AppConfig.spacingM),
        
        // Phone
        _buildContactItem(
          icon: Icons.phone,
          title: 'Phone',
          content: AppConfig.businessPhone,
          iconColor: Colors.green,
        ),
        
        const SizedBox(height: AppConfig.spacingM),
        
        // Email
        _buildContactItem(
          icon: Icons.email,
          title: 'Email',
          content: AppConfig.businessEmail,
          iconColor: Colors.blue,
        ),
        
        const SizedBox(height: AppConfig.spacingL),
        
        // Opening hours info
        _buildOpeningHours(),
      ],
    );
  }

  Widget _buildContactItem({
    required IconData icon,
    required String title,
    required String content,
    required Color iconColor,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Icon container
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(AppConfig.radiusS),
          ),
          child: Icon(
            icon,
            color: iconColor,
            size: 20,
          ),
        ),
        
        const SizedBox(width: AppConfig.spacingM),
        
        // Content
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppConfig.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppConfig.primaryBlack,
                ),
              ),
              const SizedBox(height: AppConfig.spacingXS),
              Text(
                content,
                style: AppConfig.bodyMedium.copyWith(
                  color: AppConfig.mediumGray,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOpeningHours() {
    return Container(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      decoration: BoxDecoration(
        color: AppConfig.lightGray.withOpacity(0.5),
        borderRadius: BorderRadius.circular(AppConfig.radiusM),
        border: Border.all(
          color: AppConfig.mediumGray.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.access_time,
                size: 20,
                color: AppConfig.mediumGray,
              ),
              const SizedBox(width: AppConfig.spacingS),
              Text(
                'Opening Hours',
                style: AppConfig.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: AppConfig.spacingS),
          
          Text(
            'Please contact us to discuss your buffet requirements and arrange delivery times.',
            style: AppConfig.bodySmall.copyWith(
              color: AppConfig.mediumGray,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

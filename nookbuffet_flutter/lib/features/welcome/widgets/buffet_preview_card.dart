/*
Buffet Preview Card Widget for Nook Buffet Flutter Application
Displays a preview of buffet options on the welcome screen
Features gradient styling and interactive tap functionality
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
import '../../../core/models/buffet_option.dart';

class BuffetPreviewCard extends StatelessWidget {
  final BuffetOption buffet;
  final VoidCallback? onTap;

  const BuffetPreviewCard({
    super.key,
    required this.buffet,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 280,
        child: GradientContainer.card(
          padding: const EdgeInsets.all(AppConfig.spacingM),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with name and popular badge
              _buildHeader(),
              
              const SizedBox(height: AppConfig.spacingS),
              
              // Price
              _buildPrice(),
              
              const SizedBox(height: AppConfig.spacingS),
              
              // Description
              _buildDescription(),
              
              const Spacer(),
              
              // Quick stats
              _buildQuickStats(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Buffet name
        Expanded(
          child: Text(
            buffet.name,
            style: AppConfig.headingSmall.copyWith(
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        
        // Popular badge
        if (buffet.isPopular)
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppConfig.spacingS,
              vertical: AppConfig.spacingXS,
            ),
            decoration: BoxDecoration(
              gradient: AppConfig.primaryGradient,
              borderRadius: BorderRadius.circular(AppConfig.radiusS),
            ),
            child: Text(
              'POPULAR',
              style: AppConfig.bodySmall.copyWith(
                color: AppConfig.primaryWhite,
                fontWeight: FontWeight.bold,
                fontSize: 10,
                letterSpacing: 0.5,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPrice() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConfig.spacingM,
        vertical: AppConfig.spacingS,
      ),
      decoration: BoxDecoration(
        color: AppConfig.lightGray,
        borderRadius: BorderRadius.circular(AppConfig.radiusS),
      ),
      child: Text(
        buffet.formattedPrice,
        style: AppConfig.bodyLarge.copyWith(
          fontWeight: FontWeight.bold,
          color: AppConfig.primaryBlack,
        ),
      ),
    );
  }

  Widget _buildDescription() {
    return Text(
      buffet.description,
      style: AppConfig.bodyMedium.copyWith(
        color: AppConfig.mediumGray,
        height: 1.4,
      ),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildQuickStats() {
    return Row(
      children: [
        // Total items count
        _buildStatItem(
          icon: Icons.restaurant_menu,
          value: '${buffet.totalItems}',
          label: 'Items',
        ),
        
        const SizedBox(width: AppConfig.spacingM),
        
        // Dietary options
        if (buffet.hasVegetarianOptions)
          _buildStatItem(
            icon: Icons.eco,
            value: 'V',
            label: 'Veggie',
          ),
        
        const Spacer(),
        
        // View more indicator
        Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: AppConfig.mediumGray,
        ),
      ],
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String value,
    required String label,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 16,
          color: AppConfig.mediumGray,
        ),
        const SizedBox(width: AppConfig.spacingXS),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: AppConfig.bodySmall.copyWith(
                fontWeight: FontWeight.bold,
                color: AppConfig.primaryBlack,
              ),
            ),
            Text(
              label,
              style: AppConfig.bodySmall.copyWith(
                color: AppConfig.mediumGray,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/*
Buffet Option Card Widget for Nook Buffet Flutter Application
Displays detailed buffet information in an attractive card format
Features gradient styling and interactive elements
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
import '../../../core/models/buffet_option.dart';

class BuffetOptionCard extends StatelessWidget {
  final BuffetOption buffet;
  final VoidCallback? onTap;

  const BuffetOptionCard({
    super.key,
    required this.buffet,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: GradientContainer.card(
        padding: const EdgeInsets.all(AppConfig.spacingL),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with name, price, and popular badge
            _buildHeader(),
            
            const SizedBox(height: AppConfig.spacingM),
            
            // Description
            _buildDescription(),
            
            const SizedBox(height: AppConfig.spacingM),
            
            // Items preview
            _buildItemsPreview(),
            
            const SizedBox(height: AppConfig.spacingM),
            
            // Footer with stats and action
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Name and popular badge
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      buffet.name,
                      style: AppConfig.headingMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  if (buffet.isPopular) ...[
                    const SizedBox(width: AppConfig.spacingS),
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
                ],
              ),
            ],
          ),
        ),
        
        // Price
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppConfig.spacingM,
            vertical: AppConfig.spacingS,
          ),
          decoration: BoxDecoration(
            color: AppConfig.primaryBlack,
            borderRadius: BorderRadius.circular(AppConfig.radiusM),
          ),
          child: Text(
            buffet.formattedPrice,
            style: AppConfig.bodyLarge.copyWith(
              color: AppConfig.primaryWhite,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDescription() {
    return Text(
      buffet.description,
      style: AppConfig.bodyLarge.copyWith(
        color: AppConfig.mediumGray,
        height: 1.5,
      ),
    );
  }

  Widget _buildItemsPreview() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Includes:',
          style: AppConfig.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        
        const SizedBox(height: AppConfig.spacingS),
        
        // Sandwiches preview
        if (buffet.sandwiches.isNotEmpty) ...[
          _buildItemCategory('Sandwiches', buffet.sandwiches.take(3).toList()),
          const SizedBox(height: AppConfig.spacingS),
        ],
        
        // Sides preview
        if (buffet.sides.isNotEmpty) ...[
          _buildItemCategory('Sides', buffet.sides.take(3).toList()),
        ],
      ],
    );
  }

  Widget _buildItemCategory(String category, List<BuffetItem> items) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Category label
        SizedBox(
          width: 80,
          child: Text(
            category,
            style: AppConfig.bodySmall.copyWith(
              fontWeight: FontWeight.w600,
              color: AppConfig.mediumGray,
            ),
          ),
        ),
        
        // Items list
        Expanded(
          child: Wrap(
            spacing: AppConfig.spacingXS,
            runSpacing: AppConfig.spacingXS,
            children: [
              ...items.map((item) => _buildItemChip(item)),
              if (items.length < (category == 'Sandwiches' ? buffet.sandwiches.length : buffet.sides.length))
                _buildMoreItemsChip(category == 'Sandwiches' 
                    ? buffet.sandwiches.length - items.length
                    : buffet.sides.length - items.length),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildItemChip(BuffetItem item) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConfig.spacingS,
        vertical: AppConfig.spacingXS,
      ),
      decoration: BoxDecoration(
        color: AppConfig.lightGray,
        borderRadius: BorderRadius.circular(AppConfig.radiusS),
        border: Border.all(
          color: item.isVegetarian || item.isVegan 
              ? Colors.green.withOpacity(0.3)
              : AppConfig.mediumGray.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            item.name,
            style: AppConfig.bodySmall.copyWith(
              fontSize: 11,
            ),
          ),
          if (item.isVegetarian || item.isVegan) ...[
            const SizedBox(width: AppConfig.spacingXS),
            Icon(
              Icons.eco,
              size: 12,
              color: Colors.green,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMoreItemsChip(int count) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConfig.spacingS,
        vertical: AppConfig.spacingXS,
      ),
      decoration: BoxDecoration(
        color: AppConfig.mediumGray.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConfig.radiusS),
        border: Border.all(
          color: AppConfig.mediumGray.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        '+$count more',
        style: AppConfig.bodySmall.copyWith(
          fontSize: 11,
          color: AppConfig.mediumGray,
          fontStyle: FontStyle.italic,
        ),
      ),
    );
  }

  Widget _buildFooter() {
    return Column(
      children: [
        // Stats row
        Row(
          children: [
            _buildStatItem(Icons.restaurant_menu, '${buffet.totalItems} items'),

            const SizedBox(width: AppConfig.spacingS),

            if (buffet.hasVegetarianOptions)
              Flexible(
                child: _buildStatItem(Icons.eco, 'Veggie options'),
              ),
          ],
        ),

        const SizedBox(height: AppConfig.spacingS),

        // Action indicator row
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Text(
              'View Details',
              style: AppConfig.bodyMedium.copyWith(
                color: AppConfig.primaryBlack,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: AppConfig.spacingXS),
            Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: AppConfig.primaryBlack,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatItem(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 16,
          color: AppConfig.mediumGray,
        ),
        const SizedBox(width: AppConfig.spacingXS),
        Text(
          text,
          style: AppConfig.bodySmall.copyWith(
            color: AppConfig.mediumGray,
          ),
        ),
      ],
    );
  }
}

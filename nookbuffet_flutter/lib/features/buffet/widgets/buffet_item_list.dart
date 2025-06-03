/*
Buffet Item List Widget for Nook Buffet Flutter Application
Displays a categorized list of buffet items with dietary indicators
Features clean layout and visual hierarchy
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
import '../../../core/models/buffet_option.dart';

class BuffetItemList extends StatelessWidget {
  final String title;
  final List<BuffetItem> items;
  final IconData icon;

  const BuffetItemList({
    super.key,
    required this.title,
    required this.items,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return GradientContainer.card(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section header
          _buildHeader(),
          
          const SizedBox(height: AppConfig.spacingM),
          
          // Items list
          _buildItemsList(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        // Icon
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            gradient: AppConfig.primaryGradient,
            borderRadius: BorderRadius.circular(AppConfig.radiusS),
          ),
          child: Icon(
            icon,
            color: AppConfig.primaryWhite,
            size: 18,
          ),
        ),
        
        const SizedBox(width: AppConfig.spacingS),
        
        // Title
        Expanded(
          child: Text(
            title,
            style: AppConfig.headingSmall.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        
        // Item count
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppConfig.spacingS,
            vertical: AppConfig.spacingXS,
          ),
          decoration: BoxDecoration(
            color: AppConfig.lightGray,
            borderRadius: BorderRadius.circular(AppConfig.radiusS),
          ),
          child: Text(
            '${items.length}',
            style: AppConfig.bodySmall.copyWith(
              fontWeight: FontWeight.bold,
              color: AppConfig.primaryBlack,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildItemsList() {
    return Column(
      children: items.asMap().entries.map((entry) {
        final index = entry.key;
        final item = entry.value;
        
        return Column(
          children: [
            _buildItemTile(item),
            if (index < items.length - 1)
              const Divider(
                height: AppConfig.spacingM,
                thickness: 1,
                color: AppConfig.lightGray,
              ),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildItemTile(BuffetItem item) {
    return Row(
      children: [
        // Item name
        Expanded(
          child: Text(
            item.name,
            style: AppConfig.bodyMedium.copyWith(
              height: 1.4,
            ),
          ),
        ),
        
        // Dietary indicators
        if (item.isVegan || item.isVegetarian) ...[
          const SizedBox(width: AppConfig.spacingS),
          _buildDietaryIndicator(item),
        ],
      ],
    );
  }

  Widget _buildDietaryIndicator(BuffetItem item) {
    Color indicatorColor;
    String indicatorText;
    IconData indicatorIcon;
    
    if (item.isVegan) {
      indicatorColor = Colors.green.shade700;
      indicatorText = 'Vegan';
      indicatorIcon = Icons.local_florist;
    } else if (item.isVegetarian) {
      indicatorColor = Colors.green.shade500;
      indicatorText = 'Vegetarian';
      indicatorIcon = Icons.eco;
    } else {
      return const SizedBox.shrink();
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConfig.spacingS,
        vertical: AppConfig.spacingXS,
      ),
      decoration: BoxDecoration(
        color: indicatorColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConfig.radiusS),
        border: Border.all(
          color: indicatorColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            indicatorIcon,
            size: 12,
            color: indicatorColor,
          ),
          const SizedBox(width: AppConfig.spacingXS),
          Text(
            indicatorText,
            style: AppConfig.bodySmall.copyWith(
              color: indicatorColor,
              fontWeight: FontWeight.w500,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }
}

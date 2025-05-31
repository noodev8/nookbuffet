/*
Buffet Card Widget for displaying buffet options
Shows buffet information in an attractive card format
Includes pricing, description, and selection functionality
*/

import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../models/buffet_option.dart';
import 'custom_button.dart';

class BuffetCard extends StatelessWidget {
  final BuffetOption buffet;
  final VoidCallback? onTap;
  final VoidCallback? onSelect;
  final bool isSelected;
  final bool showSelectButton;

  const BuffetCard({
    super.key,
    required this.buffet,
    this.onTap,
    this.onSelect,
    this.isSelected = false,
    this.showSelectButton = true,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: isSelected ? AppConfig.elevationHigh : AppConfig.elevationLow,
      margin: const EdgeInsets.symmetric(
        horizontal: AppConfig.spacingMedium,
        vertical: AppConfig.spacingSmall,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConfig.borderRadiusMedium),
        side: isSelected
            ? const BorderSide(color: AppConfig.primaryColor, width: 2)
            : BorderSide.none,
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppConfig.borderRadiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(AppConfig.spacingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with name, price, and popular badge
              _buildHeader(),
              
              const SizedBox(height: AppConfig.spacingSmall),
              
              // Description
              Text(
                buffet.description,
                style: AppConfig.bodyMedium.copyWith(
                  color: AppConfig.textSecondaryColor,
                ),
              ),
              
              const SizedBox(height: AppConfig.spacingMedium),
              
              // Items preview
              _buildItemsPreview(),
              
              const SizedBox(height: AppConfig.spacingMedium),
              
              // Dietary options
              if (buffet.dietaryOptions.isNotEmpty) _buildDietaryOptions(),
              
              const SizedBox(height: AppConfig.spacingMedium),
              
              // Action buttons
              if (showSelectButton) _buildActionButtons(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        // Buffet name and popular badge
        Expanded(
          flex: 3,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Buffet name
              Text(
                buffet.name,
                style: AppConfig.headingSmall,
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
              // Popular badge on separate line if needed
              if (buffet.isPopular)
                Padding(
                  padding: const EdgeInsets.only(top: AppConfig.spacingXSmall),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppConfig.spacingSmall,
                      vertical: AppConfig.spacingXSmall,
                    ),
                    decoration: BoxDecoration(
                      color: AppConfig.secondaryColor,
                      borderRadius: BorderRadius.circular(AppConfig.borderRadiusSmall),
                    ),
                    child: const Text(
                      'POPULAR',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        
        // Price
        Expanded(
          flex: 2,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                buffet.formattedPrice,
                style: AppConfig.headingSmall.copyWith(
                  color: AppConfig.primaryColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 16, // Slightly smaller to prevent overflow
                ),
                textAlign: TextAlign.end,
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
              Text(
                '${buffet.totalItems} items',
                style: AppConfig.captionText,
                textAlign: TextAlign.end,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildItemsPreview() {
    // Show first few items as preview
    final previewItems = [
      ...buffet.sandwiches.take(2),
      ...buffet.sides.take(2),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Includes:',
          style: AppConfig.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppConfig.spacingXSmall),
        ...previewItems.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 2),
          child: Row(
            children: [
              const Icon(
                Icons.check_circle_outline,
                size: 16,
                color: AppConfig.successColor,
              ),
              const SizedBox(width: AppConfig.spacingSmall),
              Expanded(
                child: Text(
                  item,
                  style: AppConfig.bodySmall,
                ),
              ),
            ],
          ),
        )),
        if (buffet.totalItems > 4)
          Padding(
            padding: const EdgeInsets.only(top: AppConfig.spacingXSmall),
            child: Text(
              '+ ${buffet.totalItems - 4} more items',
              style: AppConfig.bodySmall.copyWith(
                color: AppConfig.primaryColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildDietaryOptions() {
    return Wrap(
      spacing: AppConfig.spacingSmall,
      children: buffet.dietaryOptions.map((option) => Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppConfig.spacingSmall,
          vertical: AppConfig.spacingXSmall,
        ),
        decoration: BoxDecoration(
          color: AppConfig.primaryLightColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(AppConfig.borderRadiusSmall),
          border: Border.all(
            color: AppConfig.primaryLightColor.withOpacity(0.3),
          ),
        ),
        child: Text(
          option,
          style: AppConfig.bodySmall.copyWith(
            color: AppConfig.primaryDarkColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: CustomButton(
            text: 'View Details',
            onPressed: onTap,
            type: ButtonType.outline,
          ),
        ),
        const SizedBox(width: AppConfig.spacingMedium),
        Expanded(
          child: CustomButton(
            text: isSelected ? 'Selected' : 'Select',
            onPressed: isSelected ? null : onSelect,
            type: isSelected ? ButtonType.secondary : ButtonType.primary,
            icon: isSelected ? Icons.check : null,
          ),
        ),
      ],
    );
  }
}

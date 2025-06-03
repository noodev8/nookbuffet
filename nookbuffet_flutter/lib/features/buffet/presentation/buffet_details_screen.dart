/*
Buffet Details Screen for Nook Buffet Flutter Application
Displays comprehensive information about a selected buffet option
Allows users to proceed to booking without login requirement
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/models/buffet_option.dart';
import '../../booking/presentation/booking_details_screen.dart';
import '../widgets/buffet_item_list.dart';

class BuffetDetailsScreen extends StatelessWidget {
  final BuffetOption buffet;

  const BuffetDetailsScreen({
    super.key,
    required this.buffet,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GradientContainer.light(
        width: double.infinity,
        height: double.infinity,
        child: SafeArea(
          child: Column(
            children: [
              // Custom app bar
              _buildAppBar(context),
              
              // Scrollable content
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Buffet header info
                      _buildBuffetHeader(),
                      
                      // Buffet items
                      _buildBuffetItems(),
                      
                      // Dietary information
                      _buildDietaryInfo(),
                      
                      // Pricing details
                      _buildPricingDetails(),
                      
                      // Bottom spacing for floating button
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      
      // Floating action button for booking
      floatingActionButton: _buildBookingButton(context),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return GradientContainer.primary(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Row(
        children: [
          // Back button
          IconButton(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(
              Icons.arrow_back_ios,
              color: AppConfig.primaryWhite,
            ),
          ),
          
          // Title
          Expanded(
            child: Text(
              buffet.name,
              style: AppConfig.headingMedium.copyWith(
                color: AppConfig.primaryWhite,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          
          // Popular badge or placeholder
          SizedBox(
            width: 48,
            child: buffet.isPopular
                ? Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppConfig.spacingXS,
                      vertical: AppConfig.spacingXS,
                    ),
                    decoration: BoxDecoration(
                      color: AppConfig.primaryWhite,
                      borderRadius: BorderRadius.circular(AppConfig.radiusS),
                    ),
                    child: Text(
                      'HOT',
                      style: AppConfig.bodySmall.copyWith(
                        color: AppConfig.primaryBlack,
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  )
                : null,
          ),
        ],
      ),
    );
  }

  Widget _buildBuffetHeader() {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingM),
      child: GradientContainer.card(
        padding: const EdgeInsets.all(AppConfig.spacingL),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Name and price row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    buffet.name,
                    style: AppConfig.headingLarge.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppConfig.spacingM,
                    vertical: AppConfig.spacingS,
                  ),
                  decoration: BoxDecoration(
                    gradient: AppConfig.primaryGradient,
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
            ),
            
            const SizedBox(height: AppConfig.spacingM),
            
            // Description
            Text(
              buffet.description,
              style: AppConfig.bodyLarge.copyWith(
                color: AppConfig.mediumGray,
                height: 1.5,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingM),
            
            // Quick stats
            Row(
              children: [
                _buildStatChip(
                  icon: Icons.restaurant_menu,
                  label: '${buffet.totalItems} Items',
                ),
                const SizedBox(width: AppConfig.spacingS),
                if (buffet.hasVegetarianOptions)
                  _buildStatChip(
                    icon: Icons.eco,
                    label: 'Vegetarian Options',
                    color: Colors.green,
                  ),
                if (buffet.hasVeganOptions) ...[
                  const SizedBox(width: AppConfig.spacingS),
                  _buildStatChip(
                    icon: Icons.local_florist,
                    label: 'Vegan Options',
                    color: Colors.green,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip({
    required IconData icon,
    required String label,
    Color? color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConfig.spacingS,
        vertical: AppConfig.spacingXS,
      ),
      decoration: BoxDecoration(
        color: (color ?? AppConfig.mediumGray).withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConfig.radiusS),
        border: Border.all(
          color: (color ?? AppConfig.mediumGray).withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: color ?? AppConfig.mediumGray,
          ),
          const SizedBox(width: AppConfig.spacingXS),
          Text(
            label,
            style: AppConfig.bodySmall.copyWith(
              color: color ?? AppConfig.mediumGray,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBuffetItems() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppConfig.spacingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'What\'s Included',
            style: AppConfig.headingMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          
          const SizedBox(height: AppConfig.spacingM),
          
          // Sandwiches section
          if (buffet.sandwiches.isNotEmpty)
            BuffetItemList(
              title: 'Sandwiches',
              items: buffet.sandwiches,
              icon: Icons.lunch_dining,
            ),
          
          const SizedBox(height: AppConfig.spacingM),
          
          // Sides section
          if (buffet.sides.isNotEmpty)
            BuffetItemList(
              title: 'Sides & Extras',
              items: buffet.sides,
              icon: Icons.restaurant,
            ),
        ],
      ),
    );
  }

  Widget _buildDietaryInfo() {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingM),
      child: GradientContainer.card(
        padding: const EdgeInsets.all(AppConfig.spacingM),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.info_outline,
                  color: AppConfig.mediumGray,
                  size: 20,
                ),
                const SizedBox(width: AppConfig.spacingS),
                Text(
                  'Dietary Information',
                  style: AppConfig.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: AppConfig.spacingS),
            
            Text(
              'We can accommodate special dietary requirements. Please mention any allergies or preferences when booking.',
              style: AppConfig.bodySmall.copyWith(
                color: AppConfig.mediumGray,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPricingDetails() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppConfig.spacingM),
      child: GradientContainer.card(
        padding: const EdgeInsets.all(AppConfig.spacingM),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pricing Details',
              style: AppConfig.bodyMedium.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingS),
            
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Price per person:',
                  style: AppConfig.bodyMedium,
                ),
                Text(
                  buffet.formattedPrice,
                  style: AppConfig.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: AppConfig.spacingXS),
            
            Text(
              'Final price will be calculated based on number of guests',
              style: AppConfig.bodySmall.copyWith(
                color: AppConfig.mediumGray,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingButton(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: AppConfig.spacingM),
      child: CustomButton.primary(
        text: 'Book This Buffet',
        onPressed: () => _navigateToBooking(context),
        icon: Icons.calendar_today,
        padding: const EdgeInsets.symmetric(
          horizontal: AppConfig.spacingL,
          vertical: AppConfig.spacingM,
        ),
      ),
    );
  }

  void _navigateToBooking(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => BookingDetailsScreen(buffet: buffet),
      ),
    );
  }
}

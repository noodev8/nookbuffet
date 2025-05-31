/*
Buffet Details Screen for Nook Buffet App
Shows detailed information about a selected buffet option
Includes full menu items, pricing, and booking functionality
*/

import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../models/buffet_option.dart';
import '../widgets/custom_button.dart';
import 'booking_screen.dart';

class BuffetDetailsScreen extends StatefulWidget {
  final BuffetOption buffet;

  const BuffetDetailsScreen({
    super.key,
    required this.buffet,
  });

  @override
  State<BuffetDetailsScreen> createState() => _BuffetDetailsScreenState();
}

class _BuffetDetailsScreenState extends State<BuffetDetailsScreen> {
  bool showVegetarianOnly = false;

  void _proceedToBooking() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BookingScreen(buffet: widget.buffet),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConfig.backgroundColor,
      appBar: AppBar(
        title: Text(widget.buffet.name),
        backgroundColor: AppConfig.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Buffet header
          _buildBuffetHeader(),
          
          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppConfig.spacingMedium),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Description
                  _buildDescription(),
                  
                  const SizedBox(height: AppConfig.spacingLarge),
                  
                  // Dietary filter
                  if (widget.buffet.hasVegetarianOptions) _buildDietaryFilter(),
                  
                  const SizedBox(height: AppConfig.spacingMedium),
                  
                  // Menu sections
                  _buildMenuSection('Sandwiches', widget.buffet.sandwiches),
                  
                  const SizedBox(height: AppConfig.spacingLarge),
                  
                  _buildMenuSection('Sides & Extras', widget.buffet.sides),
                  
                  const SizedBox(height: AppConfig.spacingLarge),
                  
                  // Dietary options
                  if (widget.buffet.dietaryOptions.isNotEmpty)
                    _buildDietaryOptionsSection(),
                  
                  const SizedBox(height: AppConfig.spacingXXLarge),
                ],
              ),
            ),
          ),
          
          // Bottom booking bar
          _buildBottomBookingBar(),
        ],
      ),
    );
  }

  Widget _buildBuffetHeader() {
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
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.buffet.formattedPrice,
                        style: AppConfig.headingLarge.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${widget.buffet.totalItems} delicious items',
                        style: AppConfig.bodyMedium.copyWith(
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                    ],
                  ),
                ),
                if (widget.buffet.isPopular)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppConfig.spacingMedium,
                      vertical: AppConfig.spacingSmall,
                    ),
                    decoration: BoxDecoration(
                      color: AppConfig.secondaryColor,
                      borderRadius: BorderRadius.circular(AppConfig.borderRadiusLarge),
                    ),
                    child: const Text(
                      'MOST POPULAR',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDescription() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'About This Buffet',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingSmall),
            Text(
              widget.buffet.description,
              style: AppConfig.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDietaryFilter() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Row(
          children: [
            const Icon(
              Icons.filter_list,
              color: AppConfig.primaryColor,
            ),
            const SizedBox(width: AppConfig.spacingSmall),
            const Text(
              'Show vegetarian items only',
              style: AppConfig.bodyMedium,
            ),
            const Spacer(),
            Switch(
              value: showVegetarianOnly,
              onChanged: (value) {
                setState(() {
                  showVegetarianOnly = value;
                });
              },
              activeColor: AppConfig.primaryColor,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuSection(String title, List<String> items) {
    List<String> displayItems = items;
    
    if (showVegetarianOnly) {
      displayItems = items.where((item) => item.contains('(V)')).toList();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            ...displayItems.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: AppConfig.spacingSmall),
              child: Row(
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 18,
                    color: item.contains('(V)') 
                        ? AppConfig.successColor 
                        : AppConfig.primaryColor,
                  ),
                  const SizedBox(width: AppConfig.spacingSmall),
                  Expanded(
                    child: Text(
                      item,
                      style: AppConfig.bodyMedium,
                    ),
                  ),
                  if (item.contains('(V)'))
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppConfig.spacingSmall,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppConfig.successColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AppConfig.borderRadiusSmall),
                        border: Border.all(
                          color: AppConfig.successColor.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        'V',
                        style: AppConfig.bodySmall.copyWith(
                          color: AppConfig.successColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
            )),
            if (displayItems.isEmpty && showVegetarianOnly)
              Text(
                'No vegetarian options in this section',
                style: AppConfig.bodyMedium.copyWith(
                  color: AppConfig.textSecondaryColor,
                  fontStyle: FontStyle.italic,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDietaryOptionsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dietary Information',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            Wrap(
              spacing: AppConfig.spacingSmall,
              runSpacing: AppConfig.spacingSmall,
              children: widget.buffet.dietaryOptions.map((option) => Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppConfig.spacingMedium,
                  vertical: AppConfig.spacingSmall,
                ),
                decoration: BoxDecoration(
                  color: AppConfig.primaryLightColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppConfig.borderRadiusLarge),
                  border: Border.all(
                    color: AppConfig.primaryLightColor.withOpacity(0.3),
                  ),
                ),
                child: Text(
                  option,
                  style: AppConfig.bodyMedium.copyWith(
                    color: AppConfig.primaryDarkColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              )).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBookingBar() {
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
        child: CustomButton(
          text: 'Book This Buffet',
          onPressed: _proceedToBooking,
          isFullWidth: true,
          icon: Icons.calendar_today,
        ),
      ),
    );
  }
}

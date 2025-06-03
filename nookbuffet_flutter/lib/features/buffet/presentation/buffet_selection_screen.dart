/*
Buffet Selection Screen for Nook Buffet Flutter Application
Displays all available buffet options with detailed information
Allows users to select and proceed to booking without login requirement
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
import '../../../core/models/buffet_option.dart';
import '../widgets/buffet_option_card.dart';
import 'buffet_details_screen.dart';

class BuffetSelectionScreen extends StatefulWidget {
  const BuffetSelectionScreen({super.key});

  @override
  State<BuffetSelectionScreen> createState() => _BuffetSelectionScreenState();
}

class _BuffetSelectionScreenState extends State<BuffetSelectionScreen> {
  final List<BuffetOption> _buffets = BuffetData.allBuffets;
  String _selectedFilter = 'All';

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
              
              // Filter section
              _buildFilterSection(),
              
              // Buffet options list
              Expanded(
                child: _buildBuffetList(),
              ),
            ],
          ),
        ),
      ),
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
              'Choose Your Buffet',
              style: AppConfig.headingMedium.copyWith(
                color: AppConfig.primaryWhite,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          
          // Placeholder for symmetry
          const SizedBox(width: 48),
        ],
      ),
    );
  }

  Widget _buildFilterSection() {
    final filters = ['All', 'Popular', 'Vegetarian', 'Budget'];
    
    return Container(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Filter Options',
            style: AppConfig.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          
          const SizedBox(height: AppConfig.spacingS),
          
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: filters.length,
              itemBuilder: (context, index) {
                final filter = filters[index];
                final isSelected = _selectedFilter == filter;
                
                return Padding(
                  padding: EdgeInsets.only(
                    right: index < filters.length - 1 ? AppConfig.spacingS : 0,
                  ),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        _selectedFilter = filter;
                      });
                    },
                    backgroundColor: AppConfig.primaryWhite,
                    selectedColor: AppConfig.primaryBlack,
                    labelStyle: TextStyle(
                      color: isSelected ? AppConfig.primaryWhite : AppConfig.primaryBlack,
                      fontWeight: FontWeight.w500,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppConfig.radiusM),
                      side: BorderSide(
                        color: isSelected ? AppConfig.primaryBlack : AppConfig.mediumGray,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBuffetList() {
    final filteredBuffets = _getFilteredBuffets();
    
    if (filteredBuffets.isEmpty) {
      return _buildEmptyState();
    }
    
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: AppConfig.spacingM),
      itemCount: filteredBuffets.length,
      itemBuilder: (context, index) {
        final buffet = filteredBuffets[index];
        
        return Padding(
          padding: const EdgeInsets.only(bottom: AppConfig.spacingM),
          child: BuffetOptionCard(
            buffet: buffet,
            onTap: () => _navigateToBuffetDetails(buffet),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.restaurant_menu,
            size: 64,
            color: AppConfig.mediumGray,
          ),
          
          const SizedBox(height: AppConfig.spacingM),
          
          Text(
            'No buffets found',
            style: AppConfig.headingSmall.copyWith(
              color: AppConfig.mediumGray,
            ),
          ),
          
          const SizedBox(height: AppConfig.spacingS),
          
          Text(
            'Try adjusting your filter selection',
            style: AppConfig.bodyMedium.copyWith(
              color: AppConfig.mediumGray,
            ),
          ),
        ],
      ),
    );
  }

  List<BuffetOption> _getFilteredBuffets() {
    switch (_selectedFilter) {
      case 'Popular':
        return _buffets.where((buffet) => buffet.isPopular).toList();
      case 'Vegetarian':
        return _buffets.where((buffet) => buffet.hasVegetarianOptions).toList();
      case 'Budget':
        return _buffets.where((buffet) => buffet.pricePerHead <= 10.0).toList();
      default:
        return _buffets;
    }
  }

  void _navigateToBuffetDetails(BuffetOption buffet) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => BuffetDetailsScreen(buffet: buffet),
      ),
    );
  }
}

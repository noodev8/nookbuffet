/*
Order Confirmation Screen for Nook Buffet App
Shows booking confirmation details and status
Provides order summary and next steps for the customer
*/

import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../models/booking.dart';
import '../widgets/custom_button.dart';
import 'welcome_screen.dart';

class OrderConfirmationScreen extends StatelessWidget {
  final Booking booking;

  const OrderConfirmationScreen({
    super.key,
    required this.booking,
  });

  void _goBackToHome(BuildContext context) {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const WelcomeScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConfig.backgroundColor,
      appBar: AppBar(
        title: const Text('Booking Confirmed'),
        backgroundColor: AppConfig.successColor,
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Success header
            _buildSuccessHeader(),
            
            // Booking details
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppConfig.spacingMedium),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Booking reference
                    _buildBookingReference(),
                    
                    const SizedBox(height: AppConfig.spacingLarge),
                    
                    // Buffet details
                    _buildBuffetDetails(),
                    
                    const SizedBox(height: AppConfig.spacingLarge),
                    
                    // Date and time
                    _buildDateTimeDetails(),
                    
                    const SizedBox(height: AppConfig.spacingLarge),
                    
                    // Customer details
                    _buildCustomerDetails(),
                    
                    const SizedBox(height: AppConfig.spacingLarge),
                    
                    // Special requests
                    if (booking.specialRequests.isNotEmpty)
                      _buildSpecialRequests(),
                    
                    const SizedBox(height: AppConfig.spacingLarge),
                    
                    // Next steps
                    _buildNextSteps(),
                    
                    const SizedBox(height: AppConfig.spacingXXLarge),
                  ],
                ),
              ),
            ),
            
            // Bottom action bar
            _buildBottomActionBar(context),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessHeader() {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: AppConfig.successColor,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(AppConfig.borderRadiusLarge),
          bottomRight: Radius.circular(AppConfig.borderRadiusLarge),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingLarge),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check,
                size: 50,
                color: AppConfig.successColor,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingMedium),
            
            Text(
              'Booking Confirmed!',
              style: AppConfig.headingLarge.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingSmall),
            
            Text(
              'Your buffet booking has been received and is pending confirmation',
              style: AppConfig.bodyMedium.copyWith(
                color: Colors.white.withOpacity(0.9),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingReference() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Row(
          children: [
            const Icon(
              Icons.confirmation_number,
              color: AppConfig.primaryColor,
              size: 30,
            ),
            const SizedBox(width: AppConfig.spacingMedium),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Booking Reference',
                    style: AppConfig.bodyMedium.copyWith(
                      color: AppConfig.textSecondaryColor,
                    ),
                  ),
                  Text(
                    '#${booking.id}',
                    style: AppConfig.headingSmall.copyWith(
                      color: AppConfig.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBuffetDetails() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Buffet Details',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        booking.buffetName,
                        style: AppConfig.bodyLarge.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        '${booking.numberOfPeople} people',
                        style: AppConfig.bodyMedium.copyWith(
                          color: AppConfig.textSecondaryColor,
                        ),
                      ),
                      if (booking.dietaryPreference != DietaryPreference.none)
                        Text(
                          booking.dietaryPreferenceDisplayText,
                          style: AppConfig.bodySmall.copyWith(
                            color: AppConfig.primaryColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      booking.formattedTotalPrice,
                      style: AppConfig.headingMedium.copyWith(
                        color: AppConfig.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '£${booking.buffetPrice.toStringAsFixed(2)} per person',
                      style: AppConfig.bodySmall.copyWith(
                        color: AppConfig.textSecondaryColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateTimeDetails() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Date & Time',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            
            Row(
              children: [
                const Icon(
                  Icons.calendar_today,
                  color: AppConfig.primaryColor,
                ),
                const SizedBox(width: AppConfig.spacingMedium),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        booking.formattedBookingDate,
                        style: AppConfig.bodyLarge.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        booking.bookingTime,
                        style: AppConfig.bodyMedium.copyWith(
                          color: AppConfig.textSecondaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomerDetails() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Contact Details',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            
            _buildContactRow(Icons.person, 'Name', booking.customerName),
            const SizedBox(height: AppConfig.spacingSmall),
            _buildContactRow(Icons.email, 'Email', booking.customerEmail),
            const SizedBox(height: AppConfig.spacingSmall),
            _buildContactRow(Icons.phone, 'Phone', booking.customerPhone),
          ],
        ),
      ),
    );
  }

  Widget _buildContactRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(
          icon,
          color: AppConfig.primaryColor,
          size: 20,
        ),
        const SizedBox(width: AppConfig.spacingMedium),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppConfig.bodySmall.copyWith(
                  color: AppConfig.textSecondaryColor,
                ),
              ),
              Text(
                value,
                style: AppConfig.bodyMedium,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSpecialRequests() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Special Requests',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            Text(
              booking.specialRequests,
              style: AppConfig.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNextSteps() {
    return Card(
      color: AppConfig.primaryColor.withOpacity(0.05),
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.info_outline,
                  color: AppConfig.primaryColor,
                ),
                const SizedBox(width: AppConfig.spacingSmall),
                Text(
                  'What happens next?',
                  style: AppConfig.headingSmall.copyWith(
                    color: AppConfig.primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            
            _buildNextStepItem(
              '1.',
              'We\'ll review your booking and confirm availability',
            ),
            _buildNextStepItem(
              '2.',
              'You\'ll receive a confirmation email within 24 hours',
            ),
            _buildNextStepItem(
              '3.',
              'If you have any questions, call us at ${AppConfig.businessPhone}',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNextStepItem(String number, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppConfig.spacingSmall),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: const BoxDecoration(
              color: AppConfig.primaryColor,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: AppConfig.spacingMedium),
          Expanded(
            child: Text(
              text,
              style: AppConfig.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomActionBar(BuildContext context) {
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
          text: 'Back to Home',
          onPressed: () => _goBackToHome(context),
          isFullWidth: true,
          icon: Icons.home,
        ),
      ),
    );
  }
}

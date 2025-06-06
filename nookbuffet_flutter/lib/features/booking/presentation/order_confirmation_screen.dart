/*
Order Confirmation Screen for Nook Buffet Flutter Application
Elegant dark gradient design with booking confirmation details
Features success animation and streamlined user experience
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/models/booking.dart';
import '../../welcome/presentation/welcome_screen.dart';

class OrderConfirmationScreen extends StatefulWidget {
  final Booking booking;

  const OrderConfirmationScreen({
    super.key,
    required this.booking,
  });

  @override
  State<OrderConfirmationScreen> createState() => _OrderConfirmationScreenState();
}

class _OrderConfirmationScreenState extends State<OrderConfirmationScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    // Initialize success animation
    _animationController = AnimationController(
      duration: AppConfig.animationMedium,
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    // Start animation
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Elegant dark gradient background
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppConfig.dashboardGradient,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(AppConfig.spacingM),
              child: Column(
                children: [
                  const SizedBox(height: AppConfig.spacingXL),

                  // Success animation
                  _buildSuccessAnimation(),

                  const SizedBox(height: AppConfig.spacingXL),

                  // Confirmation message
                  _buildConfirmationMessage(),

                  const SizedBox(height: AppConfig.spacingL),

                  // Booking details
                  _buildBookingDetails(),

                  const SizedBox(height: AppConfig.spacingL),

                  // Next steps
                  _buildNextSteps(),

                  const SizedBox(height: AppConfig.spacingXL),

                  // Action buttons
                  _buildActionButtons(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessAnimation() {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return FadeTransition(
          opacity: _fadeAnimation,
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                gradient: AppConfig.primaryGradient,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppConfig.primaryBlack.withOpacity(0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(
                Icons.check,
                color: AppConfig.primaryWhite,
                size: 60,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildConfirmationMessage() {
    return AnimatedBuilder(
      animation: _fadeAnimation,
      builder: (context, child) {
        return Opacity(
          opacity: _fadeAnimation.value,
          child: Column(
            children: [
              Text(
                'Booking Confirmed!',
                style: AppConfig.headingLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppConfig.primaryWhite,
                  fontSize: 28,
                  shadows: [
                    Shadow(
                      color: AppConfig.primaryBlack.withValues(alpha: 0.8),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: AppConfig.spacingS),

              Text(
                'Your buffet order has been successfully submitted',
                style: AppConfig.bodyLarge.copyWith(
                  color: AppConfig.primaryWhite.withValues(alpha: 0.9),
                  fontSize: 16,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBookingDetails() {
    return Container(
      padding: const EdgeInsets.all(AppConfig.spacingL),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppConfig.primaryWhite.withValues(alpha: 0.15),
            AppConfig.primaryWhite.withValues(alpha: 0.08),
          ],
        ),
        borderRadius: BorderRadius.circular(AppConfig.radiusL),
        border: Border.all(
          color: AppConfig.primaryWhite.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Booking Details',
            style: AppConfig.headingSmall.copyWith(
              color: AppConfig.primaryWhite,
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),

          const SizedBox(height: AppConfig.spacingM),

          // Booking ID
          _buildDetailRow('Booking ID', widget.booking.id),

          // Buffet selection
          _buildDetailRow('Buffet', widget.booking.buffetOption.name),

          // Date and time
          _buildDetailRow('Date', widget.booking.formattedDate),
          _buildDetailRow('Time', widget.booking.formattedTime),

          // Number of guests
          _buildDetailRow('Guests', '${widget.booking.numberOfGuests} people'),

          // Dietary preference
          if (widget.booking.dietaryPreference != DietaryPreference.none)
            _buildDetailRow('Dietary', widget.booking.dietaryPreferenceText),

          // Special requirements
          if (widget.booking.specialRequirements != null)
            _buildDetailRow('Special Requirements', widget.booking.specialRequirements!),

          Divider(
            height: AppConfig.spacingL,
            color: AppConfig.primaryWhite.withValues(alpha: 0.3),
          ),

          // Total price
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Price',
                style: AppConfig.bodyLarge.copyWith(
                  color: AppConfig.primaryWhite,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppConfig.spacingM,
                  vertical: AppConfig.spacingS,
                ),
                decoration: BoxDecoration(
                  color: AppConfig.primaryWhite.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(AppConfig.radiusM),
                ),
                child: Text(
                  widget.booking.formattedTotalPrice,
                  style: AppConfig.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppConfig.primaryBlack,
                    fontSize: 18,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppConfig.spacingS),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: AppConfig.bodyMedium.copyWith(
                color: AppConfig.primaryWhite.withValues(alpha: 0.7),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppConfig.bodyMedium.copyWith(
                color: AppConfig.primaryWhite,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNextSteps() {
    return Container(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppConfig.primaryWhite.withValues(alpha: 0.1),
            AppConfig.primaryWhite.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(AppConfig.radiusL),
        border: Border.all(
          color: AppConfig.primaryWhite.withValues(alpha: 0.15),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                size: 20,
              ),
              const SizedBox(width: AppConfig.spacingS),
              Text(
                'What happens next?',
                style: AppConfig.bodyMedium.copyWith(
                  color: AppConfig.primaryWhite,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppConfig.spacingM),

          _buildNextStepItem(
            '1.',
            'We\'ll review your booking and confirm availability',
          ),

          _buildNextStepItem(
            '2.',
            'You\'ll receive a confirmation email with final details',
          ),

          _buildNextStepItem(
            '3.',
            'We\'ll prepare your delicious buffet for the scheduled time',
          ),

          const SizedBox(height: AppConfig.spacingM),

          Container(
            padding: const EdgeInsets.all(AppConfig.spacingS),
            decoration: BoxDecoration(
              color: AppConfig.primaryWhite.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppConfig.radiusS),
              border: Border.all(
                color: AppConfig.primaryWhite.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.phone,
                  size: 16,
                  color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                ),
                const SizedBox(width: AppConfig.spacingS),
                Expanded(
                  child: Text(
                    'Questions? Call us at ${AppConfig.businessPhone}',
                    style: AppConfig.bodySmall.copyWith(
                      color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNextStepItem(String number, String description) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppConfig.spacingS),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: AppConfig.primaryWhite.withValues(alpha: 0.9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                number,
                style: AppConfig.bodySmall.copyWith(
                  color: AppConfig.primaryBlack,
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
          ),
          const SizedBox(width: AppConfig.spacingS),
          Expanded(
            child: Text(
              description,
              style: AppConfig.bodyMedium.copyWith(
                color: AppConfig.primaryWhite.withValues(alpha: 0.9),
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        // Primary action - Back to home
        CustomButton.primary(
          text: 'Back to Home',
          onPressed: () => _navigateToHome(),
          width: double.infinity,
          icon: Icons.home,
        ),
        
        const SizedBox(height: AppConfig.spacingM),
        
        // Secondary action - Contact us
        CustomButton.outlined(
          text: 'Contact Us',
          onPressed: () => _showContactDialog(),
          width: double.infinity,
          icon: Icons.phone,
        ),
      ],
    );
  }

  void _navigateToHome() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const WelcomeScreen()),
      (route) => false,
    );
  }

  void _showContactDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Contact Information'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildContactItem(Icons.location_on, AppConfig.businessAddress),
            const SizedBox(height: AppConfig.spacingM),
            _buildContactItem(Icons.phone, AppConfig.businessPhone),
            const SizedBox(height: AppConfig.spacingM),
            _buildContactItem(Icons.email, AppConfig.businessEmail),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildContactItem(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppConfig.mediumGray),
        const SizedBox(width: AppConfig.spacingS),
        Expanded(
          child: Text(
            text,
            style: AppConfig.bodyMedium,
          ),
        ),
      ],
    );
  }
}

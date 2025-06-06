/*
Booking Details Screen for Nook Buffet Flutter Application
Elegant black gradient design with time slots and improved guest selection
Direct navigation from buffet details with streamlined user experience
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/models/buffet_option.dart';
import '../../../core/models/booking.dart';
import '../../auth/presentation/login_screen.dart';

class BookingDetailsScreen extends StatefulWidget {
  final BuffetOption buffet;
  final int guestCount;

  const BookingDetailsScreen({
    super.key,
    required this.buffet,
    required this.guestCount,
  });

  @override
  State<BookingDetailsScreen> createState() => _BookingDetailsScreenState();
}

class _BookingDetailsScreenState extends State<BookingDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _specialRequirementsController = TextEditingController();

  DateTime? _selectedDate;
  String? _selectedTimeSlot;
  DietaryPreference _dietaryPreference = DietaryPreference.none;

  // Time slots from 9am to 4pm in 30-minute intervals
  final List<String> _timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM'
  ];

  @override
  void dispose() {
    _specialRequirementsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Elegant black gradient background
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppConfig.dashboardGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Custom app bar
              _buildAppBar(context),

              // Scrollable form content
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      // Buffet summary
                      _buildBuffetSummary(),

                      // Booking form
                      _buildBookingForm(),

                      // Bottom spacing
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),

      // Floating action button for confirmation
      floatingActionButton: _buildConfirmButton(context),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppConfig.primaryBlack.withValues(alpha: 0.9),
            AppConfig.primaryBlack.withValues(alpha: 0.7),
            Colors.transparent,
          ],
        ),
      ),
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
              'Choose Your Options',
              style: AppConfig.headingMedium.copyWith(
                color: AppConfig.primaryWhite,
                fontWeight: FontWeight.w400,
                fontSize: 20,
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
          ),

          // Placeholder for symmetry
          const SizedBox(width: 48),
        ],
      ),
    );
  }

  Widget _buildBuffetSummary() {
    final totalPrice = widget.buffet.pricePerHead * widget.guestCount;

    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingM),
      padding: const EdgeInsets.all(AppConfig.spacingM),
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
          // Buffet name and price per head
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.buffet.name,
                      style: AppConfig.headingSmall.copyWith(
                        color: AppConfig.primaryWhite,
                        fontWeight: FontWeight.w500,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: AppConfig.spacingXS),
                    Text(
                      widget.buffet.formattedPrice,
                      style: AppConfig.bodyMedium.copyWith(
                        color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: AppConfig.spacingM),

          // Guest count and total cost
          Container(
            padding: const EdgeInsets.all(AppConfig.spacingM),
            decoration: BoxDecoration(
              color: AppConfig.primaryWhite.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppConfig.radiusM),
              border: Border.all(
                color: AppConfig.primaryWhite.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Guests',
                      style: AppConfig.bodySmall.copyWith(
                        color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      widget.guestCount == 1 ? '1 Guest' : '${widget.guestCount} Guests',
                      style: AppConfig.bodyMedium.copyWith(
                        color: AppConfig.primaryWhite,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Total Cost',
                      style: AppConfig.bodySmall.copyWith(
                        color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      '£${totalPrice.toStringAsFixed(2)}',
                      style: AppConfig.bodyLarge.copyWith(
                        color: AppConfig.primaryWhite,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingForm() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppConfig.spacingM),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date and time section
            _buildDateTimeSection(),
            
            const SizedBox(height: AppConfig.spacingM),
            
            // Guest count display (read-only)
            _buildGuestCountDisplay(),
            
            const SizedBox(height: AppConfig.spacingM),
            
            // Dietary preferences
            _buildDietarySection(),
            
            const SizedBox(height: AppConfig.spacingM),
            
            // Special requirements
            _buildSpecialRequirementsSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildDateTimeSection() {
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
          Text(
            'When do you need the buffet?',
            style: AppConfig.bodyMedium.copyWith(
              color: AppConfig.primaryWhite,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: AppConfig.spacingM),

          // Date picker
          ListTile(
            leading: Icon(
              Icons.calendar_today,
              color: AppConfig.primaryWhite.withValues(alpha: 0.8),
            ),
            title: Text(
              _selectedDate != null
                  ? _formatSelectedDate(_selectedDate!)
                  : 'Select Date',
              style: TextStyle(
                color: AppConfig.primaryWhite,
              ),
            ),
            subtitle: Text(
              'Choose your preferred date',
              style: TextStyle(
                color: AppConfig.primaryWhite.withValues(alpha: 0.7),
              ),
            ),
            onTap: _selectDate,
            contentPadding: EdgeInsets.zero,
          ),

          const SizedBox(height: AppConfig.spacingM),

          // Time slots section
          Text(
            'Available Time Slots',
            style: AppConfig.bodyMedium.copyWith(
              color: AppConfig.primaryWhite,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: AppConfig.spacingS),

          // Time slot grid - properly aligned
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              childAspectRatio: 2.5,
              crossAxisSpacing: AppConfig.spacingS,
              mainAxisSpacing: AppConfig.spacingS,
            ),
            itemCount: _timeSlots.length,
            itemBuilder: (context, index) {
              final timeSlot = _timeSlots[index];
              final isSelected = _selectedTimeSlot == timeSlot;
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedTimeSlot = timeSlot;
                  });
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppConfig.primaryWhite.withValues(alpha: 0.9)
                        : AppConfig.primaryWhite.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppConfig.radiusM),
                    border: Border.all(
                      color: isSelected
                          ? AppConfig.primaryWhite
                          : AppConfig.primaryWhite.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      timeSlot,
                      style: AppConfig.bodySmall.copyWith(
                        color: isSelected
                            ? AppConfig.primaryBlack
                            : AppConfig.primaryWhite,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                        fontSize: 13,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildGuestCountDisplay() {
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
      child: Row(
        children: [
          Icon(
            Icons.people,
            color: AppConfig.primaryWhite.withValues(alpha: 0.8),
            size: 24,
          ),
          const SizedBox(width: AppConfig.spacingM),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Number of Guests',
                  style: AppConfig.bodyMedium.copyWith(
                    color: AppConfig.primaryWhite,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppConfig.spacingXS),
                Text(
                  widget.guestCount == 1 ? '1 Guest' : '${widget.guestCount} Guests',
                  style: AppConfig.bodyMedium.copyWith(
                    color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                  ),
                ),
              ],
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
              '${widget.guestCount}',
              style: AppConfig.bodyLarge.copyWith(
                color: AppConfig.primaryBlack,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDietarySection() {
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
          Text(
            'Dietary Preferences',
            style: AppConfig.bodyMedium.copyWith(
              color: AppConfig.primaryWhite,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: AppConfig.spacingM),

          ...DietaryPreference.values.map((preference) {
            return RadioListTile<DietaryPreference>(
              title: Text(
                _getDietaryPreferenceText(preference),
                style: TextStyle(
                  color: AppConfig.primaryWhite,
                ),
              ),
              value: preference,
              groupValue: _dietaryPreference,
              onChanged: (value) {
                setState(() {
                  _dietaryPreference = value!;
                });
              },
              contentPadding: EdgeInsets.zero,
              activeColor: AppConfig.primaryWhite,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSpecialRequirementsSection() {
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
          Text(
            'Special Requirements',
            style: AppConfig.bodyMedium.copyWith(
              color: AppConfig.primaryWhite,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: AppConfig.spacingM),

          TextFormField(
            controller: _specialRequirementsController,
            maxLines: 3,
            style: TextStyle(
              color: AppConfig.primaryWhite,
            ),
            decoration: InputDecoration(
              labelText: 'Any special requests or allergies?',
              hintText: 'e.g., No nuts, extra vegetarian options, etc.',
              alignLabelWithHint: true,
              labelStyle: TextStyle(
                color: AppConfig.primaryWhite.withValues(alpha: 0.8),
              ),
              hintStyle: TextStyle(
                color: AppConfig.primaryWhite.withValues(alpha: 0.6),
              ),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(
                  color: AppConfig.primaryWhite.withValues(alpha: 0.3),
                ),
                borderRadius: BorderRadius.circular(AppConfig.radiusM),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: BorderSide(
                  color: AppConfig.primaryWhite,
                ),
                borderRadius: BorderRadius.circular(AppConfig.radiusM),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConfirmButton(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: AppConfig.spacingM),
      child: CustomButton.primary(
        text: 'Confirm Booking',
        onPressed: _handleBooking,
        icon: Icons.check_circle,
        padding: const EdgeInsets.symmetric(
          horizontal: AppConfig.spacingL,
          vertical: AppConfig.spacingM,
        ),
      ),
    );
  }

  String _getDietaryPreferenceText(DietaryPreference preference) {
    switch (preference) {
      case DietaryPreference.none:
        return 'No specific requirements';
      case DietaryPreference.vegetarian:
        return 'Vegetarian';
      case DietaryPreference.vegan:
        return 'Vegan';
      case DietaryPreference.mixed:
        return 'Mixed (Vegetarian & Non-Vegetarian)';
    }
  }

  String _formatSelectedDate(DateTime date) {
    // Get day of week
    const dayNames = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday'
    ];

    // Get month name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    final dayName = dayNames[date.weekday - 1]; // weekday is 1-7, array is 0-6
    final monthName = monthNames[date.month - 1]; // month is 1-12, array is 0-11

    // Format: "Monday, 15 January 2024"
    return '$dayName, ${date.day} $monthName ${date.year}';
  }

  void _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    
    if (date != null) {
      setState(() {
        _selectedDate = date;
      });
    }
  }

  void _handleBooking() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedDate == null) {
      _showErrorDialog('Please select a date for your booking.');
      return;
    }

    if (_selectedTimeSlot == null) {
      _showErrorDialog('Please select a time slot for your booking.');
      return;
    }

    // Show login requirement dialog
    _showLoginRequiredDialog();
  }

  void _showLoginRequiredDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Login Required'),
        content: const Text(
          'To complete your booking, please login or create an account. This helps us confirm your identity and send you booking updates.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              _navigateToLogin();
            },
            child: const Text('Login'),
          ),
        ],
      ),
    );
  }

  void _navigateToLogin() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const LoginScreen(),
      ),
    );
  }





  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Missing Information'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}

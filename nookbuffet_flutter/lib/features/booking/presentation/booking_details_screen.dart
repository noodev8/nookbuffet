/*
Booking Details Screen for Nook Buffet Flutter Application
Allows users to specify booking details including date, time, and special requirements
Features form validation and smooth user experience
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/models/buffet_option.dart';
import '../../../core/models/booking.dart';
import 'order_confirmation_screen.dart';

class BookingDetailsScreen extends StatefulWidget {
  final BuffetOption buffet;

  const BookingDetailsScreen({
    super.key,
    required this.buffet,
  });

  @override
  State<BookingDetailsScreen> createState() => _BookingDetailsScreenState();
}

class _BookingDetailsScreenState extends State<BookingDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _guestsController = TextEditingController(text: '10');
  final _specialRequirementsController = TextEditingController();
  
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  DietaryPreference _dietaryPreference = DietaryPreference.none;
  bool _isLoading = false;

  @override
  void dispose() {
    _guestsController.dispose();
    _specialRequirementsController.dispose();
    super.dispose();
  }

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
              'Booking Details',
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

  Widget _buildBuffetSummary() {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingM),
      child: GradientContainer.card(
        padding: const EdgeInsets.all(AppConfig.spacingM),
        child: Row(
          children: [
            // Buffet info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.buffet.name,
                    style: AppConfig.headingSmall.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: AppConfig.spacingXS),
                  Text(
                    widget.buffet.formattedPrice,
                    style: AppConfig.bodyMedium.copyWith(
                      color: AppConfig.mediumGray,
                    ),
                  ),
                ],
              ),
            ),
            
            // Edit button
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Change',
                style: AppConfig.bodyMedium.copyWith(
                  color: AppConfig.primaryBlack,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
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
            
            // Number of guests
            _buildGuestsSection(),
            
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
    return GradientContainer.card(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'When do you need the buffet?',
            style: AppConfig.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          
          const SizedBox(height: AppConfig.spacingM),
          
          // Date picker
          ListTile(
            leading: const Icon(Icons.calendar_today),
            title: Text(
              _selectedDate != null
                  ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                  : 'Select Date',
            ),
            subtitle: const Text('Choose your preferred date'),
            onTap: _selectDate,
            contentPadding: EdgeInsets.zero,
          ),
          
          const Divider(),
          
          // Time picker
          ListTile(
            leading: const Icon(Icons.access_time),
            title: Text(
              _selectedTime != null
                  ? _selectedTime!.format(context)
                  : 'Select Time',
            ),
            subtitle: const Text('Choose your preferred time'),
            onTap: _selectTime,
            contentPadding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }

  Widget _buildGuestsSection() {
    return GradientContainer.card(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Number of Guests',
            style: AppConfig.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          
          const SizedBox(height: AppConfig.spacingM),
          
          TextFormField(
            controller: _guestsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Number of guests',
              hintText: 'Enter number of people',
              prefixIcon: Icon(Icons.people),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter number of guests';
              }
              final number = int.tryParse(value);
              if (number == null || number < 1) {
                return 'Please enter a valid number';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDietarySection() {
    return GradientContainer.card(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Dietary Preferences',
            style: AppConfig.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          
          const SizedBox(height: AppConfig.spacingM),
          
          ...DietaryPreference.values.map((preference) {
            return RadioListTile<DietaryPreference>(
              title: Text(_getDietaryPreferenceText(preference)),
              value: preference,
              groupValue: _dietaryPreference,
              onChanged: (value) {
                setState(() {
                  _dietaryPreference = value!;
                });
              },
              contentPadding: EdgeInsets.zero,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSpecialRequirementsSection() {
    return GradientContainer.card(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Special Requirements',
            style: AppConfig.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          
          const SizedBox(height: AppConfig.spacingM),
          
          TextFormField(
            controller: _specialRequirementsController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Any special requests or allergies?',
              hintText: 'e.g., No nuts, extra vegetarian options, etc.',
              alignLabelWithHint: true,
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
        onPressed: _isLoading ? null : _handleBooking,
        isLoading: _isLoading,
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

  void _selectTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 12, minute: 0),
    );
    
    if (time != null) {
      setState(() {
        _selectedTime = time;
      });
    }
  }

  void _handleBooking() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_selectedDate == null) {
      _showErrorDialog('Please select a date for your booking.');
      return;
    }
    
    if (_selectedTime == null) {
      _showErrorDialog('Please select a time for your booking.');
      return;
    }
    
    setState(() {
      _isLoading = true;
    });
    
    // Simulate API call
    await Future.delayed(const Duration(seconds: 2));
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      
      // Create booking object
      final booking = Booking(
        id: 'booking_${DateTime.now().millisecondsSinceEpoch}',
        buffetOption: widget.buffet,
        bookingDate: _selectedDate!,
        bookingTime: _selectedTime!,
        numberOfGuests: int.parse(_guestsController.text),
        dietaryPreference: _dietaryPreference,
        specialRequirements: _specialRequirementsController.text.isNotEmpty
            ? _specialRequirementsController.text
            : null,
        createdAt: DateTime.now(),
        totalPrice: widget.buffet.pricePerHead * int.parse(_guestsController.text),
      );
      
      // Navigate to confirmation
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => OrderConfirmationScreen(booking: booking),
        ),
      );
    }
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

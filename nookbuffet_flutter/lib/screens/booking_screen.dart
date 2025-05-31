/*
Booking Screen for Nook Buffet App
Allows users to select date, time, number of people, and special requirements
Handles the booking process and collects customer information
*/

import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../models/buffet_option.dart';
import '../models/booking.dart';
import '../widgets/custom_button.dart';
import 'order_confirmation_screen.dart';

class BookingScreen extends StatefulWidget {
  final BuffetOption buffet;

  const BookingScreen({
    super.key,
    required this.buffet,
  });

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Form controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _specialRequestsController = TextEditingController();
  
  // Booking details
  DateTime? selectedDate;
  String? selectedTime;
  int numberOfPeople = 2;
  DietaryPreference dietaryPreference = DietaryPreference.none;
  
  // Available time slots
  final List<String> timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _specialRequestsController.dispose();
    super.dispose();
  }

  void _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
              primary: AppConfig.primaryColor,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != selectedDate) {
      setState(() {
        selectedDate = picked;
      });
    }
  }

  void _submitBooking() {
    if (_formKey.currentState!.validate() && 
        selectedDate != null && 
        selectedTime != null) {
      
      // Create booking object
      final booking = Booking(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        buffetId: widget.buffet.id,
        buffetName: widget.buffet.name,
        buffetPrice: widget.buffet.price,
        bookingDate: selectedDate!,
        bookingTime: selectedTime!,
        numberOfPeople: numberOfPeople,
        dietaryPreference: dietaryPreference,
        specialRequests: _specialRequestsController.text.trim(),
        status: BookingStatus.pending,
        createdAt: DateTime.now(),
        customerName: _nameController.text.trim(),
        customerEmail: _emailController.text.trim(),
        customerPhone: _phoneController.text.trim(),
      );

      // Navigate to confirmation
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OrderConfirmationScreen(booking: booking),
        ),
      );
    } else {
      // Show validation errors
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill in all required fields'),
          backgroundColor: AppConfig.errorColor,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConfig.backgroundColor,
      appBar: AppBar(
        title: const Text('Book Your Buffet'),
        backgroundColor: AppConfig.primaryColor,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Buffet summary header
          _buildBuffetSummary(),
          
          // Booking form
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppConfig.spacingMedium),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Date and time selection
                    _buildDateTimeSection(),
                    
                    const SizedBox(height: AppConfig.spacingLarge),
                    
                    // Party size
                    _buildPartySizeSection(),
                    
                    const SizedBox(height: AppConfig.spacingLarge),
                    
                    // Dietary preferences
                    _buildDietarySection(),
                    
                    const SizedBox(height: AppConfig.spacingLarge),
                    
                    // Customer information
                    _buildCustomerInfoSection(),
                    
                    const SizedBox(height: AppConfig.spacingLarge),
                    
                    // Special requests
                    _buildSpecialRequestsSection(),
                    
                    const SizedBox(height: AppConfig.spacingXXLarge),
                  ],
                ),
              ),
            ),
          ),
          
          // Bottom booking bar
          _buildBottomBookingBar(),
        ],
      ),
    );
  }

  Widget _buildBuffetSummary() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppConfig.spacingMedium),
      decoration: const BoxDecoration(
        color: AppConfig.primaryColor,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(AppConfig.borderRadiusMedium),
          bottomRight: Radius.circular(AppConfig.borderRadiusMedium),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.buffet.name,
            style: AppConfig.headingMedium.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            widget.buffet.formattedPrice,
            style: AppConfig.bodyLarge.copyWith(
              color: Colors.white.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateTimeSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'When would you like your buffet?',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            
            // Date selection
            ListTile(
              leading: const Icon(Icons.calendar_today, color: AppConfig.primaryColor),
              title: Text(
                selectedDate != null 
                    ? 'Date: ${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}'
                    : 'Select Date',
                style: AppConfig.bodyMedium,
              ),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _selectDate,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppConfig.borderRadiusSmall),
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingSmall),
            
            // Time selection
            if (selectedDate != null) ...[
              const Divider(),
              Text(
                'Select Time:',
                style: AppConfig.bodyMedium.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: AppConfig.spacingSmall),
              Wrap(
                spacing: AppConfig.spacingSmall,
                runSpacing: AppConfig.spacingSmall,
                children: timeSlots.map((time) => ChoiceChip(
                  label: Text(time),
                  selected: selectedTime == time,
                  onSelected: (selected) {
                    setState(() {
                      selectedTime = selected ? time : null;
                    });
                  },
                  selectedColor: AppConfig.primaryColor.withOpacity(0.2),
                  labelStyle: TextStyle(
                    color: selectedTime == time 
                        ? AppConfig.primaryColor 
                        : AppConfig.textPrimaryColor,
                    fontWeight: selectedTime == time 
                        ? FontWeight.bold 
                        : FontWeight.normal,
                  ),
                )).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPartySizeSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'How many people?',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            Row(
              children: [
                IconButton(
                  onPressed: numberOfPeople > 1
                      ? () => setState(() => numberOfPeople--)
                      : null,
                  icon: const Icon(Icons.remove_circle_outline),
                  color: AppConfig.primaryColor,
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppConfig.spacingLarge,
                    vertical: AppConfig.spacingSmall,
                  ),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppConfig.primaryColor),
                    borderRadius: BorderRadius.circular(AppConfig.borderRadiusSmall),
                  ),
                  child: Text(
                    numberOfPeople.toString(),
                    style: AppConfig.headingSmall.copyWith(
                      color: AppConfig.primaryColor,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: numberOfPeople < 50
                      ? () => setState(() => numberOfPeople++)
                      : null,
                  icon: const Icon(Icons.add_circle_outline),
                  color: AppConfig.primaryColor,
                ),
                const Spacer(),
                Text(
                  'Total: £${(widget.buffet.price * numberOfPeople).toStringAsFixed(2)}',
                  style: AppConfig.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppConfig.primaryColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDietarySection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dietary Requirements',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),
            ...DietaryPreference.values.map((preference) => RadioListTile<DietaryPreference>(
              title: Text(
                _getDietaryPreferenceText(preference),
                style: AppConfig.bodyMedium,
              ),
              value: preference,
              groupValue: dietaryPreference,
              onChanged: (value) {
                setState(() {
                  dietaryPreference = value!;
                });
              },
              activeColor: AppConfig.primaryColor,
            )),
          ],
        ),
      ),
    );
  }

  String _getDietaryPreferenceText(DietaryPreference preference) {
    switch (preference) {
      case DietaryPreference.none:
        return 'No special requirements';
      case DietaryPreference.vegetarian:
        return 'Vegetarian options only';
      case DietaryPreference.vegan:
        return 'Vegan options only';
      case DietaryPreference.mixed:
        return 'Mixed dietary requirements';
    }
  }

  Widget _buildCustomerInfoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConfig.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your Details',
              style: AppConfig.headingSmall,
            ),
            const SizedBox(height: AppConfig.spacingMedium),

            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name *',
                prefixIcon: Icon(Icons.person),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your name';
                }
                return null;
              },
            ),

            const SizedBox(height: AppConfig.spacingMedium),

            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email Address *',
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your email';
                }
                if (!value.contains('@')) {
                  return 'Please enter a valid email';
                }
                return null;
              },
            ),

            const SizedBox(height: AppConfig.spacingMedium),

            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone Number *',
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your phone number';
                }
                return null;
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecialRequestsSection() {
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
            const SizedBox(height: AppConfig.spacingSmall),
            Text(
              'Any special requirements or notes for your buffet?',
              style: AppConfig.bodySmall.copyWith(
                color: AppConfig.textSecondaryColor,
              ),
            ),
            const SizedBox(height: AppConfig.spacingMedium),

            TextFormField(
              controller: _specialRequestsController,
              decoration: const InputDecoration(
                hintText: 'e.g., allergies, special arrangements, etc.',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              maxLength: 500,
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total for $numberOfPeople people',
                        style: AppConfig.bodyMedium,
                      ),
                      Text(
                        '£${(widget.buffet.price * numberOfPeople).toStringAsFixed(2)}',
                        style: AppConfig.headingMedium.copyWith(
                          color: AppConfig.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                CustomButton(
                  text: 'Confirm Booking',
                  onPressed: _submitBooking,
                  icon: Icons.check,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

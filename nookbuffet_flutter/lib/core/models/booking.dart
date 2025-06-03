/*
Booking Model for Nook Buffet Flutter Application
Data model representing a buffet booking with all necessary details
Includes customer information, buffet selection, and special requirements
*/

import 'package:flutter/material.dart';
import 'buffet_option.dart';

enum BookingStatus { pending, confirmed, rejected, cancelled }

enum DietaryPreference { none, vegetarian, vegan, mixed }

class Booking {
  final String id;
  final BuffetOption buffetOption;
  final DateTime bookingDate;
  final TimeOfDay bookingTime;
  final int numberOfGuests;
  final DietaryPreference dietaryPreference;
  final String? specialRequirements;
  final CustomerInfo? customerInfo;
  final BookingStatus status;
  final DateTime createdAt;
  final double totalPrice;

  const Booking({
    required this.id,
    required this.buffetOption,
    required this.bookingDate,
    required this.bookingTime,
    required this.numberOfGuests,
    this.dietaryPreference = DietaryPreference.none,
    this.specialRequirements,
    this.customerInfo,
    this.status = BookingStatus.pending,
    required this.createdAt,
    required this.totalPrice,
  });

  // Factory method to create Booking from map (for future API integration)
  factory Booking.fromMap(Map<String, dynamic> map) {
    return Booking(
      id: map['id'] ?? '',
      buffetOption: BuffetOption.fromMap(map['buffetOption'] ?? {}),
      bookingDate: DateTime.parse(map['bookingDate'] ?? DateTime.now().toIso8601String()),
      bookingTime: TimeOfDay(
        hour: map['bookingTimeHour'] ?? 12,
        minute: map['bookingTimeMinute'] ?? 0,
      ),
      numberOfGuests: map['numberOfGuests'] ?? 1,
      dietaryPreference: DietaryPreference.values.firstWhere(
        (e) => e.toString() == map['dietaryPreference'],
        orElse: () => DietaryPreference.none,
      ),
      specialRequirements: map['specialRequirements'],
      customerInfo: map['customerInfo'] != null 
          ? CustomerInfo.fromMap(map['customerInfo'])
          : null,
      status: BookingStatus.values.firstWhere(
        (e) => e.toString() == map['status'],
        orElse: () => BookingStatus.pending,
      ),
      createdAt: DateTime.parse(map['createdAt'] ?? DateTime.now().toIso8601String()),
      totalPrice: (map['totalPrice'] ?? 0.0).toDouble(),
    );
  }

  // Convert Booking to map (for future API integration)
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'buffetOption': buffetOption.toMap(),
      'bookingDate': bookingDate.toIso8601String(),
      'bookingTimeHour': bookingTime.hour,
      'bookingTimeMinute': bookingTime.minute,
      'numberOfGuests': numberOfGuests,
      'dietaryPreference': dietaryPreference.toString(),
      'specialRequirements': specialRequirements,
      'customerInfo': customerInfo?.toMap(),
      'status': status.toString(),
      'createdAt': createdAt.toIso8601String(),
      'totalPrice': totalPrice,
    };
  }

  // Get formatted booking date
  String get formattedDate {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${bookingDate.day} ${months[bookingDate.month - 1]} ${bookingDate.year}';
  }

  // Get formatted booking time
  String get formattedTime {
    final hour = bookingTime.hour.toString().padLeft(2, '0');
    final minute = bookingTime.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  // Get formatted total price
  String get formattedTotalPrice => '£${totalPrice.toStringAsFixed(2)}';

  // Get status display text
  String get statusText {
    switch (status) {
      case BookingStatus.pending:
        return 'Pending Confirmation';
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.rejected:
        return 'Rejected';
      case BookingStatus.cancelled:
        return 'Cancelled';
    }
  }

  // Get dietary preference display text
  String get dietaryPreferenceText {
    switch (dietaryPreference) {
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

  // Create a copy of booking with updated fields
  Booking copyWith({
    String? id,
    BuffetOption? buffetOption,
    DateTime? bookingDate,
    TimeOfDay? bookingTime,
    int? numberOfGuests,
    DietaryPreference? dietaryPreference,
    String? specialRequirements,
    CustomerInfo? customerInfo,
    BookingStatus? status,
    DateTime? createdAt,
    double? totalPrice,
  }) {
    return Booking(
      id: id ?? this.id,
      buffetOption: buffetOption ?? this.buffetOption,
      bookingDate: bookingDate ?? this.bookingDate,
      bookingTime: bookingTime ?? this.bookingTime,
      numberOfGuests: numberOfGuests ?? this.numberOfGuests,
      dietaryPreference: dietaryPreference ?? this.dietaryPreference,
      specialRequirements: specialRequirements ?? this.specialRequirements,
      customerInfo: customerInfo ?? this.customerInfo,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      totalPrice: totalPrice ?? this.totalPrice,
    );
  }
}

class CustomerInfo {
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String? organization;

  const CustomerInfo({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    this.organization,
  });

  // Factory method to create CustomerInfo from map
  factory CustomerInfo.fromMap(Map<String, dynamic> map) {
    return CustomerInfo(
      firstName: map['firstName'] ?? '',
      lastName: map['lastName'] ?? '',
      email: map['email'] ?? '',
      phone: map['phone'] ?? '',
      organization: map['organization'],
    );
  }

  // Convert CustomerInfo to map
  Map<String, dynamic> toMap() {
    return {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'organization': organization,
    };
  }

  // Get full name
  String get fullName => '$firstName $lastName';

  // Create a copy of customer info with updated fields
  CustomerInfo copyWith({
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    String? organization,
  }) {
    return CustomerInfo(
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      organization: organization ?? this.organization,
    );
  }
}

// Extension for TimeOfDay to add useful methods
extension TimeOfDayExtension on TimeOfDay {
  String get formatted {
    final hour = this.hour.toString().padLeft(2, '0');
    final minute = this.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}

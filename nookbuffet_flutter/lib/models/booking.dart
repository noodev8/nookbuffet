/*
Data model for Buffet Booking
Represents a customer's buffet order with date, time, special requests
Contains all the information needed to process and confirm a booking
*/

enum BookingStatus {
  pending,
  confirmed,
  rejected,
  cancelled,
}

enum DietaryPreference {
  none,
  vegetarian,
  vegan,
  mixed,
}

class Booking {
  final String id;
  final String buffetId;
  final String buffetName;
  final double buffetPrice;
  final DateTime bookingDate;
  final String bookingTime;
  final int numberOfPeople;
  final DietaryPreference dietaryPreference;
  final String specialRequests;
  final BookingStatus status;
  final DateTime createdAt;
  final String customerName;
  final String customerEmail;
  final String customerPhone;

  const Booking({
    required this.id,
    required this.buffetId,
    required this.buffetName,
    required this.buffetPrice,
    required this.bookingDate,
    required this.bookingTime,
    required this.numberOfPeople,
    required this.dietaryPreference,
    required this.specialRequests,
    required this.status,
    required this.createdAt,
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
  });

  // Calculate total price
  double get totalPrice => buffetPrice * numberOfPeople;

  // Get formatted total price
  String get formattedTotalPrice => '£${totalPrice.toStringAsFixed(2)}';

  // Get formatted booking date
  String get formattedBookingDate {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${bookingDate.day} ${months[bookingDate.month - 1]} ${bookingDate.year}';
  }

  // Get status display text
  String get statusDisplayText {
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
  String get dietaryPreferenceDisplayText {
    switch (dietaryPreference) {
      case DietaryPreference.none:
        return 'No special requirements';
      case DietaryPreference.vegetarian:
        return 'Vegetarian';
      case DietaryPreference.vegan:
        return 'Vegan';
      case DietaryPreference.mixed:
        return 'Mixed dietary requirements';
    }
  }

  // Create a copy with updated values
  Booking copyWith({
    String? id,
    String? buffetId,
    String? buffetName,
    double? buffetPrice,
    DateTime? bookingDate,
    String? bookingTime,
    int? numberOfPeople,
    DietaryPreference? dietaryPreference,
    String? specialRequests,
    BookingStatus? status,
    DateTime? createdAt,
    String? customerName,
    String? customerEmail,
    String? customerPhone,
  }) {
    return Booking(
      id: id ?? this.id,
      buffetId: buffetId ?? this.buffetId,
      buffetName: buffetName ?? this.buffetName,
      buffetPrice: buffetPrice ?? this.buffetPrice,
      bookingDate: bookingDate ?? this.bookingDate,
      bookingTime: bookingTime ?? this.bookingTime,
      numberOfPeople: numberOfPeople ?? this.numberOfPeople,
      dietaryPreference: dietaryPreference ?? this.dietaryPreference,
      specialRequests: specialRequests ?? this.specialRequests,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      customerName: customerName ?? this.customerName,
      customerEmail: customerEmail ?? this.customerEmail,
      customerPhone: customerPhone ?? this.customerPhone,
    );
  }

  // Convert to JSON (for future API integration)
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'buffetId': buffetId,
      'buffetName': buffetName,
      'buffetPrice': buffetPrice,
      'bookingDate': bookingDate.toIso8601String(),
      'bookingTime': bookingTime,
      'numberOfPeople': numberOfPeople,
      'dietaryPreference': dietaryPreference.name,
      'specialRequests': specialRequests,
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
      'customerName': customerName,
      'customerEmail': customerEmail,
      'customerPhone': customerPhone,
    };
  }

  // Create from JSON (for future API integration)
  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      buffetId: json['buffetId'],
      buffetName: json['buffetName'],
      buffetPrice: json['buffetPrice'].toDouble(),
      bookingDate: DateTime.parse(json['bookingDate']),
      bookingTime: json['bookingTime'],
      numberOfPeople: json['numberOfPeople'],
      dietaryPreference: DietaryPreference.values.firstWhere(
        (e) => e.name == json['dietaryPreference'],
      ),
      specialRequests: json['specialRequests'],
      status: BookingStatus.values.firstWhere(
        (e) => e.name == json['status'],
      ),
      createdAt: DateTime.parse(json['createdAt']),
      customerName: json['customerName'],
      customerEmail: json['customerEmail'],
      customerPhone: json['customerPhone'],
    );
  }
}

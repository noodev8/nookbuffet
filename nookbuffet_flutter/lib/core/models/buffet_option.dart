/*
Buffet Option Model for Nook Buffet Flutter Application
Data model representing the different buffet packages available
Contains pricing, items, and dietary information
*/

class BuffetOption {
  final String id;
  final String name;
  final double pricePerHead;
  final String description;
  final List<BuffetItem> sandwiches;
  final List<BuffetItem> sides;
  final bool isPopular;

  const BuffetOption({
    required this.id,
    required this.name,
    required this.pricePerHead,
    required this.description,
    required this.sandwiches,
    required this.sides,
    this.isPopular = false,
  });

  // Factory method to create BuffetOption from map (for future API integration)
  factory BuffetOption.fromMap(Map<String, dynamic> map) {
    return BuffetOption(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      pricePerHead: (map['pricePerHead'] ?? 0.0).toDouble(),
      description: map['description'] ?? '',
      sandwiches: (map['sandwiches'] as List<dynamic>?)
          ?.map((item) => BuffetItem.fromMap(item))
          .toList() ?? [],
      sides: (map['sides'] as List<dynamic>?)
          ?.map((item) => BuffetItem.fromMap(item))
          .toList() ?? [],
      isPopular: map['isPopular'] ?? false,
    );
  }

  // Convert BuffetOption to map (for future API integration)
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'pricePerHead': pricePerHead,
      'description': description,
      'sandwiches': sandwiches.map((item) => item.toMap()).toList(),
      'sides': sides.map((item) => item.toMap()).toList(),
      'isPopular': isPopular,
    };
  }

  // Get formatted price string
  String get formattedPrice => '£${pricePerHead.toStringAsFixed(2)} per head';

  // Get total number of items
  int get totalItems => sandwiches.length + sides.length;

  // Check if buffet has vegetarian options
  bool get hasVegetarianOptions {
    return sandwiches.any((item) => item.isVegetarian) ||
           sides.any((item) => item.isVegetarian);
  }

  // Check if buffet has vegan options
  bool get hasVeganOptions {
    return sandwiches.any((item) => item.isVegan) ||
           sides.any((item) => item.isVegan);
  }
}

class BuffetItem {
  final String name;
  final bool isVegetarian;
  final bool isVegan;
  final String? description;

  const BuffetItem({
    required this.name,
    this.isVegetarian = false,
    this.isVegan = false,
    this.description,
  });

  // Factory method to create BuffetItem from map
  factory BuffetItem.fromMap(Map<String, dynamic> map) {
    return BuffetItem(
      name: map['name'] ?? '',
      isVegetarian: map['isVegetarian'] ?? false,
      isVegan: map['isVegan'] ?? false,
      description: map['description'],
    );
  }

  // Convert BuffetItem to map
  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'isVegetarian': isVegetarian,
      'isVegan': isVegan,
      'description': description,
    };
  }

  // Get dietary indicator text
  String get dietaryIndicator {
    if (isVegan) return '(Vegan)';
    if (isVegetarian) return '(V)';
    return '';
  }
}

// Static data for the three buffet options based on the provided information
class BuffetData {
  static List<BuffetOption> get allBuffets => [
    // Buffet 1 - £9.90 per head
    BuffetOption(
      id: 'buffet_1',
      name: 'Classic Buffet',
      pricePerHead: 9.90,
      description: 'Perfect for casual gatherings with essential favorites',
      sandwiches: [
        const BuffetItem(name: 'Egg Mayo & Cress', isVegetarian: true),
        const BuffetItem(name: 'Ham Salad'),
        const BuffetItem(name: 'Cheese & Onion', isVegetarian: true),
        const BuffetItem(name: 'Tuna Mayo'),
        const BuffetItem(name: 'Beef Salad'),
      ],
      sides: [
        const BuffetItem(name: 'Selection of Quiche'),
        const BuffetItem(name: 'Cocktail Sausages'),
        const BuffetItem(name: 'Sausage Rolls'),
        const BuffetItem(name: 'Cheese & Onion Rolls', isVegetarian: true),
        const BuffetItem(name: 'Pork Pies'),
        const BuffetItem(name: 'Scotch Eggs'),
        const BuffetItem(name: 'Tortillas/Dips'),
        const BuffetItem(name: 'Assortment of Cakes'),
      ],
    ),

    // Buffet 2 - £10.90 per head
    BuffetOption(
      id: 'buffet_2',
      name: 'Enhanced Buffet',
      pricePerHead: 10.90,
      description: 'Everything from Classic Buffet plus additional favorites',
      isPopular: true,
      sandwiches: [
        const BuffetItem(name: 'Egg Mayo & Cress', isVegetarian: true),
        const BuffetItem(name: 'Ham Salad'),
        const BuffetItem(name: 'Cheese & Onion', isVegetarian: true),
        const BuffetItem(name: 'Tuna Mayo'),
        const BuffetItem(name: 'Beef Salad'),
        const BuffetItem(name: 'Coronation Chicken'),
      ],
      sides: [
        const BuffetItem(name: 'Selection of Quiche'),
        const BuffetItem(name: 'Cocktail Sausages'),
        const BuffetItem(name: 'Sausage Rolls'),
        const BuffetItem(name: 'Cheese & Onion Rolls', isVegetarian: true),
        const BuffetItem(name: 'Pork Pies'),
        const BuffetItem(name: 'Scotch Eggs'),
        const BuffetItem(name: 'Tortillas/Dips'),
        const BuffetItem(name: 'Assortment of Cakes'),
        const BuffetItem(name: 'Vegetable sticks & Dips', isVegetarian: true),
        const BuffetItem(name: 'Cheese / Pineapple / Grapes', isVegetarian: true),
        const BuffetItem(name: 'Bread Sticks'),
        const BuffetItem(name: 'Pickles'),
        const BuffetItem(name: 'Coleslaw'),
      ],
    ),

    // Deluxe Buffet - £13.90 per head
    BuffetOption(
      id: 'buffet_deluxe',
      name: 'The Deluxe Buffet',
      pricePerHead: 13.90,
      description: 'Premium selection with gourmet options and fresh ingredients',
      sandwiches: [
        const BuffetItem(name: 'Ham & Mustard'),
        const BuffetItem(name: 'Coronation Chicken & Baby Gem'),
        const BuffetItem(name: 'Egg & Cress', isVegetarian: true),
        const BuffetItem(name: 'Beef, Horseradish, Tomato and Rocket'),
        const BuffetItem(name: 'Cheese & Onion', isVegetarian: true),
        const BuffetItem(name: 'Turkey & Cranberry'),
        const BuffetItem(name: 'Chicken, Bacon & Chive Mayo'),
      ],
      sides: [
        const BuffetItem(name: 'Quiche'),
        const BuffetItem(name: 'Sausage Rolls'),
        const BuffetItem(name: 'Scotch Eggs'),
        const BuffetItem(name: 'Cheese & Pineapple', isVegetarian: true),
        const BuffetItem(name: 'Pork Pie'),
        const BuffetItem(name: 'Cocktail Sausages'),
        const BuffetItem(name: 'Greek Salad', isVegetarian: true),
        const BuffetItem(name: 'Potato Salad', isVegetarian: true),
        const BuffetItem(name: 'Tomato & Mozzarella Skewers', isVegetarian: true),
        const BuffetItem(name: 'Vegetables', isVegetarian: true),
        const BuffetItem(name: 'Dips'),
        const BuffetItem(name: 'Celery', isVegetarian: true),
        const BuffetItem(name: 'Cucumber', isVegetarian: true),
        const BuffetItem(name: 'Carrots', isVegetarian: true),
        const BuffetItem(name: 'Red/Green Pepper', isVegetarian: true),
        const BuffetItem(name: 'Avocado', isVegan: true),
        const BuffetItem(name: 'Cheese / Chives', isVegetarian: true),
        const BuffetItem(name: 'Hummus', isVegan: true),
        const BuffetItem(name: 'Breadsticks'),
      ],
    ),
  ];
}

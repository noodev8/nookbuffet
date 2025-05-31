/*
Data model for Buffet Options
Represents the different buffet packages available at Nook Buffet
Contains pricing, items, and dietary information for each buffet option
*/

class BuffetOption {
  final String id;
  final String name;
  final double price;
  final String description;
  final List<String> sandwiches;
  final List<String> sides;
  final List<String> dietaryOptions;
  final String imagePath;
  final bool isPopular;
  final bool isAvailable;

  const BuffetOption({
    required this.id,
    required this.name,
    required this.price,
    required this.description,
    required this.sandwiches,
    required this.sides,
    required this.dietaryOptions,
    required this.imagePath,
    this.isPopular = false,
    this.isAvailable = true,
  });

  // Convert price to formatted string
  String get formattedPrice => '£${price.toStringAsFixed(2)} per head';

  // Get total items count
  int get totalItems => sandwiches.length + sides.length;

  // Check if buffet has vegetarian options
  bool get hasVegetarianOptions {
    return sandwiches.any((item) => item.contains('(V)')) ||
           sides.any((item) => item.contains('(V)'));
  }

  // Get vegetarian items only
  List<String> get vegetarianItems {
    List<String> vegItems = [];
    vegItems.addAll(sandwiches.where((item) => item.contains('(V)')));
    vegItems.addAll(sides.where((item) => item.contains('(V)')));
    return vegItems;
  }

  // Static method to get all buffet options with dummy data
  static List<BuffetOption> getAllBuffetOptions() {
    return [
      const BuffetOption(
        id: 'buffet_1',
        name: 'Classic Buffet',
        price: 9.90,
        description: 'Perfect for casual gatherings with essential favorites',
        sandwiches: [
          'Egg Mayo & Cress (V)',
          'Ham Salad',
          'Cheese & Onion (V)',
          'Tuna Mayo',
          'Beef Salad',
        ],
        sides: [
          'Selection of Quiche',
          'Cocktail Sausages',
          'Sausage Rolls',
          'Cheese & Onion Rolls (V)',
          'Pork Pies',
          'Scotch Eggs',
          'Tortillas/Dips',
          'Assortment of Cakes',
        ],
        dietaryOptions: ['Vegetarian options available'],
        imagePath: 'assets/images/buffet-example-1.jpg',
        isPopular: false,
      ),
      
      const BuffetOption(
        id: 'buffet_2',
        name: 'Enhanced Buffet',
        price: 10.90,
        description: 'Everything from Classic Buffet plus premium additions',
        sandwiches: [
          'Egg Mayo & Cress (V)',
          'Ham Salad',
          'Cheese & Onion (V)',
          'Tuna Mayo',
          'Beef Salad',
          'Coronation Chicken',
        ],
        sides: [
          'Selection of Quiche',
          'Cocktail Sausages',
          'Sausage Rolls',
          'Cheese & Onion Rolls (V)',
          'Pork Pies',
          'Scotch Eggs',
          'Tortillas/Dips',
          'Assortment of Cakes',
          'Vegetable sticks & Dips',
          'Cheese / Pineapple / Grapes',
          'Bread Sticks',
          'Pickles',
          'Coleslaw',
        ],
        dietaryOptions: ['Vegetarian options available', 'Fresh vegetables'],
        imagePath: 'assets/images/buffet-example-1.jpg',
        isPopular: true,
      ),
      
      const BuffetOption(
        id: 'buffet_3',
        name: 'Deluxe Buffet',
        price: 13.90,
        description: 'Our premium offering with gourmet selections',
        sandwiches: [
          'Ham & Mustard',
          'Coronation Chicken & Baby Gem',
          'Egg & Cress',
          'Beef, Horseradish, Tomato and Rocket',
          'Cheese & Onion',
          'Turkey & Cranberry',
          'Chicken, Bacon & Chive Mayo',
        ],
        sides: [
          'Quiche',
          'Sausage Rolls',
          'Scotch Eggs',
          'Cheese & Pineapple',
          'Pork Pie',
          'Cocktail Sausages',
          'Greek Salad',
          'Potato Salad',
          'Tomato & Mozzarella Skewers',
          'Vegetables',
          'Dips',
          'Celery',
          'Cucumber',
          'Carrots',
          'Red/Green Pepper',
          'Avocado',
          'Cheese / Chives',
          'Hummus',
          'Breadsticks',
        ],
        dietaryOptions: [
          'Vegetarian options available',
          'Fresh vegetables',
          'Mediterranean options',
          'Vegan-friendly items'
        ],
        imagePath: 'assets/images/buffet-example-1.jpg',
        isPopular: false,
      ),
    ];
  }

  // Get buffet option by ID
  static BuffetOption? getBuffetById(String id) {
    try {
      return getAllBuffetOptions().firstWhere((buffet) => buffet.id == id);
    } catch (e) {
      return null;
    }
  }
}

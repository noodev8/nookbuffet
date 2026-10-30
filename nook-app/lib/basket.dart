import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Buffets are ordered by phone for now, so the basket only holds sandwiches.
// Each entry is saved in the same shape the website keeps in localStorage.

String money(num value) => '£${value.toStringAsFixed(2)}';

class SandwichPick {
  const SandwichPick({required this.stepName, required this.optionName, required this.extraPrice});

  final String stepName;
  final String optionName;
  final double extraPrice;

  Map<String, dynamic> toJson() => {'stepName': stepName, 'optionName': optionName, 'extraPrice': extraPrice};

  factory SandwichPick.fromJson(Map<String, dynamic> json) => SandwichPick(
        stepName: json['stepName'] as String,
        optionName: json['optionName'] as String,
        extraPrice: (json['extraPrice'] as num).toDouble(),
      );
}

class SandwichEntry {
  const SandwichEntry({
    required this.quantity,
    required this.optionIds,
    required this.picks,
    required this.unitPence,
    required this.notes,
  });

  final int quantity;
  final List<int> optionIds; // what is sent to the server
  final List<SandwichPick> picks; // for display
  final int unitPence;
  final String notes;

  double get unitPrice => unitPence / 100;
  double get totalPrice => unitPence * quantity / 100;

  SandwichEntry withQuantity(int value) =>
      SandwichEntry(quantity: value, optionIds: optionIds, picks: picks, unitPence: unitPence, notes: notes);

  // "Bread: White · Fillings: Ham, Cheese"
  String get description {
    final byStep = <(String, List<String>)>[];
    for (final pick in picks) {
      if (byStep.isNotEmpty && byStep.last.$1 == pick.stepName) {
        byStep.last.$2.add(pick.optionName);
      } else {
        byStep.add((pick.stepName, [pick.optionName]));
      }
    }
    return byStep.map((s) => '${s.$1}: ${s.$2.join(', ')}').join(' · ');
  }

  Map<String, dynamic> toJson() => {
        'type': 'sandwich',
        'quantity': quantity,
        'optionIds': optionIds,
        'picks': picks.map((p) => p.toJson()).toList(),
        'unitPrice': unitPrice,
        'totalPrice': totalPrice,
        'notes': notes,
      };

  factory SandwichEntry.fromJson(Map<String, dynamic> json) => SandwichEntry(
        quantity: json['quantity'] as int,
        optionIds: (json['optionIds'] as List).cast<int>(),
        picks: (json['picks'] as List).map((p) => SandwichPick.fromJson(p as Map<String, dynamic>)).toList(),
        unitPence: ((json['unitPrice'] as num) * 100).round(),
        notes: json['notes'] as String? ?? '',
      );
}

class Basket extends ChangeNotifier {
  static const _key = 'basketData';

  List<SandwichEntry> _entries = [];
  List<SandwichEntry> get entries => List.unmodifiable(_entries);

  bool get isEmpty => _entries.isEmpty;
  int get sandwichCount => _entries.fold(0, (sum, e) => sum + e.quantity);
  double get total => _entries.fold(0, (sum, e) => sum + e.totalPrice);

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_key);
    if (saved == null) return;
    try {
      _entries = (jsonDecode(saved) as List)
          .cast<Map<String, dynamic>>()
          .where((e) => e['type'] == 'sandwich')
          .map(SandwichEntry.fromJson)
          .toList();
    } catch (_) {
      _entries = [];
    }
    notifyListeners();
  }

  // Sandwiches in the basket, leaving out the one at [except] (the one being edited)
  int sandwichesOtherThan(int? except) {
    var count = 0;
    for (var i = 0; i < _entries.length; i++) {
      if (i != except) count += _entries[i].quantity;
    }
    return count;
  }

  void add(SandwichEntry entry) => _update(() => _entries.add(entry));

  void replace(int index, SandwichEntry entry) => _update(() => _entries[index] = entry);

  void removeAt(int index) => _update(() => _entries.removeAt(index));

  void setQuantity(int index, int quantity) =>
      _update(() => _entries[index] = _entries[index].withQuantity(quantity));

  void clear() => _update(_entries.clear);

  void _update(VoidCallback change) {
    change();
    notifyListeners();
    _save();
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    if (_entries.isEmpty) {
      await prefs.remove(_key);
    } else {
      await prefs.setString(_key, jsonEncode(_entries.map((e) => e.toJson()).toList()));
    }
  }
}

// One basket for the whole app
final basket = Basket();

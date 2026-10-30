import 'package:flutter_test/flutter_test.dart';
import 'package:nook_app/basket.dart';
import 'package:shared_preferences/shared_preferences.dart';

SandwichEntry _sandwich({int quantity = 2}) => SandwichEntry(
      quantity: quantity,
      optionIds: const [3, 8, 12],
      picks: const [
        SandwichPick(stepName: 'Bread', optionName: 'White', extraPrice: 0),
        SandwichPick(stepName: 'Fillings', optionName: 'Ham', extraPrice: 0),
        SandwichPick(stepName: 'Fillings', optionName: 'Cheese', extraPrice: 0.4),
      ],
      unitPence: 590,
      notes: 'cut in half',
    );

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('describes a sandwich step by step', () {
    expect(_sandwich().description, 'Bread: White · Fillings: Ham, Cheese');
  });

  test('prices come from whole pence', () {
    final entry = _sandwich(quantity: 3);
    expect(entry.unitPrice, 5.9);
    expect(entry.totalPrice, 17.7);
    expect(money(entry.totalPrice), '£17.70');
  });

  test('saves in the same shape as the website and reads back', () {
    final json = _sandwich().toJson();
    expect(json['type'], 'sandwich');
    expect(json['optionIds'], [3, 8, 12]);
    final back = SandwichEntry.fromJson(json);
    expect(back.quantity, 2);
    expect(back.unitPence, 590);
    expect(back.notes, 'cut in half');
    expect(back.description, _sandwich().description);
  });

  test('counts sandwiches, leaving out the one being edited', () {
    final basket = Basket()
      ..add(_sandwich(quantity: 2))
      ..add(_sandwich(quantity: 5));
    expect(basket.sandwichCount, 7);
    expect(basket.sandwichesOtherThan(1), 2);
    expect(basket.sandwichesOtherThan(null), 7);
  });
}

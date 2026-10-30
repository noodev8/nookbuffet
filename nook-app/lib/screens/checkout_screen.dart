import 'package:material_ui/material_ui.dart';

import '../api.dart';
import '../basket.dart';
import '../main.dart';
import '../theme.dart';
import '../widgets.dart';
import 'basket_screen.dart';

class OrderDetails {
  const OrderDetails({
    required this.name,
    required this.email,
    required this.phone,
    required this.date,
    required this.time,
  });

  final String name;
  final String email;
  final String phone;
  final String date; // YYYY-MM-DD
  final String time; // HH:MM
}

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key, required this.details});

  final OrderDetails details;

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  bool _placing = false;
  String? _error;

  // No payment is taken online - the customer pays on collection.
  // Only what was picked is sent - the server works out every price from today's menu.
  Future<void> _placeOrder() async {
    final details = widget.details;
    setState(() {
      _placing = true;
      _error = null;
    });
    try {
      final result = await apiPost('/api/orders', {
        'email': details.email,
        'phone': details.phone,
        'businessName': details.name,
        'address': '',
        'fulfillmentType': 'collection',
        'fulfillmentDate': details.date,
        'fulfillmentTime': details.time,
        'sandwiches': [
          for (final entry in basket.entries)
            {'quantity': entry.quantity, 'optionIds': entry.optionIds, 'notes': entry.notes},
        ],
        'buffets': [],
      }) as Map<String, dynamic>;
      basket.clear();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => SuccessScreen(orderNumber: '${result['orderNumber']}')),
      );
    } on ApiException catch (e) {
      if (mounted) {
        setState(() {
          _placing = false;
          _error = e.message;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final details = widget.details;
    final entries = basket.entries;
    return Scaffold(
      appBar: AppBar(title: const Text('Complete Your Order')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const NoticeBanner(
            title: 'Pay on collection',
            text: 'No payment is needed online. You pay in the shop when you collect your order.',
          ),
          const SizedBox(height: 20),
          Text('Order Summary', style: heading(20)),
          const SizedBox(height: 12),
          Panel(
            padding: 16,
            child: Column(
              children: [
                for (final entry in entries) ...[
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Sandwich × ${entry.quantity}', style: heading(17)),
                            const SizedBox(height: 2),
                            Text(entry.description, style: const TextStyle(color: Color(0xFFCCCCCC))),
                            if (entry.notes.isNotEmpty)
                              Text('Notes: ${entry.notes}', style: const TextStyle(color: NookColors.muted)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(money(entry.totalPrice), style: const TextStyle(fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider()),
                ],
                Row(
                  children: [
                    const Expanded(child: Text('Total to pay on collection', style: TextStyle(fontSize: 16))),
                    Text(money(basket.total), style: heading(22, color: NookColors.green)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text('Your Details', style: heading(20)),
          const SizedBox(height: 12),
          Panel(
            padding: 16,
            child: Column(
              children: [
                _DetailRow('Name', details.name),
                _DetailRow('Email', details.email),
                _DetailRow('Phone', details.phone),
                const _DetailRow('Type', 'Collection'),
                _DetailRow('Date', formatDate(details.date)),
                _DetailRow('Time', details.time),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text.rich(
            TextSpan(children: [
              const TextSpan(text: 'Placing your order does '),
              const TextSpan(text: 'not', style: TextStyle(fontWeight: FontWeight.w700)),
              TextSpan(text: ' take any payment. Please pay ${money(basket.total)} when you collect your order.'),
            ]),
            style: const TextStyle(color: Color(0xFFCCCCCC), height: 1.4),
          ),
          if (_error != null) ...[
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: NookColors.error)),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _placing || entries.isEmpty ? null : _placeOrder,
            style: FilledButton.styleFrom(backgroundColor: NookColors.green, foregroundColor: Colors.white),
            child: Text(_placing ? 'Placing Order...' : 'Place Order – Pay on Collection'),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 70, child: Text(label, style: const TextStyle(color: NookColors.muted))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

class SuccessScreen extends StatelessWidget {
  const SuccessScreen({super.key, required this.orderNumber});

  final String orderNumber;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 40),
            const Icon(Icons.check_circle_outline, size: 88, color: NookColors.green),
            const SizedBox(height: 16),
            Text('Order Confirmed!', textAlign: TextAlign.center, style: heading(32)),
            const SizedBox(height: 16),
            Text.rich(
              TextSpan(children: [
                const TextSpan(text: 'Your order number is: '),
                TextSpan(text: orderNumber, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
              ]),
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 18, color: NookColors.muted),
            ),
            const SizedBox(height: 16),
            const Text(
              'Thank you for your order! You will receive a confirmation email shortly.',
              textAlign: TextAlign.center,
              style: TextStyle(color: NookColors.muted),
            ),
            const SizedBox(height: 24),
            const NoticeBanner(
              title: 'Pay on collection',
              text: "You haven't been charged. Please pay in the shop when you collect your order.",
            ),
            const SizedBox(height: 24),
            FilledButton(onPressed: () => showTab(context, AppTab.home), child: const Text('Return Home')),
          ],
        ),
      ),
    );
  }
}

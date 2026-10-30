import 'package:material_ui/material_ui.dart';

import '../api.dart';
import '../basket.dart';
import '../theme.dart';
import '../widgets.dart';
import 'checkout_screen.dart';
import 'sandwich_screen.dart';

// "YYYY-MM-DD" for a date in local time
String toDateKey(DateTime date) =>
    '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';

// "30/10/2026"
String formatDate(String key) {
  final parts = key.split('-');
  return '${parts[2]}/${parts[1]}/${parts[0]}';
}

class BasketScreen extends StatefulWidget {
  const BasketScreen({super.key});

  @override
  State<BasketScreen> createState() => _BasketScreenState();
}

class _BasketScreenState extends State<BasketScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();

  // Sandwich-only orders can be collected from today. Falls back to tomorrow if the
  // server can't be reached - the server checks again when the order is placed anyway.
  String? _earliestDate;
  String? _today;
  String? _pickedDate;
  String? _pickedTime;

  // Collection slots for the chosen day: [{ time, available }]. null while loading.
  String? _slotsDate;
  List<Map<String, dynamic>>? _slots;
  String? _slotsError;
  int? _maxSandwiches;

  @override
  void initState() {
    super.initState();
    _loadEarliestDate();
    basket.addListener(_basketChanged);
  }

  @override
  void dispose() {
    basket.removeListener(_basketChanged);
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    super.dispose();
  }

  void _basketChanged() {
    setState(() {});
    if (!basket.isEmpty && _slots == null && _slotsError == null) _loadSlots();
  }

  Future<void> _loadEarliestDate() async {
    try {
      final info = await apiGet('/api/orders/earliest-date') as Map<String, dynamic>;
      final sandwiches = info['sandwiches'] as Map<String, dynamic>;
      _earliestDate = sandwiches['earliestDate'] as String;
      _today = sandwiches['today'] as String;
    } catch (_) {
      _earliestDate = toDateKey(DateTime.now().add(const Duration(days: 1)));
      _today = toDateKey(DateTime.now());
    }
    if (!mounted) return;
    setState(() {});
    _loadSlots();
  }

  // Until the customer picks a date (or if what they picked is now too early) use the earliest one
  String? get _date {
    final earliest = _earliestDate;
    final picked = _pickedDate;
    if (earliest == null) return null;
    return picked != null && picked.compareTo(earliest) >= 0 ? picked : earliest;
  }

  Future<void> _loadSlots() async {
    final date = _date;
    if (date == null || basket.isEmpty) return;
    setState(() {
      _slotsDate = date;
      _slots = null;
      _slotsError = null;
    });
    try {
      final data = await apiGet('/api/sandwiches/slots?date=$date') as Map<String, dynamic>;
      if (!mounted || _slotsDate != date) return;
      setState(() {
        _slots = (data['slots'] as List).cast<Map<String, dynamic>>();
        _maxSandwiches = data['max_sandwiches'] as int?;
      });
    } on ApiException catch (e) {
      if (!mounted || _slotsDate != date) return;
      setState(() {
        _slots = [];
        _slotsError = e.message;
      });
    }
  }

  Future<void> _chooseDate() async {
    final earliest = DateTime.parse(_earliestDate!);
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.parse(_date!),
      firstDate: earliest,
      lastDate: earliest.add(const Duration(days: 90)),
      helpText: 'Collection date',
    );
    if (picked == null) return;
    setState(() => _pickedDate = toDateKey(picked));
    _loadSlots();
  }

  bool get _tooManySandwiches => _maxSandwiches != null && basket.sandwichCount > _maxSandwiches!;

  void _proceed(String? time) {
    if (_tooManySandwiches) {
      return showMessage(context,
          'You can order up to $_maxSandwiches sandwiches online. Please remove some, or call the shop for a bigger order.');
    }
    if (_name.text.trim().isEmpty) return showMessage(context, 'Please enter your name');
    if (_email.text.trim().isEmpty) return showMessage(context, 'Please enter an email address');
    if (_phone.text.trim().isEmpty) return showMessage(context, 'Please enter a phone number');
    final date = _date;
    if (date == null) return showMessage(context, 'Please select a date');
    if (time == null) return showMessage(context, 'Please choose a collection time');

    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => CheckoutScreen(
        details: OrderDetails(
          name: _name.text.trim(),
          email: _email.text.trim(),
          phone: _phone.text.trim(),
          date: date,
          time: time,
        ),
      ),
    ));
  }

  Future<void> _confirmClear() async {
    final clear = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear your basket?'),
        content: const Text('This removes every sandwich from your basket.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Keep')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Clear')),
        ],
      ),
    );
    if (clear == true) basket.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Basket'),
        actions: [
          if (!basket.isEmpty) TextButton(onPressed: _confirmClear, child: const Text('Clear')),
        ],
      ),
      body: basket.isEmpty ? _buildEmpty(context) : _buildBasket(context),
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.shopping_basket_outlined, size: 64, color: NookColors.border),
            const SizedBox(height: 16),
            Text('Your basket is empty', style: heading(22)),
            const SizedBox(height: 8),
            const Text('Build a sandwich and it will show up here.', style: TextStyle(color: NookColors.muted)),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () =>
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SandwichScreen())),
              child: const Text('Build a Sandwich'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBasket(BuildContext context) {
    final entries = basket.entries;
    final count = basket.sandwichCount;
    final date = _date;
    final isToday = date != null && date == _today;
    final slots = _slotsDate == date ? _slots : null;
    final openSlots = (slots ?? []).where((s) => s['available'] == true).map((s) => s['time'] as String).toList();
    // Drop a picked time that isn't free on the chosen day (e.g. after changing the date)
    final time = openSlots.contains(_pickedTime) ? _pickedTime : null;
    final atLimit = _maxSandwiches != null && count >= _maxSandwiches!;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Your Order ($count item${count == 1 ? '' : 's'})', style: heading(20)),
        const SizedBox(height: 12),
        for (var i = 0; i < entries.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Panel(
              padding: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text('Sandwich', style: heading(18))),
                      IconButton(
                        tooltip: 'Edit this sandwich',
                        icon: const Icon(Icons.edit_outlined),
                        onPressed: () => Navigator.of(context)
                            .push(MaterialPageRoute(builder: (_) => SandwichScreen(editIndex: i))),
                      ),
                      IconButton(
                        tooltip: 'Remove this sandwich',
                        icon: const Icon(Icons.close),
                        onPressed: () => basket.removeAt(i),
                      ),
                    ],
                  ),
                  Text(entries[i].description, style: const TextStyle(color: Color(0xFFCCCCCC), height: 1.4)),
                  if (entries[i].notes.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text('Notes: ${entries[i].notes}', style: const TextStyle(color: NookColors.muted)),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      QuantityStepper(
                        value: entries[i].quantity,
                        onLess: entries[i].quantity > 1 ? () => basket.setQuantity(i, entries[i].quantity - 1) : null,
                        // No more once the basket has the most sandwiches allowed in one online order
                        onMore: entries[i].quantity < maxQuantity && !atLimit
                            ? () => basket.setQuantity(i, entries[i].quantity + 1)
                            : null,
                      ),
                      const Spacer(),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(money(entries[i].totalPrice), style: heading(20, color: NookColors.green)),
                          if (entries[i].quantity > 1)
                            Text('${money(entries[i].unitPrice)} each',
                                style: const TextStyle(color: NookColors.muted, fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        if (_tooManySandwiches)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(
              'You have $count sandwiches in your basket. We can take up to $_maxSandwiches in one online order - '
              'please remove some, or call the shop for a bigger order.',
              style: const TextStyle(color: NookColors.warning),
            ),
          ),
        OutlinedButton.icon(
          onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SandwichScreen())),
          icon: const Icon(Icons.add),
          label: const Text('Add Another Sandwich'),
        ),
        const SizedBox(height: 16),
        Panel(
          padding: 16,
          child: Row(
            children: [
              Text('Grand Total', style: heading(20)),
              const Spacer(),
              Text(money(basket.total), style: heading(24, color: NookColors.green)),
            ],
          ),
        ),
        const SizedBox(height: 24),

        Text('Your Details', style: heading(20)),
        const SizedBox(height: 12),
        TextField(
          controller: _name,
          textCapitalization: TextCapitalization.words,
          autofillHints: const [AutofillHints.name],
          decoration: const InputDecoration(labelText: 'Name *', hintText: 'Who is collecting?'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.email],
          decoration: const InputDecoration(labelText: 'Email *'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _phone,
          keyboardType: TextInputType.phone,
          autofillHints: const [AutofillHints.telephoneNumber],
          decoration: const InputDecoration(labelText: 'Phone *'),
        ),
        const SizedBox(height: 24),

        Text('Collection', style: heading(20)),
        const SizedBox(height: 12),
        if (date == null)
          const Text('Loading available dates...', style: TextStyle(color: NookColors.muted))
        else ...[
          OutlinedButton.icon(
            onPressed: _chooseDate,
            icon: const Icon(Icons.calendar_today, size: 18),
            label: Text(isToday ? 'Today, ${formatDate(date)}' : formatDate(date)),
          ),
          const SizedBox(height: 6),
          Text('Earliest available: ${formatDate(_earliestDate!)}',
              style: const TextStyle(color: NookColors.muted, fontSize: 13, fontStyle: FontStyle.italic)),
          const SizedBox(height: 16),
          const Text('Time *', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          if (slots == null)
            const Text('Loading collection times...', style: TextStyle(color: NookColors.muted))
          else if (_slotsError != null)
            Text(_slotsError!, style: const TextStyle(color: NookColors.warning))
          else if (openSlots.isEmpty)
            Text(
              '${isToday ? 'No collection times left today' : 'No collection times left on this day'} - please choose another date.',
              style: const TextStyle(color: NookColors.warning),
            )
          else ...[
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final slot in slots)
                  ChoiceChip(
                    label: Text(slot['available'] == true ? slot['time'] as String : '${slot['time']} (full)'),
                    selected: time == slot['time'],
                    onSelected: slot['available'] == true
                        ? (_) => setState(() => _pickedTime = slot['time'] as String)
                        : null,
                    selectedColor: Colors.white,
                    labelStyle: TextStyle(color: time == slot['time'] ? Colors.black : null),
                    showCheckmark: false,
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              isToday ? 'Collecting today - please allow us time to make it' : 'Times shown are when your sandwiches will be ready',
              style: const TextStyle(color: NookColors.muted, fontSize: 13, fontStyle: FontStyle.italic),
            ),
          ],
        ],
        const SizedBox(height: 28),
        FilledButton(
          onPressed: () => _proceed(time),
          child: const Text('Proceed to Checkout'),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

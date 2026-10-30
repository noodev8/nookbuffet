import 'package:material_ui/material_ui.dart';

import '../api.dart';
import '../basket.dart';
import '../main.dart';
import '../theme.dart';
import '../widgets.dart';
import 'buffets_screen.dart';

const maxQuantity = 50;

// "Choose 1", "Choose up to 3", "Optional - up to 2"...
String _stepHint(Map<String, dynamic> step) {
  final min = step['min_choices'] as int;
  final max = step['max_choices'] as int?;
  if (max == 1) return min == 1 ? 'Choose 1' : 'Optional - choose 1';
  if (min == 0) return max != null ? 'Optional - up to $max' : 'Optional - choose any';
  if (max == null) return min == 1 ? 'Choose at least 1' : 'Choose at least $min';
  if (min == max) return 'Choose $min';
  return 'Choose $min to $max';
}

bool _hasIncludedLimit(Map<String, dynamic> step) => step['included_choices'] != null;

// "1 included, then +£0.40 each", "+£0.40 each", or nothing when every pick is included
String? _priceHint(Map<String, dynamic> step) {
  if (!_hasIncludedLimit(step) || toPence(step['extra_choice_price']) == 0) return null;
  final each = '+${money(toDouble(step['extra_choice_price']))} each';
  return step['included_choices'] == 0 ? each : '${step['included_choices']} included, then $each';
}

// What each pick in a step adds, in pence, in menu order - the same rule the server uses.
// The first included_choices picks only cost their own extra_price.
List<int> _pickPence(Map<String, dynamic> step, List<Map<String, dynamic>> options) => [
      for (var i = 0; i < options.length; i++)
        toPence(options[i]['extra_price']) +
            (_hasIncludedLimit(step) && i >= (step['included_choices'] as int) ? toPence(step['extra_choice_price']) : 0),
    ];

class _Pick {
  const _Pick(this.step, this.option, this.pence);

  final Map<String, dynamic> step;
  final Map<String, dynamic> option;
  final int pence;
}

class SandwichScreen extends StatefulWidget {
  // Pass the basket index to edit a sandwich that's already in the basket
  const SandwichScreen({super.key, this.editIndex});

  final int? editIndex;

  @override
  State<SandwichScreen> createState() => _SandwichScreenState();
}

class _SandwichScreenState extends State<SandwichScreen> {
  Map<String, dynamic>? _menu;
  String? _error;

  final Map<int, List<int>> _selected = {}; // { stepId: [optionId, ...] }
  final Map<int, GlobalKey> _stepKeys = {};
  final _notes = TextEditingController();
  int _quantity = 1;
  bool _showMissing = false;

  bool get _editing => widget.editIndex != null;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _menu = null;
      _error = null;
    });
    try {
      final menu = await apiGet('/api/sandwiches') as Map<String, dynamic>;
      // Editing a sandwich already in the basket - put its picks back, skipping anything no longer available
      final index = widget.editIndex;
      if (index != null && index < basket.entries.length) {
        final entry = basket.entries[index];
        for (final step in _steps(menu)) {
          final ids = _options(step).map((o) => o['id'] as int).where(entry.optionIds.contains).toList();
          if (ids.isNotEmpty) _selected[step['id'] as int] = ids;
        }
        _quantity = entry.quantity;
        _notes.text = entry.notes;
      }
      if (mounted) setState(() => _menu = menu);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  List<Map<String, dynamic>> _steps(Map<String, dynamic> menu) => (menu['steps'] as List).cast<Map<String, dynamic>>();
  List<Map<String, dynamic>> _options(Map<String, dynamic> step) =>
      (step['options'] as List).cast<Map<String, dynamic>>();

  void _toggle(Map<String, dynamic> step, int optionId) {
    final stepId = step['id'] as int;
    final max = step['max_choices'] as int?;
    final current = _selected[stepId] ?? [];
    setState(() {
      if (current.contains(optionId)) {
        _selected[stepId] = current.where((id) => id != optionId).toList();
      } else if (max == 1) {
        _selected[stepId] = [optionId]; // works like a radio button
      } else if (max == null || current.length < max) {
        _selected[stepId] = [...current, optionId];
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_editing ? 'Edit Your Sandwich' : 'Build Your Sandwich')),
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    final menu = _menu;
    if (_error != null) return ErrorState(_error!, onRetry: _load);
    if (menu == null) return const LoadingState('Loading the sandwich menu...');

    final steps = _steps(menu);
    if (menu['sold_out'] == true || steps.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                menu['sold_out'] == true
                    ? 'Sorry, we have sold out of sandwiches for now.'
                    : 'Sorry, sandwiches are not available to order online right now.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 17),
              ),
              const SizedBox(height: 16),
              // Buffets are ordered by phone for now. Online ordering label: Order a Buffet Instead
              OutlinedButton(
                onPressed: () => Navigator.of(context)
                    .pushReplacement(MaterialPageRoute(builder: (_) => const BuffetsScreen())),
                child: const Text('See Our Buffets'),
              ),
            ],
          ),
        ),
      );
    }

    // Picks in menu order, each with what it adds to the price
    final picked = <_Pick>[
      for (final step in steps)
        ...() {
          final options = _options(step).where((o) => (_selected[step['id']] ?? []).contains(o['id'])).toList();
          final pence = _pickPence(step, options);
          return [for (var i = 0; i < options.length; i++) _Pick(step, options[i], pence[i])];
        }(),
    ];
    // Only so many sandwiches can be ordered online in one order, counting what's already in the basket
    final maxSandwiches = (menu['max_sandwiches'] as int?) ?? maxQuantity;
    final room = [maxQuantity, maxSandwiches - basket.sandwichesOtherThan(widget.editIndex)].reduce((a, b) => a < b ? a : b);
    final qty = _quantity.clamp(1, room < 1 ? 1 : room);
    final unitPence = toPence(menu['base_price']) + picked.fold<int>(0, (sum, p) => sum + p.pence);
    final missing = steps.where((s) => (_selected[s['id']] ?? []).length < (s['min_choices'] as int)).toList();

    void addToBasket() {
      if (room < 1) return;
      if (missing.isNotEmpty) {
        setState(() => _showMissing = true);
        final target = _stepKeys[missing.first['id']]?.currentContext;
        if (target != null) {
          Scrollable.ensureVisible(target, duration: const Duration(milliseconds: 300), alignment: 0.2);
        }
        return;
      }
      final entry = SandwichEntry(
        quantity: qty,
        optionIds: picked.map((p) => p.option['id'] as int).toList(),
        picks: picked
            .map((p) => SandwichPick(
                  stepName: p.step['name'] as String,
                  optionName: p.option['name'] as String,
                  extraPrice: p.pence / 100,
                ))
            .toList(),
        unitPence: unitPence,
        notes: _notes.text.trim(),
      );
      final index = widget.editIndex;
      if (index != null && index < basket.entries.length) {
        basket.replace(index, entry);
      } else {
        basket.add(entry);
      }
      showTab(context, AppTab.basket);
    }

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text.rich(
                TextSpan(children: [
                  const TextSpan(text: 'Build it your way, from '),
                  TextSpan(
                    text: money(toDouble(menu['base_price'])),
                    style: const TextStyle(fontWeight: FontWeight.w700, color: NookColors.green),
                  ),
                  TextSpan(
                      text: '. Collect today or another day, between ${menu['open_time']} and ${menu['close_time']}.'),
                ]),
                style: const TextStyle(color: Color(0xFFBBBBBB), fontSize: 16, height: 1.4),
              ),
              const SizedBox(height: 16),
              for (var i = 0; i < steps.length; i++)
                _buildStep(steps[i], i + 1, picked),
              _StepPanel(
                number: steps.length + 1,
                title: 'Anything else?',
                hint: 'Optional',
                child: TextField(
                  controller: _notes,
                  maxLength: 300,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Notes for the kitchen',
                    hintText: 'e.g. cut in half, no butter',
                  ),
                ),
              ),
            ],
          ),
        ),
        // Bar with the running price
        Container(
          decoration: const BoxDecoration(
            color: NookColors.surface,
            border: Border(top: BorderSide(color: NookColors.border)),
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: room < 1
                  ? Text(
                      'You already have $maxSandwiches sandwiches in your basket, the most for one online order. '
                      'For more, please call the shop.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: NookColors.warning),
                    )
                  : Row(
                      children: [
                        QuantityStepper(
                          value: qty,
                          onLess: qty > 1 ? () => setState(() => _quantity = qty - 1) : null,
                          onMore: qty < room ? () => setState(() => _quantity = qty + 1) : null,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(money(unitPence * qty / 100), style: heading(22, color: NookColors.green)),
                              if (qty > 1)
                                Text('${money(unitPence / 100)} each',
                                    style: const TextStyle(color: NookColors.muted, fontSize: 12)),
                              if (qty >= room)
                                Text('Up to $maxSandwiches per order',
                                    style: const TextStyle(color: NookColors.muted, fontSize: 12)),
                            ],
                          ),
                        ),
                        FilledButton(
                          onPressed: addToBasket,
                          style: FilledButton.styleFrom(
                            backgroundColor: NookColors.green,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                          ),
                          child: Text(_editing ? 'Update Basket' : 'Add to Basket'),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStep(Map<String, dynamic> step, int number, List<_Pick> picked) {
    final stepId = step['id'] as int;
    final max = step['max_choices'] as int?;
    final chosen = _selected[stepId] ?? [];
    final full = max != null && max > 1 && chosen.length >= max;
    final isMissing = _showMissing && chosen.length < (step['min_choices'] as int);
    final pricing = _priceHint(step);
    // Picking one more would be pick number picksBefore + 1 (a choose-1 step swaps instead)
    final picksBefore = max == 1 ? 0 : chosen.length;
    final addsExtra = _hasIncludedLimit(step) && picksBefore >= (step['included_choices'] as int);
    final description = step['description'] as String?;

    return _StepPanel(
      key: _stepKeys.putIfAbsent(stepId, GlobalKey.new),
      number: number,
      title: step['name'] as String,
      hint: pricing == null ? _stepHint(step) : '${_stepHint(step)} · $pricing',
      missing: isMissing,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (description != null && description.isNotEmpty) ...[
            Text(description, style: const TextStyle(color: Color(0xFFCCCCCC))),
            const SizedBox(height: 10),
          ],
          if (isMissing) ...[
            const Text('Please make a choice here', style: TextStyle(color: NookColors.error)),
            const SizedBox(height: 10),
          ],
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final option in _options(step))
                () {
                  final isSelected = chosen.contains(option['id']);
                  // Picked: what it adds now. Not picked: what picking it would add.
                  final extraPence = isSelected
                      ? picked.firstWhere((p) => p.option['id'] == option['id']).pence
                      : toPence(option['extra_price']) + (addsExtra ? toPence(step['extra_choice_price']) : 0);
                  return _OptionChip(
                    name: option['name'] as String,
                    description: option['description'] as String?,
                    extra: extraPence > 0 ? '+${money(extraPence / 100)}' : null,
                    selected: isSelected,
                    onTap: full && !isSelected ? null : () => _toggle(step, option['id'] as int),
                  );
                }(),
            ],
          ),
        ],
      ),
    );
  }
}

class _StepPanel extends StatelessWidget {
  const _StepPanel({
    super.key,
    required this.number,
    required this.title,
    required this.hint,
    required this.child,
    this.missing = false,
  });

  final int number;
  final String title;
  final String hint;
  final Widget child;
  final bool missing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Panel(
        borderColor: missing ? NookColors.error : NookColors.border,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: Text('$number', style: heading(16)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: heading(20)),
                      Text(hint, style: const TextStyle(color: Color(0xFF999999), fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            child,
          ],
        ),
      ),
    );
  }
}

class _OptionChip extends StatelessWidget {
  const _OptionChip({required this.name, required this.selected, this.description, this.extra, this.onTap});

  final String name;
  final String? description;
  final String? extra;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final disabled = onTap == null;
    return Semantics(
      selected: selected,
      button: true,
      child: Material(
        color: selected ? Colors.white : NookColors.background,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(6),
          side: BorderSide(color: selected ? Colors.white : NookColors.border, width: 2),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(6),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Opacity(
              opacity: disabled ? 0.4 : 1,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (selected) ...[const Icon(Icons.check, size: 16, color: Colors.black), const SizedBox(width: 4)],
                      Text(name,
                          style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                              color: selected ? Colors.black : const Color(0xFFDDDDDD))),
                      if (extra != null) ...[
                        const SizedBox(width: 6),
                        Text(extra!,
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: selected ? const Color(0xFF2E7D32) : NookColors.green)),
                      ],
                    ],
                  ),
                  if (description != null && description!.isNotEmpty)
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 220),
                      child: Text(description!,
                          style: TextStyle(fontSize: 12, color: selected ? Colors.black54 : const Color(0xFF999999))),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:material_ui/material_ui.dart';

import '../api.dart';
import '../config.dart';
import '../theme.dart';
import '../widgets.dart';

// Built-in pictures for each section, used where the admin site hasn't uploaded one
const _sectionImages = {
  'Sandwiches': ['/assets/sandwiches.png', '/assets/nook.jpg', '/assets/sandwiches2.png', '/assets/sandwiches3.png'],
  'Wraps': ['/assets/wraps.png', '/assets/wraps2.png', '/assets/wraps3.png', '/assets/wraps4.png'],
  'Savoury': ['/assets/savoury3.png', '/assets/savoury2.png', '/assets/savoury.png', '/assets/savoury4.png'],
  'Dips and Sticks': ['/assets/dips3.png', '/assets/dipsandsticks.png', '/assets/dips2.png', '/assets/dips4.png'],
  'Fruit': ['/assets/fruit5.png', '/assets/fruit3.png', '/assets/fruit.png', '/assets/fruit2.png'],
  'Cake': ['/assets/cake3.png', '/assets/cake4.png', '/assets/cake.png', '/assets/cake2.png'],
  'Continental Tray': ['/assets/savoury.png', '/assets/food2.png', '/assets/nook.jpg', '/assets/sandwiches.png'],
};
const _defaultImages = ['/assets/savoury.png', '/assets/food2.png', '/assets/nook.jpg', '/assets/sandwiches.png'];

List<String> _imagesFor(Map<String, dynamic> section) {
  final builtIn = _sectionImages[section['name']] ?? _defaultImages;
  final custom = [section['image_url'], section['image_url_2'], section['image_url_3'], section['image_url_4']];
  return [for (var i = 0; i < 4; i++) (custom[i] as String?)?.isNotEmpty == true ? custom[i] as String : builtIn[i]];
}

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  late Future<List<Map<String, dynamic>>> _sections = _load();

  // The Standard Buffet menu (buffet version 1), without the Bread section
  Future<List<Map<String, dynamic>>> _load() async {
    final sections = (await apiGet('/api/menu/buffet-version/1') as List).cast<Map<String, dynamic>>();
    return sections.where((s) => s['name'] != 'Bread').toList();
  }

  void _retry() => setState(() => _sections = _load());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Our Menu')),
      body: FutureBuilder(
        future: _sections,
        builder: (context, snapshot) {
          if (snapshot.hasError) return ErrorState('${snapshot.error}', onRetry: _retry);
          if (!snapshot.hasData) return const LoadingState('Loading the menu...');
          final sections = snapshot.data!;
          return RefreshIndicator(
            onRefresh: () async {
              _retry();
              await _sections;
            },
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (sections.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(32),
                    child: Text('No menu to show at the moment.', textAlign: TextAlign.center),
                  ),
                for (final section in sections) ...[
                  _MenuSection(section),
                  const SizedBox(height: 16),
                ],
                Panel(
                  child: Column(
                    children: [
                      Text('Ready to Order?', style: heading(22)),
                      const SizedBox(height: 8),
                      // Buffets are ordered by phone for now
                      const Text(
                        'Give us a call on $phoneDisplay to discuss your requirements and place your order.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFFCCCCCC), height: 1.4),
                      ),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: callShop,
                        icon: const Icon(Icons.phone),
                        label: const Text('Call to Order'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  const _MenuSection(this.section);

  final Map<String, dynamic> section;

  @override
  Widget build(BuildContext context) {
    final items = (section['items'] as List? ?? []).cast<Map<String, dynamic>>();
    final description = section['description'] as String?;
    return Panel(
      padding: 0,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 160,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.all(8),
              children: [
                for (final image in _imagesFor(section))
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: SizedBox(width: 210, child: NookImage(image)),
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(section['name'] as String, style: heading(24)),
                if (description != null && description.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(description, style: const TextStyle(color: NookColors.muted, height: 1.4)),
                ],
                const SizedBox(height: 8),
                for (final item in items) _MenuItem(item),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem(this.item);

  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    final description = item['description'] as String?;
    final dietary = item['dietary_info'] as String?;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Text.rich(
        TextSpan(
          children: [
            const TextSpan(text: '•  ', style: TextStyle(color: NookColors.muted)),
            TextSpan(text: item['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600)),
            if (description != null && description.isNotEmpty)
              TextSpan(text: ' - $description', style: const TextStyle(color: Color(0xFFCCCCCC))),
            if (dietary != null && dietary.isNotEmpty)
              TextSpan(text: '  $dietary', style: const TextStyle(color: NookColors.green, fontSize: 13)),
          ],
        ),
        style: const TextStyle(fontSize: 15, height: 1.4),
      ),
    );
  }
}

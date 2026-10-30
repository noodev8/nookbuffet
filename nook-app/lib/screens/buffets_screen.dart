import 'package:material_ui/material_ui.dart';

import '../api.dart';
import '../basket.dart';
import '../config.dart';
import '../theme.dart';
import '../widgets.dart';
import 'sandwich_screen.dart';

// Buffets can't be ordered online for now, so this screen just shows each buffet's menu
// and asks people to phone the shop to order one
class BuffetsScreen extends StatefulWidget {
  const BuffetsScreen({super.key});

  @override
  State<BuffetsScreen> createState() => _BuffetsScreenState();
}

class _BuffetsScreenState extends State<BuffetsScreen> {
  late Future<List<_Buffet>> _buffets = _loadBuffets();
  Map<String, dynamic>? _sandwichMenu;

  @override
  void initState() {
    super.initState();
    // Offer sandwiches too. If they have sold out the box still shows, but with no button
    apiGet('/api/sandwiches').then((menu) {
      if (mounted) setState(() => _sandwichMenu = menu as Map<String, dynamic>);
    }).catchError((_) {});
  }

  // Each buffet with its menu. A menu that fails to load just shows without its items
  Future<List<_Buffet>> _loadBuffets() async {
    final versions = (await apiGet('/api/buffet-versions') as List).cast<Map<String, dynamic>>();
    return Future.wait(versions.map((version) async {
      try {
        final menu = (await apiGet('/api/menu/buffet-version/${version['id']}') as List).cast<Map<String, dynamic>>();
        return _Buffet(version, menu);
      } catch (_) {
        return _Buffet(version, const []);
      }
    }));
  }

  @override
  Widget build(BuildContext context) {
    final sandwichMenu = _sandwichMenu;
    return Scaffold(
      appBar: AppBar(title: const Text('Our Buffets')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('See what comes in each buffet', style: TextStyle(color: NookColors.muted, fontSize: 16)),
          const SizedBox(height: 16),
          NoticeBanner(
            title: 'Call to order a buffet',
            text: "Buffets can't be ordered online at the moment. Give us a call on $phoneDisplay and we'll sort it for you.",
            action: FilledButton.icon(onPressed: callShop, icon: const Icon(Icons.phone), label: const Text('Call $phoneDisplay')),
          ),
          if (sandwichMenu != null) ...[
            const SizedBox(height: 16),
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Just want a sandwich?', style: heading(20)),
                  const SizedBox(height: 4),
                  Text(
                    'Build your own from ${money(toDouble(sandwichMenu['base_price']))}. '
                    '${sandwichMenu['sold_out'] == true ? "We've sold out for now - please check back soon." : 'Collect it today between ${sandwichMenu['open_time']} and ${sandwichMenu['close_time']}.'}',
                    style: const TextStyle(color: Color(0xFFCCCCCC), height: 1.4),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: sandwichMenu['sold_out'] == true
                        ? const OutlinedButton(onPressed: null, child: Text('Sold Out'))
                        : FilledButton(
                            onPressed: () => Navigator.of(context)
                                .push(MaterialPageRoute(builder: (_) => const SandwichScreen())),
                            child: const Text('Build a Sandwich'),
                          ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          FutureBuilder(
            future: _buffets,
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return ErrorState('${snapshot.error}', onRetry: () => setState(() => _buffets = _loadBuffets()));
              }
              if (!snapshot.hasData) return const LoadingState('Loading buffets...');
              if (snapshot.data!.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.all(32),
                  child: Text('No buffets to show at the moment.', textAlign: TextAlign.center),
                );
              }
              return Column(
                children: [
                  for (final buffet in snapshot.data!)
                    Padding(padding: const EdgeInsets.only(bottom: 16), child: _BuffetCard(buffet)),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _Buffet {
  const _Buffet(this.version, this.menu);

  final Map<String, dynamic> version;
  final List<Map<String, dynamic>> menu;
}

class _BuffetCard extends StatelessWidget {
  const _BuffetCard(this.buffet);

  final _Buffet buffet;

  @override
  Widget build(BuildContext context) {
    final version = buffet.version;
    final description = version['description'] as String?;
    final sections = buffet.menu.where((s) => (s['items'] as List? ?? []).isNotEmpty);
    return Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: Text(version['title'] as String, style: heading(24))),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(money(toDouble(version['price_per_person'])), style: heading(24, color: NookColors.green)),
                  const Text('per person', style: TextStyle(color: NookColors.muted, fontSize: 13)),
                ],
              ),
            ],
          ),
          if (description != null && description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(description, style: const TextStyle(color: Color(0xFFCCCCCC), height: 1.4)),
          ],
          for (final section in sections) ...[
            const SizedBox(height: 16),
            Text(section['name'] as String, style: heading(17, color: NookColors.muted)),
            const SizedBox(height: 4),
            for (final item in (section['items'] as List).cast<Map<String, dynamic>>())
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Text.rich(TextSpan(children: [
                  TextSpan(text: '•  ${item['name']}'),
                  if ((item['dietary_info'] as String?)?.isNotEmpty == true)
                    TextSpan(
                      text: '  ${item['dietary_info']}',
                      style: const TextStyle(color: NookColors.green, fontSize: 13),
                    ),
                ])),
              ),
          ],
        ],
      ),
    );
  }
}

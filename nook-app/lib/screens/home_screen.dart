import 'package:material_ui/material_ui.dart';

import '../api.dart';
import '../theme.dart';
import '../widgets.dart';
import 'buffets_screen.dart';
import 'sandwich_screen.dart';

const _infoCards = [
  ('01', 'Custom Buffets',
      'Build your perfect buffet with premium meats, fresh vegetables, artisan breads, and gourmet cheeses.'),
  ('02', 'Professional Service',
      'White-glove setup and service that respects your workspace and schedule requirements.'),
  ('03', 'Fresh Daily', 'All ingredients sourced and prepared fresh every morning for maximum quality and taste.'),
];

const _gallery = ['/assets/fullbuffet1.png', '/assets/fullbuffet2.png', '/assets/savoury3.png', '/assets/dips3.png'];

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _sandwichMenu;
  bool _buffetsSoldOut = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  // Offer sandwiches whenever the menu loads. If they have sold out the card still shows,
  // so people know sandwiches are generally on offer, but it can't be tapped.
  // Buffets show as sold out only when every buffet has sold out.
  Future<void> _load() async {
    try {
      final menu = await apiGet('/api/sandwiches') as Map<String, dynamic>;
      if (mounted) setState(() => _sandwichMenu = menu);
    } catch (_) {}
    try {
      final versions = (await apiGet('/api/buffet-versions') as List).cast<Map<String, dynamic>>();
      if (mounted) {
        setState(() => _buffetsSoldOut = versions.isNotEmpty && versions.every((v) => v['sold_out'] == true));
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final sandwichMenu = _sandwichMenu;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // Hero
          SizedBox(
            height: 560,
            child: Stack(
              fit: StackFit.expand,
              children: [
                const NookImage('/assets/nook.jpg'),
                Container(color: Colors.black.withValues(alpha: 0.6)),
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            ClipOval(child: Image.asset('assets/images/logo.jpg', width: 40, height: 40)),
                            const SizedBox(width: 10),
                            Text('The Nook Buffet', style: heading(18)),
                          ],
                        ),
                        const Spacer(),
                        Text('THE LITTLE\nNOOK BUFFET',
                            textAlign: TextAlign.center, style: heading(44).copyWith(height: 1.1, letterSpacing: 2)),
                        const SizedBox(height: 12),
                        Text(
                          'Fresh sandwiches made your way, and buffets for the whole office',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 17, color: Colors.white.withValues(alpha: 0.9)),
                        ),
                        const SizedBox(height: 28),
                        Text('What would you like to order?', style: heading(20)),
                        const SizedBox(height: 14),
                        if (sandwichMenu != null) ...[
                          _OrderChoice(
                            title: 'Order a Sandwich',
                            button: 'Build a Sandwich',
                            primary: true,
                            soldOut: sandwichMenu['sold_out'] == true,
                            onTap: () => Navigator.of(context)
                                .push(MaterialPageRoute(builder: (_) => const SandwichScreen())),
                          ),
                          const SizedBox(height: 12),
                        ],
                        _OrderChoice(
                          title: 'Order a Buffet',
                          // Buffets are ordered by phone for now. Online ordering button: 'Choose a Buffet'
                          button: 'See Our Buffets',
                          soldOut: _buffetsSoldOut,
                          onTap: () =>
                              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const BuffetsScreen())),
                        ),
                        const Spacer(),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Info cards
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                for (final (number, title, text) in _infoCards)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Panel(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(number, style: heading(32, color: NookColors.border)),
                          const SizedBox(height: 4),
                          Text(title, style: heading(20)),
                          const SizedBox(height: 6),
                          Text(text, style: const TextStyle(color: Color(0xFFCCCCCC), height: 1.4)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Gallery
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Our Creations', style: heading(26)),
                const SizedBox(height: 12),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  children: [
                    for (final image in _gallery)
                      ClipRRect(borderRadius: BorderRadius.circular(8), child: NookImage(image)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderChoice extends StatelessWidget {
  const _OrderChoice({
    required this.title,
    required this.button,
    required this.onTap,
    this.primary = false,
    this.soldOut = false,
  });

  final String title;
  final String button;
  final VoidCallback onTap;
  final bool primary;
  final bool soldOut;

  @override
  Widget build(BuildContext context) {
    final filled = primary && !soldOut;
    final foreground = filled ? Colors.black : (soldOut ? Colors.white60 : Colors.white);
    return Material(
      color: filled ? Colors.white : Colors.black.withValues(alpha: 0.4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: soldOut ? Colors.white30 : Colors.white, width: 2),
      ),
      child: InkWell(
        onTap: soldOut ? null : onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            children: [
              Expanded(child: Text(title, style: heading(20, color: foreground))),
              Text(soldOut ? 'Sold Out' : '$button →',
                  style: TextStyle(color: foreground, fontWeight: FontWeight.w600, fontSize: 15)),
            ],
          ),
        ),
      ),
    );
  }
}

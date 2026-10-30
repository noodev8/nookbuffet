import 'package:material_ui/material_ui.dart';

import '../config.dart';
import '../theme.dart';
import '../widgets.dart';

const _standardBuffet = [
  '1 Sandwich',
  'Half a Wrap',
  '2 Small Sausage Rolls',
  'Quiche',
  'Pork Pie',
  'Scotch Egg',
  'Small Cocktail Sausages',
  'Breadsticks/Bruschetta',
  'Selection of Dips',
  'Veg Sticks/Salad',
  'Mixed Fruit',
  'A Piece of Cake',
];

const _hours = [
  ('Monday', '10:00 - 15:00'),
  ('Tuesday', '10:00 - 15:00'),
  ('Wednesday', '10:00 - 15:00'),
  ('Thursday', '10:00 - 15:00'),
  ('Friday', '10:00 - 15:00'),
  ('Saturday', '10:00 - 15:00'),
  ('Sunday', 'Closed'),
];

const _body = TextStyle(color: Color(0xFFCCCCCC), fontSize: 15, height: 1.5);

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('About Us')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('About The Little Nook Buffet', style: heading(26)),
          const SizedBox(height: 12),
          const Text(
            "Welcome to The Little Nook Buffet, where we specialize in creating exceptional workplace dining experiences "
            "with fresh, customisable sandwich buffets. We're passionate about bringing quality, convenience, and flavor "
            'directly to your office or event.',
            style: _body,
          ),
          const SizedBox(height: 20),
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('How We Work', style: heading(20)),
                const SizedBox(height: 8),
                const _Point('Easy Ordering',
                    'Place your orders before 4pm for next-day collection. We believe in giving you the freshest experience possible, which is why we prepare everything the morning of your order.'),
                const _Point('Collection',
                    "Pick your order up from our Welshpool location on the day you've chosen, freshly prepared and ready to go."),
                const _Point('Fresh & Quality',
                    'Every sandwich buffet is crafted with the freshest ingredients, sourced locally where possible. From premium meats and breads to crisp veg sticks and gourmet cheeses, we never compromise on quality. Our team prepares everything fresh each morning to ensure maximum taste and nutritional value.'),
                const _Point('Perfect for',
                    'Office meetings, corporate events, team lunches, training sessions, or any occasion where you want to impress with quality food that brings people together.'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("What's Included in a Standard Buffet", style: heading(20)),
                const SizedBox(height: 4),
                Text('Per person - £10.90', style: heading(17, color: NookColors.green)),
                const SizedBox(height: 8),
                const Text(
                  'Each person receives the following items. Order for 10 people? You get 10 times everything below. '
                  'Order for 100? You get 100 times everything!',
                  style: _body,
                ),
                const SizedBox(height: 8),
                for (final item in _standardBuffet)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Text('•  $item', style: const TextStyle(fontSize: 15)),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Contact Hours', style: heading(20)),
                const SizedBox(height: 8),
                for (final (day, time) in _hours)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Expanded(child: Text(day)),
                        Text(time, style: const TextStyle(color: NookColors.muted)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Where to Find Us', style: heading(20)),
                const SizedBox(height: 8),
                const Text('42 High Street\nWelshpool SY21 7JQ\nWales', style: _body),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    OutlinedButton.icon(
                      onPressed: callShop,
                      icon: const Icon(Icons.phone, size: 18),
                      label: const Text(phoneDisplay),
                    ),
                    OutlinedButton.icon(
                      onPressed: () => openLink(facebookUrl),
                      icon: const Icon(Icons.facebook, size: 18),
                      label: const Text('Facebook'),
                    ),
                    OutlinedButton.icon(
                      onPressed: () => openLink(instagramUrl),
                      icon: const Icon(Icons.camera_alt_outlined, size: 18),
                      label: const Text('Instagram'),
                    ),
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

class _Point extends StatelessWidget {
  const _Point(this.title, this.text);

  final String title;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Text.rich(
        TextSpan(children: [
          TextSpan(text: '$title: ', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          TextSpan(text: text),
        ]),
        style: _body,
      ),
    );
  }
}

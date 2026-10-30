import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

import 'api.dart';
import 'config.dart';
import 'theme.dart';

Future<void> openLink(String url) => launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);

Future<void> callShop() => openLink(phoneLink);

void showMessage(BuildContext context, String message) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));
}

// A picture from the menu: bundled with the app ('/assets/...') or uploaded to the server ('/uploads/...')
class NookImage extends StatelessWidget {
  const NookImage(this.url, {super.key, this.fit = BoxFit.cover});

  final String url;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    Widget fallback(BuildContext context, Object error, StackTrace? stack) =>
        Container(color: NookColors.surfaceRaised);
    return isUploaded(url)
        ? Image.network(uploadedUrl(url), fit: fit, errorBuilder: fallback)
        : Image.asset(assetPath(url), fit: fit, errorBuilder: fallback);
  }
}

class LoadingState extends StatelessWidget {
  const LoadingState(this.message, {super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(color: Colors.white),
            const SizedBox(height: 16),
            Text(message, style: const TextStyle(color: NookColors.muted)),
          ],
        ),
      ),
    );
  }
}

class ErrorState extends StatelessWidget {
  const ErrorState(this.message, {super.key, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, textAlign: TextAlign.center, style: const TextStyle(color: NookColors.error, fontSize: 16)),
            const SizedBox(height: 16),
            OutlinedButton(onPressed: onRetry, child: const Text('Try Again')),
          ],
        ),
      ),
    );
  }
}

// The dark rounded box most content sits in. It's a Material so tap ripples inside it show.
class Panel extends StatelessWidget {
  const Panel({super.key, required this.child, this.borderColor = NookColors.border, this.padding = 20});

  final Widget child;
  final Color borderColor;
  final double padding;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: NookColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: borderColor),
      ),
      clipBehavior: Clip.antiAlias,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(padding),
        child: child,
      ),
    );
  }
}

// A highlighted notice, like "Pay on collection" or "Call to order a buffet"
class NoticeBanner extends StatelessWidget {
  const NoticeBanner({super.key, required this.title, required this.text, this.color = NookColors.green, this.action});

  final String title;
  final String text;
  final Color color;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color, width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: heading(18, color: color)),
          const SizedBox(height: 4),
          Text(text, style: const TextStyle(fontSize: 15, height: 1.4)),
          if (action != null) ...[const SizedBox(height: 12), action!],
        ],
      ),
    );
  }
}

// − 3 + quantity picker
class QuantityStepper extends StatelessWidget {
  const QuantityStepper({super.key, required this.value, this.onLess, this.onMore});

  final int value;
  final VoidCallback? onLess;
  final VoidCallback? onMore;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: NookColors.border, width: 2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(onPressed: onLess, icon: const Icon(Icons.remove), tooltip: 'One less'),
          SizedBox(
            width: 28,
            child: Text('$value', textAlign: TextAlign.center, style: heading(18)),
          ),
          IconButton(onPressed: onMore, icon: const Icon(Icons.add), tooltip: 'One more'),
        ],
      ),
    );
  }
}

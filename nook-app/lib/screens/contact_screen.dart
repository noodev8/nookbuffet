import 'package:material_ui/material_ui.dart';

import '../api.dart';
import '../config.dart';
import '../theme.dart';
import '../widgets.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _subject = TextEditingController();
  final _message = TextEditingController();

  bool _sending = false;
  String? _sent;
  String? _error;

  @override
  void dispose() {
    for (final controller in [_name, _email, _phone, _subject, _message]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _send() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _sending = true;
      _sent = null;
      _error = null;
    });
    try {
      final result = await apiPost('/api/contact', {
        'name': _name.text.trim(),
        'email': _email.text.trim(),
        'phone': _phone.text.trim(),
        'subject': _subject.text.trim(),
        'message': _message.text.trim(),
      }) as Map<String, dynamic>;
      _formKey.currentState!.reset();
      for (final controller in [_name, _email, _phone, _subject, _message]) {
        controller.clear();
      }
      setState(() => _sent = result['message'] as String? ?? "Thanks - we'll get back to you soon.");
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  String? _required(String? value, String message) => (value ?? '').trim().isEmpty ? message : null;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Get In Touch')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            "Have a question about our buffet services? Want to discuss your catering needs? We'd love to hear from you! "
            "Send us a message and we'll get back to you as soon as possible.",
            style: TextStyle(color: Color(0xFFCCCCCC), fontSize: 15, height: 1.5),
          ),
          const SizedBox(height: 20),
          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _name,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(labelText: 'Name *', hintText: 'Your full name'),
                  validator: (v) => _required(v, 'Please enter your name'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email *', hintText: 'your.email@example.com'),
                  validator: (v) => _required(v, 'Please enter your email'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Phone'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _subject,
                  decoration:
                      const InputDecoration(labelText: 'Subject', hintText: 'Brief description of your inquiry'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _message,
                  minLines: 4,
                  maxLines: 8,
                  decoration: const InputDecoration(
                    labelText: 'Message *',
                    hintText: 'Tell us about your event, dietary requirements, number of people...',
                    alignLabelWithHint: true,
                  ),
                  validator: (v) => _required(v, 'Please enter a message'),
                ),
              ],
            ),
          ),
          if (_sent != null) ...[
            const SizedBox(height: 16),
            Text(_sent!, style: const TextStyle(color: NookColors.green)),
          ],
          if (_error != null) ...[
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: NookColors.error)),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _sending ? null : _send,
            child: Text(_sending ? 'Sending...' : 'Send Message'),
          ),
          const SizedBox(height: 28),
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.phone),
                  title: const Text('Phone'),
                  subtitle: const Text('+44 7551 428162'),
                  onTap: callShop,
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.mail_outline),
                  title: const Text('Email'),
                  subtitle: const Text(shopEmail),
                  onTap: () => openLink('mailto:$shopEmail'),
                ),
                const ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.place_outlined),
                  title: Text('Location'),
                  subtitle: Text('Welshpool, Powys, Wales'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

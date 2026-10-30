import 'dart:convert';

import 'package:http/http.dart' as http;

import 'config.dart';

// Every server reply looks like { return_code: 'SUCCESS', data: ..., message: ... }.
// Anything other than SUCCESS throws an ApiException carrying the server's message.
class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

const _timeout = Duration(seconds: 15);

Future<dynamic> apiGet(String path) async {
  final http.Response response;
  try {
    response = await http.get(Uri.parse('$apiUrl$path')).timeout(_timeout);
  } catch (_) {
    throw ApiException('Could not reach the shop. Please check your connection and try again.');
  }
  return _unwrap(response);
}

Future<dynamic> apiPost(String path, Map<String, dynamic> body) async {
  final http.Response response;
  try {
    response = await http
        .post(
          Uri.parse('$apiUrl$path'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(body),
        )
        .timeout(_timeout);
  } catch (_) {
    throw ApiException('Could not reach the shop. Please check your connection and try again.');
  }
  return _unwrap(response);
}

dynamic _unwrap(http.Response response) {
  final Map<String, dynamic> json;
  try {
    json = jsonDecode(response.body) as Map<String, dynamic>;
  } catch (_) {
    throw ApiException('Something went wrong. Please try again.');
  }
  if (json['return_code'] != 'SUCCESS') {
    throw ApiException(json['message'] as String? ?? 'Something went wrong. Please try again.');
  }
  // Some replies (like the contact form) only have a message
  return json['data'] ?? json;
}

// Pictures uploaded through the admin site live on the server as '/uploads/<file>'.
// Built-in pictures are '/assets/<file>' on the website, bundled into the app as assets/images/<file>.
bool isUploaded(String? url) => url != null && url.startsWith('/uploads/');
String uploadedUrl(String url) => '$apiUrl$url';
String assetPath(String url) => 'assets/images/${url.split('/').last}';

// The server sends prices as strings ("5.50") or numbers
double toDouble(dynamic value) => value is num ? value.toDouble() : double.tryParse('$value') ?? 0;
int toPence(dynamic value) => (toDouble(value) * 100).round();

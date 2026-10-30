import 'package:flutter/foundation.dart';

// The server (nook-server). Pass a different one with
//   flutter run --dart-define=API_URL=https://api.example.com
// Without it, the Android emulator reaches the computer it runs on at 10.0.2.2,
// and everything else (Chrome, iOS simulator) uses localhost.
const _apiUrlOverride = String.fromEnvironment('API_URL');

String get apiUrl {
  if (_apiUrlOverride.isNotEmpty) return _apiUrlOverride;
  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) return 'http://10.0.2.2:3013';
  return 'http://localhost:3013';
}

// Shop details, the same as the website shows
const phoneDisplay = '07551 428162';
const phoneLink = 'tel:+447551428162';
const shopEmail = 'nookbuffet@gmail.com';
const facebookUrl = 'https://www.facebook.com/profile.php?id=61555788602413';
const instagramUrl = 'https://www.instagram.com/_thenooksandwichbar/';

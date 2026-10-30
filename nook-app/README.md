Nook App

The customer phone app for Nook Buffet. It does the same job as the customer website (nook-web): browse the menu, build a sandwich, pick a collection time and place the order. Front end only - it talks to nook-server for everything.


WHAT IT DOES

Customers build their own sandwich (bread, fillings, sauce...), pick a collection date and slot, and place the order. The opening hours, slot length and notice needed come from the admin portal, the same as the website.

Buffets are ordered by phone for now, the same as the website. The buffets screen shows each buffet's menu with a button to call the shop. Online buffet ordering isn't in the app yet.

Customer accounts aren't in the app - every order goes through as a guest, the same as the website while accounts are hidden.

No payment is taken. Customers pay on collection.

The basket is saved on the phone, so it's still there if the app is closed.


TECH

  - Flutter (stable channel) and Dart
  - material_ui for the Material widgets (Material moved out of the Flutter SDK into its own package)
  - http, shared_preferences, url_launcher, google_fonts


GETTING STARTED

  cd nook-app
  flutter pub get

The server (nook-server) needs to be running. By default the app uses:

  Android emulator     http://10.0.2.2:3013   (the emulator's name for your computer)
  Chrome / iOS sim     http://localhost:3013

To point it somewhere else (e.g. the live server or a real phone on your Wi-Fi):

  flutter run --dart-define=API_URL=https://your-server

  flutter run              - run on a connected phone or emulator
  flutter run -d chrome    - run in Chrome
  flutter test             - run the tests
  flutter analyze          - check the code
  flutter build apk        - Android release build

Running in Chrome: the server only accepts browser requests from the addresses in CORS_ORIGIN in nook-server/.env. Pin the port with "flutter run -d chrome --web-port 3005" and add http://localhost:3005 to CORS_ORIGIN. Phone apps aren't affected by this.

Android release builds talk to the server over https only. The debug build is allowed plain http so it can reach the local server.


SCREENS

  Home        - Order a Sandwich / Order a Buffet, plus the info cards and photos
  Menu        - The Standard Buffet menu, with a call-to-order button
  Buffets     - Each buffet's menu, with a banner to call and order
  Sandwich    - Build your own sandwich and add it to the basket (also used to edit one)
  Basket      - Change quantities, enter your details, pick a collection date and time
  Checkout    - Check everything and place the order (pay on collection)
  Confirmed   - Order number and pay-on-collection reminder
  About       - How we work, what's in a buffet, hours and where to find us
  Contact     - Contact form, phone and email


CODE

  lib/main.dart       - App start and the bottom tabs
  lib/config.dart     - Server address and shop details (phone, email, social links)
  lib/api.dart        - Talking to nook-server
  lib/basket.dart     - The basket, saved in the same shape the website uses
  lib/theme.dart      - Colours and fonts (matches the website)
  lib/widgets.dart    - Shared bits: panels, banners, loading and error states
  lib/screens/        - One file per screen

Sandwich prices are worked out the same way as the website and the server. The server works out the real price again when the order is placed.

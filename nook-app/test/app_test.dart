import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:nook_app/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    // Tests can't download fonts - fall back to the default ones
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  testWidgets('opens on the home screen and every tab works', (tester) async {
    await tester.pumpWidget(const NookApp());
    await tester.pump();

    expect(find.text('THE LITTLE\nNOOK BUFFET'), findsOneWidget);
    expect(find.text('Order a Buffet'), findsOneWidget);

    await tester.tap(find.text('Basket'));
    await tester.pumpAndSettle();
    expect(find.text('Your basket is empty'), findsOneWidget);

    await tester.tap(find.text('About'));
    await tester.pumpAndSettle();
    expect(find.text('About The Little Nook Buffet'), findsOneWidget);

    await tester.tap(find.text('Contact'));
    await tester.pumpAndSettle();
    expect(find.text('Get In Touch'), findsOneWidget);
  });
}

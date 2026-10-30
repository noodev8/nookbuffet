import 'package:material_ui/material_ui.dart';
import 'package:google_fonts/google_fonts.dart';

// The website's look: black and dark grey, white text, green for prices and "go" buttons,
// Oswald for headings and Source Sans for everything else
class NookColors {
  static const background = Color(0xFF000000);
  static const surface = Color(0xFF1A1A1A);
  static const surfaceRaised = Color(0xFF242424);
  static const border = Color(0xFF444444);
  static const muted = Color(0xFFAAAAAA);
  static const green = Color(0xFF4CAF50);
  static const error = Color(0xFFFF6B6B);
  static const warning = Color(0xFFFF6B35);
}

TextStyle heading(double size, {Color color = Colors.white}) =>
    GoogleFonts.oswald(fontSize: size, fontWeight: FontWeight.w600, color: color, letterSpacing: 0.5);

ThemeData buildTheme() {
  final base = ThemeData(
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: Colors.white,
      onPrimary: Colors.black,
      secondary: NookColors.green,
      onSecondary: Colors.white,
      surface: NookColors.surface,
      onSurface: Colors.white,
      error: NookColors.error,
    ),
    scaffoldBackgroundColor: NookColors.background,
  );

  return base.copyWith(
    textTheme: GoogleFonts.sourceSans3TextTheme(base.textTheme),
    appBarTheme: AppBarTheme(
      backgroundColor: NookColors.background,
      foregroundColor: Colors.white,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: heading(20),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: NookColors.surface,
      indicatorColor: Colors.white,
      iconTheme: WidgetStateProperty.resolveWith((states) => IconThemeData(
            color: states.contains(WidgetState.selected) ? Colors.black : NookColors.muted,
          )),
      labelTextStyle: WidgetStateProperty.resolveWith((states) => GoogleFonts.sourceSans3(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: states.contains(WidgetState.selected) ? Colors.white : NookColors.muted,
          )),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        disabledBackgroundColor: NookColors.border,
        minimumSize: const Size(0, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        textStyle: GoogleFonts.oswald(fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: 0.5),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        side: const BorderSide(color: NookColors.border, width: 2),
        minimumSize: const Size(0, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        textStyle: GoogleFonts.oswald(fontSize: 16, fontWeight: FontWeight.w500, letterSpacing: 0.5),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: NookColors.background,
      labelStyle: const TextStyle(color: NookColors.muted),
      hintStyle: const TextStyle(color: Color(0xFF777777)),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: NookColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Colors.white, width: 2),
      ),
    ),
    snackBarTheme: const SnackBarThemeData(behavior: SnackBarBehavior.floating),
    dividerTheme: const DividerThemeData(color: NookColors.border, space: 1),
  );
}

import 'package:material_ui/material_ui.dart';

import 'basket.dart';
import 'screens/about_screen.dart';
import 'screens/basket_screen.dart';
import 'screens/contact_screen.dart';
import 'screens/home_screen.dart';
import 'screens/menu_screen.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await basket.load();
  runApp(const NookApp());
}

class NookApp extends StatelessWidget {
  const NookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'The Nook Buffet',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const AppShell(),
    );
  }
}

// Which bottom tab is showing. Other screens set it, e.g. to jump to the basket after adding a sandwich.
enum AppTab { home, menu, basket, about, contact }

final currentTab = ValueNotifier(AppTab.home);

void showTab(BuildContext context, AppTab tab) {
  Navigator.of(context).popUntil((route) => route.isFirst);
  currentTab.value = tab;
}

class AppShell extends StatelessWidget {
  const AppShell({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: currentTab,
      builder: (context, tab, _) => Scaffold(
        body: IndexedStack(
          index: tab.index,
          children: const [HomeScreen(), MenuScreen(), BasketScreen(), AboutScreen(), ContactScreen()],
        ),
        bottomNavigationBar: ListenableBuilder(
          listenable: basket,
          builder: (context, _) => NavigationBar(
            selectedIndex: tab.index,
            onDestinationSelected: (i) => currentTab.value = AppTab.values[i],
            destinations: [
              const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
              const NavigationDestination(
                  icon: Icon(Icons.restaurant_menu_outlined), selectedIcon: Icon(Icons.restaurant_menu), label: 'Menu'),
              NavigationDestination(
                icon: Badge(
                  isLabelVisible: !basket.isEmpty,
                  label: Text('${basket.sandwichCount}'),
                  child: const Icon(Icons.shopping_basket_outlined),
                ),
                selectedIcon: Badge(
                  isLabelVisible: !basket.isEmpty,
                  label: Text('${basket.sandwichCount}'),
                  child: const Icon(Icons.shopping_basket),
                ),
                label: 'Basket',
              ),
              const NavigationDestination(icon: Icon(Icons.info_outline), selectedIcon: Icon(Icons.info), label: 'About'),
              const NavigationDestination(icon: Icon(Icons.mail_outline), selectedIcon: Icon(Icons.mail), label: 'Contact'),
            ],
          ),
        ),
      ),
    );
  }
}

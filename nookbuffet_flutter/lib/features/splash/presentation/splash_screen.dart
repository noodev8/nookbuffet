/*
Animated Gradient Splash Screen for Nook Buffet Flutter Application
Features elegant "The Nook" lettering with Black-to-Grey-to-Light Grey gradient background
Dual animation system with fade-in and elastic scale effects
Responsive typography with multiple shadow layers for depth
Transparent status bar and smooth transitions
*/

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../config/app_config.dart';
import '../../welcome/presentation/welcome_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _titleFadeAnimation;
  late Animation<double> _underlineFadeAnimation;
  late Animation<double> _taglineFadeAnimation;

  @override
  void initState() {
    super.initState();

    // Set transparent status bar for full-screen effect
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
    );

    // Initialize dual animation system for polished splash experience
    _animationController = AnimationController(
      duration: AppConfig.splashAnimationDuration, // 1.2 seconds
      vsync: this,
    );

    // Fade-in animation: 0 to 100% opacity over 1.2 seconds with smooth curve
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeIn, // Smoother fade-in effect
    ));

    // Scale animation: 80% to 100% size with elastic bounce effect
    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));

    // Staggered fade animations for dramatic effect
    _titleFadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 0.7, curve: Curves.easeInOut), // Title fades in first
    ));

    _underlineFadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.4, 0.9, curve: Curves.easeInOut), // Underline follows
    ));

    _taglineFadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.6, 1.0, curve: Curves.easeInOut), // Tagline last
    ));

    // Start animations and navigate after splash duration
    _startSplashSequence();
  }

  void _startSplashSequence() async {
    // Longer delay to ensure you can see the fade-in effect clearly
    await Future.delayed(const Duration(milliseconds: 800));

    // Start the elegant lettering fade-in animation
    print('Starting fade-in animation...');
    _animationController.forward();

    // Wait for splash duration then navigate to welcome screen
    await Future.delayed(AppConfig.splashDuration);

    if (mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              const WelcomeScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
          transitionDuration: AppConfig.animationMedium,
        ),
      );
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Responsive design: detect tablet vs mobile
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth > AppConfig.tabletBreakpoint;

    return Scaffold(
      // Full-screen gradient background with Black-to-Grey-to-Light Grey
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppConfig.splashGradient,
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Elegant "The Nook" lettering with staggered fade-in animation
              Expanded(
                flex: 4,
                child: Center(
                  child: AnimatedBuilder(
                    animation: _animationController,
                    builder: (context, child) {
                      return ScaleTransition(
                        scale: _scaleAnimation,
                        child: _buildElegantLettering(isTablet),
                      );
                    },
                  ),
                ),
              ),

              // Loading indicator with smooth fade
              Expanded(
                flex: 1,
                child: AnimatedBuilder(
                  animation: _fadeAnimation,
                  builder: (context, child) {
                    return Opacity(
                      opacity: _fadeAnimation.value * 0.7,
                      child: _buildLoadingSection(),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildElegantLettering(bool isTablet) {
    // Responsive font sizing for elegant lettering
    final mainFontSize = isTablet ? 72.0 : 56.0;
    final letterSpacing = isTablet ? 8.0 : 6.0;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Main "The Nook" lettering with staggered fade-in
        AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Opacity(
              opacity: _titleFadeAnimation.value,
              child: Transform.scale(
                scale: 0.8 + (_titleFadeAnimation.value * 0.2), // Slight scale effect
                child: Text(
                  'The Nook',
                  style: TextStyle(
                    fontSize: mainFontSize,
                    fontWeight: FontWeight.w300, // Light weight for elegance
                    color: AppConfig.primaryWhite,
                    letterSpacing: letterSpacing,
                    height: 1.1,
                    shadows: [
                      // Multiple shadows for depth and elegance
                      Shadow(
                        color: AppConfig.primaryBlack.withValues(alpha: 0.8),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                      Shadow(
                        color: AppConfig.primaryBlack.withValues(alpha: 0.4),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          },
        ),

        const SizedBox(height: AppConfig.spacingM),

        // Subtle underline decoration with delayed fade-in
        AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Opacity(
              opacity: _underlineFadeAnimation.value,
              child: Container(
                width: isTablet ? 200 : 150,
                height: 2,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.transparent,
                      AppConfig.primaryWhite.withValues(alpha: 0.6),
                      Colors.transparent,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(1),
                ),
              ),
            );
          },
        ),

        const SizedBox(height: AppConfig.spacingL),

        // Elegant tagline with final fade-in
        AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Opacity(
              opacity: _taglineFadeAnimation.value,
              child: Text(
                'Buffet Excellence',
                style: TextStyle(
                  fontSize: isTablet ? 20 : 16,
                  fontWeight: FontWeight.w200,
                  color: AppConfig.primaryWhite.withValues(alpha: 0.8),
                  letterSpacing: isTablet ? 4.0 : 3.0,
                  shadows: [
                    Shadow(
                      color: AppConfig.primaryBlack.withValues(alpha: 0.6),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                textAlign: TextAlign.center,
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildLoadingSection() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Loading indicator
        const SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(AppConfig.primaryWhite),
          ),
        ),
        
        const SizedBox(height: AppConfig.spacingM),
        
        // Loading text
        Text(
          'Preparing your experience...',
          style: AppConfig.bodySmall.copyWith(
            color: AppConfig.primaryWhite.withValues(alpha: 0.6),
            fontSize: 12,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

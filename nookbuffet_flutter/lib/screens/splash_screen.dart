/*
Splash Screen for Nook Buffet App
Shows the app logo and branding while the app initializes
Provides a smooth transition to the main app experience
*/

import 'package:flutter/material.dart';
import '../config/app_config.dart';
import 'welcome_screen.dart';

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

  @override
  void initState() {
    super.initState();
    
    // Initialize animations
    _animationController = AnimationController(
      duration: AppConfig.animationSlow,
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));

    // Start animation and navigate after delay
    _startSplashSequence();
  }

  void _startSplashSequence() async {
    // Start the animation
    _animationController.forward();

    // Wait for splash duration
    await Future.delayed(const Duration(seconds: 5));

    // Navigate to welcome screen
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
    return Scaffold(
      backgroundColor: AppConfig.primaryColor,
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppConfig.primaryGradient,
        ),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Animated logo
                AnimatedBuilder(
                  animation: _animationController,
                  builder: (context, child) {
                    return FadeTransition(
                      opacity: _fadeAnimation,
                      child: ScaleTransition(
                        scale: _scaleAnimation,
                        child: Container(
                          width: 200,
                          height: 200,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(
                              AppConfig.borderRadiusXLarge,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.2),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(
                              AppConfig.borderRadiusXLarge,
                            ),
                            child: Image.asset(
                              AppConfig.logoPath,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return const Icon(
                                  Icons.restaurant,
                                  size: 80,
                                  color: AppConfig.primaryColor,
                                );
                              },
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: AppConfig.spacingXLarge),

                // App name with animation
                AnimatedBuilder(
                  animation: _fadeAnimation,
                  builder: (context, child) {
                    return FadeTransition(
                      opacity: _fadeAnimation,
                      child: Column(
                        children: [
                          Text(
                            AppConfig.businessName,
                            style: AppConfig.headingLarge.copyWith(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          
                          const SizedBox(height: AppConfig.spacingSmall),
                          
                          Text(
                            'Delicious Buffets Made Easy',
                            style: AppConfig.bodyLarge.copyWith(
                              color: Colors.white.withValues(alpha: 0.9),
                              fontSize: 18,
                              fontWeight: FontWeight.w300,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  },
                ),

                const SizedBox(height: AppConfig.spacingXXLarge),

                // Loading indicator
                AnimatedBuilder(
                  animation: _fadeAnimation,
                  builder: (context, child) {
                    return FadeTransition(
                      opacity: _fadeAnimation,
                      child: const SizedBox(
                        width: 30,
                        height: 30,
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          strokeWidth: 3,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

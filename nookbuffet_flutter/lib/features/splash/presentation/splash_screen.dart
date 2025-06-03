/*
Splash Screen for Nook Buffet Flutter Application
Displays the app logo with gradient background for 5 seconds
Provides smooth transition to the main welcome screen
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
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

  @override
  void initState() {
    super.initState();
    
    // Initialize animations for smooth logo appearance
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

    // Start animations and navigate after splash duration
    _startSplashSequence();
  }

  void _startSplashSequence() async {
    // Start the logo animation
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
    return Scaffold(
      body: GradientContainer.primary(
        width: double.infinity,
        height: double.infinity,
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Animated logo section
              Expanded(
                flex: 3,
                child: Center(
                  child: AnimatedBuilder(
                    animation: _animationController,
                    builder: (context, child) {
                      return FadeTransition(
                        opacity: _fadeAnimation,
                        child: ScaleTransition(
                          scale: _scaleAnimation,
                          child: _buildLogoSection(),
                        ),
                      );
                    },
                  ),
                ),
              ),

              // App name and tagline
              Expanded(
                flex: 1,
                child: AnimatedBuilder(
                  animation: _fadeAnimation,
                  builder: (context, child) {
                    return Opacity(
                      opacity: _fadeAnimation.value,
                      child: _buildAppInfo(),
                    );
                  },
                ),
              ),

              // Loading indicator
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

  Widget _buildLogoSection() {
    return Container(
      padding: const EdgeInsets.all(AppConfig.spacingXL),
      decoration: BoxDecoration(
        color: AppConfig.primaryWhite.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConfig.radiusXL),
        boxShadow: [
          BoxShadow(
            color: AppConfig.primaryBlack.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Logo image
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: AppConfig.primaryWhite,
              borderRadius: BorderRadius.circular(AppConfig.radiusL),
              boxShadow: [
                BoxShadow(
                  color: AppConfig.primaryBlack.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppConfig.radiusL),
              child: Image.asset(
                AppConfig.logoPath,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  // Fallback if logo image is not found
                  return Container(
                    decoration: BoxDecoration(
                      gradient: AppConfig.lightGradient,
                      borderRadius: BorderRadius.circular(AppConfig.radiusL),
                    ),
                    child: const Icon(
                      Icons.restaurant,
                      size: 60,
                      color: AppConfig.primaryBlack,
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppInfo() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // App name
        Text(
          AppConfig.appName,
          style: AppConfig.headingLarge.copyWith(
            color: AppConfig.primaryWhite,
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        
        const SizedBox(height: AppConfig.spacingS),
        
        // Business name subtitle
        Text(
          AppConfig.businessName,
          style: AppConfig.bodyLarge.copyWith(
            color: AppConfig.primaryWhite.withOpacity(0.8),
            fontSize: 18,
            fontWeight: FontWeight.w300,
            letterSpacing: 1.0,
          ),
          textAlign: TextAlign.center,
        ),
        
        const SizedBox(height: AppConfig.spacingM),
        
        // Tagline
        Text(
          'Delicious Buffets, Delivered Fresh',
          style: AppConfig.bodyMedium.copyWith(
            color: AppConfig.primaryWhite.withOpacity(0.6),
            fontSize: 14,
            fontStyle: FontStyle.italic,
          ),
          textAlign: TextAlign.center,
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
            color: AppConfig.primaryWhite.withOpacity(0.6),
            fontSize: 12,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

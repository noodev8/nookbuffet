/*
Custom Button Widget for Nook Buffet App
Provides consistent button styling throughout the application
Follows the app's design system with proper spacing and colors
*/

import 'package:flutter/material.dart';
import '../config/app_config.dart';

enum ButtonType {
  primary,
  secondary,
  outline,
  text,
}

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonType type;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  final double? width;
  final double? height;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.type = ButtonType.primary,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    Widget buttonChild;

    // Handle loading state
    if (isLoading) {
      buttonChild = const SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
        ),
      );
    } else {
      // Handle icon and text
      if (icon != null) {
        buttonChild = Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18),
            const SizedBox(width: AppConfig.spacingSmall),
            Flexible(
              child: Text(
                text,
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ),
          ],
        );
      } else {
        buttonChild = Text(
          text,
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
          textAlign: TextAlign.center,
        );
      }
    }

    // SizedBox for consistent sizing
    return SizedBox(
      width: isFullWidth ? double.infinity : width,
      height: height ?? 48,
      child: _buildButtonByType(buttonChild),
    );
  }

  Widget _buildButtonByType(Widget child) {
    switch (type) {
      case ButtonType.primary:
        return ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppConfig.primaryColor,
            foregroundColor: Colors.white,
            disabledBackgroundColor: AppConfig.textLightColor,
            elevation: AppConfig.elevationLow,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConfig.borderRadiusMedium),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: AppConfig.spacingLarge,
              vertical: AppConfig.spacingMedium,
            ),
          ),
          child: child,
        );

      case ButtonType.secondary:
        return ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppConfig.secondaryColor,
            foregroundColor: Colors.white,
            disabledBackgroundColor: AppConfig.textLightColor,
            elevation: AppConfig.elevationLow,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConfig.borderRadiusMedium),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: AppConfig.spacingLarge,
              vertical: AppConfig.spacingMedium,
            ),
          ),
          child: child,
        );

      case ButtonType.outline:
        return OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppConfig.primaryColor,
            side: const BorderSide(color: AppConfig.primaryColor),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConfig.borderRadiusMedium),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: AppConfig.spacingLarge,
              vertical: AppConfig.spacingMedium,
            ),
          ),
          child: child,
        );

      case ButtonType.text:
        return TextButton(
          onPressed: isLoading ? null : onPressed,
          style: TextButton.styleFrom(
            foregroundColor: AppConfig.primaryColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConfig.borderRadiusMedium),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: AppConfig.spacingLarge,
              vertical: AppConfig.spacingMedium,
            ),
          ),
          child: child,
        );
    }
  }
}

// Specialized button for navigation
class NavigationButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final IconData? icon;
  final bool isBack;

  const NavigationButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.isBack = false,
  });

  @override
  Widget build(BuildContext context) {
    return CustomButton(
      text: text,
      onPressed: onPressed,
      type: isBack ? ButtonType.outline : ButtonType.primary,
      icon: icon ?? (isBack ? Icons.arrow_back : Icons.arrow_forward),
    );
  }
}

// Floating Action Button with app styling
class CustomFloatingActionButton extends StatelessWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final String? tooltip;

  const CustomFloatingActionButton({
    super.key,
    required this.onPressed,
    required this.icon,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: onPressed,
      backgroundColor: AppConfig.primaryColor,
      foregroundColor: Colors.white,
      tooltip: tooltip,
      child: Icon(icon),
    );
  }
}

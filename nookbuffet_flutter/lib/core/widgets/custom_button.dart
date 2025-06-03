/*
Custom Button Widget for Nook Buffet Flutter Application
Reusable button component with gradient styling and consistent design
Supports primary, secondary, and outlined button variants
*/

import 'package:flutter/material.dart';
import '../../config/app_config.dart';

enum ButtonVariant { primary, secondary, outlined }

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final bool isLoading;
  final IconData? icon;
  final double? width;
  final EdgeInsetsGeometry? padding;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.isLoading = false,
    this.icon,
    this.width,
    this.padding,
  });

  // Factory constructor for primary button
  factory CustomButton.primary({
    required String text,
    VoidCallback? onPressed,
    bool isLoading = false,
    IconData? icon,
    double? width,
    EdgeInsetsGeometry? padding,
  }) {
    return CustomButton(
      text: text,
      onPressed: onPressed,
      variant: ButtonVariant.primary,
      isLoading: isLoading,
      icon: icon,
      width: width,
      padding: padding,
    );
  }

  // Factory constructor for secondary button
  factory CustomButton.secondary({
    required String text,
    VoidCallback? onPressed,
    bool isLoading = false,
    IconData? icon,
    double? width,
    EdgeInsetsGeometry? padding,
  }) {
    return CustomButton(
      text: text,
      onPressed: onPressed,
      variant: ButtonVariant.secondary,
      isLoading: isLoading,
      icon: icon,
      width: width,
      padding: padding,
    );
  }

  // Factory constructor for outlined button
  factory CustomButton.outlined({
    required String text,
    VoidCallback? onPressed,
    bool isLoading = false,
    IconData? icon,
    double? width,
    EdgeInsetsGeometry? padding,
  }) {
    return CustomButton(
      text: text,
      onPressed: onPressed,
      variant: ButtonVariant.outlined,
      isLoading: isLoading,
      icon: icon,
      width: width,
      padding: padding,
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget buttonChild = isLoading
        ? const SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(AppConfig.primaryWhite),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 20),
                const SizedBox(width: AppConfig.spacingS),
              ],
              Text(text),
            ],
          );

    Widget button;

    switch (variant) {
      case ButtonVariant.primary:
        button = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppConfig.primaryBlack,
            foregroundColor: AppConfig.primaryWhite,
            padding: padding ?? const EdgeInsets.symmetric(
              horizontal: AppConfig.spacingL,
              vertical: AppConfig.spacingM,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConfig.radiusM),
            ),
            elevation: 2,
          ),
          child: buttonChild,
        );
        break;

      case ButtonVariant.secondary:
        button = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppConfig.accentGray,
            foregroundColor: AppConfig.primaryWhite,
            padding: padding ?? const EdgeInsets.symmetric(
              horizontal: AppConfig.spacingL,
              vertical: AppConfig.spacingM,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConfig.radiusM),
            ),
            elevation: 1,
          ),
          child: buttonChild,
        );
        break;

      case ButtonVariant.outlined:
        button = OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppConfig.primaryBlack,
            side: const BorderSide(color: AppConfig.primaryBlack, width: 1.5),
            padding: padding ?? const EdgeInsets.symmetric(
              horizontal: AppConfig.spacingL,
              vertical: AppConfig.spacingM,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConfig.radiusM),
            ),
          ),
          child: buttonChild,
        );
        break;
    }

    return SizedBox(
      width: width,
      child: button,
    );
  }
}

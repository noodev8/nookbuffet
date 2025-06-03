/*
Gradient Container Widget for Nook Buffet Flutter Application
Reusable container with gradient backgrounds for consistent styling
Supports different gradient types and customizable properties
*/

import 'package:flutter/material.dart';
import '../../config/app_config.dart';

class GradientContainer extends StatelessWidget {
  final Widget child;
  final LinearGradient? gradient;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double? borderRadius;
  final double? height;
  final double? width;
  final AlignmentGeometry? alignment;

  const GradientContainer({
    super.key,
    required this.child,
    this.gradient,
    this.padding,
    this.margin,
    this.borderRadius,
    this.height,
    this.width,
    this.alignment,
  });

  // Factory constructor for primary gradient (dark)
  factory GradientContainer.primary({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? borderRadius,
    double? height,
    double? width,
    AlignmentGeometry? alignment,
  }) {
    return GradientContainer(
      gradient: AppConfig.primaryGradient,
      padding: padding,
      margin: margin,
      borderRadius: borderRadius,
      height: height,
      width: width,
      alignment: alignment,
      child: child,
    );
  }

  // Factory constructor for light gradient
  factory GradientContainer.light({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? borderRadius,
    double? height,
    double? width,
    AlignmentGeometry? alignment,
  }) {
    return GradientContainer(
      gradient: AppConfig.lightGradient,
      padding: padding,
      margin: margin,
      borderRadius: borderRadius,
      height: height,
      width: width,
      alignment: alignment,
      child: child,
    );
  }

  // Factory constructor for card gradient
  factory GradientContainer.card({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? borderRadius,
    double? height,
    double? width,
    AlignmentGeometry? alignment,
  }) {
    return GradientContainer(
      gradient: AppConfig.cardGradient,
      padding: padding ?? const EdgeInsets.all(AppConfig.spacingM),
      margin: margin,
      borderRadius: borderRadius ?? AppConfig.radiusL,
      height: height,
      width: width,
      alignment: alignment,
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width,
      padding: padding,
      margin: margin,
      alignment: alignment,
      decoration: BoxDecoration(
        gradient: gradient ?? AppConfig.lightGradient,
        borderRadius: borderRadius != null 
            ? BorderRadius.circular(borderRadius!)
            : null,
        boxShadow: [
          BoxShadow(
            color: AppConfig.primaryBlack.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}

/*
Login Screen for Nook Buffet Flutter Application
Allows users to login or bypass authentication for testing
Features gradient styling and form validation
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
import '../../../core/widgets/custom_button.dart';
import 'register_screen.dart';
import '../../welcome/presentation/welcome_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GradientContainer.light(
        width: double.infinity,
        height: double.infinity,
        child: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              children: [
                // Header with back button
                _buildHeader(context),
                
                // Login form
                _buildLoginForm(),
                
                // Bypass option for testing
                _buildBypassSection(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return GradientContainer.primary(
      padding: const EdgeInsets.all(AppConfig.spacingM),
      child: Row(
        children: [
          // Back button
          IconButton(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(
              Icons.arrow_back_ios,
              color: AppConfig.primaryWhite,
            ),
          ),
          
          // Title
          Expanded(
            child: Text(
              'Welcome Back',
              style: AppConfig.headingMedium.copyWith(
                color: AppConfig.primaryWhite,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          
          // Placeholder for symmetry
          const SizedBox(width: 48),
        ],
      ),
    );
  }

  Widget _buildLoginForm() {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingM),
      child: GradientContainer.card(
        padding: const EdgeInsets.all(AppConfig.spacingL),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome message
              Text(
                'Sign in to your account',
                style: AppConfig.headingSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              
              const SizedBox(height: AppConfig.spacingS),
              
              Text(
                'Enter your credentials to access your account',
                style: AppConfig.bodyMedium.copyWith(
                  color: AppConfig.mediumGray,
                ),
              ),
              
              const SizedBox(height: AppConfig.spacingL),
              
              // Email field
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  hintText: 'Enter your email',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  if (!value.contains('@')) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: AppConfig.spacingM),
              
              // Password field
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  hintText: 'Enter your password',
                  prefixIcon: const Icon(Icons.lock_outlined),
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                    icon: Icon(
                      _obscurePassword ? Icons.visibility : Icons.visibility_off,
                    ),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your password';
                  }
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: AppConfig.spacingM),
              
              // Forgot password link
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => _showForgotPasswordDialog(),
                  child: Text(
                    'Forgot Password?',
                    style: AppConfig.bodyMedium.copyWith(
                      color: AppConfig.primaryBlack,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: AppConfig.spacingL),
              
              // Login button
              CustomButton.primary(
                text: 'Sign In',
                onPressed: _isLoading ? null : _handleLogin,
                isLoading: _isLoading,
                width: double.infinity,
              ),
              
              const SizedBox(height: AppConfig.spacingM),
              
              // Register link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Don\'t have an account? ',
                    style: AppConfig.bodyMedium.copyWith(
                      color: AppConfig.mediumGray,
                    ),
                  ),
                  TextButton(
                    onPressed: () => _navigateToRegister(),
                    child: Text(
                      'Sign Up',
                      style: AppConfig.bodyMedium.copyWith(
                        color: AppConfig.primaryBlack,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBypassSection() {
    return Container(
      margin: const EdgeInsets.all(AppConfig.spacingM),
      child: GradientContainer.card(
        padding: const EdgeInsets.all(AppConfig.spacingM),
        child: Column(
          children: [
            Icon(
              Icons.developer_mode,
              color: AppConfig.mediumGray,
              size: 32,
            ),
            
            const SizedBox(height: AppConfig.spacingS),
            
            Text(
              'Testing Mode',
              style: AppConfig.bodyMedium.copyWith(
                fontWeight: FontWeight.w600,
                color: AppConfig.mediumGray,
              ),
            ),
            
            const SizedBox(height: AppConfig.spacingS),
            
            Text(
              'Skip authentication for testing purposes',
              style: AppConfig.bodySmall.copyWith(
                color: AppConfig.mediumGray,
              ),
              textAlign: TextAlign.center,
            ),
            
            const SizedBox(height: AppConfig.spacingM),
            
            CustomButton.outlined(
              text: 'Continue Without Login',
              onPressed: () => _bypassLogin(),
              width: double.infinity,
            ),
          ],
        ),
      ),
    );
  }

  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
    });
    
    // Simulate API call
    await Future.delayed(const Duration(seconds: 2));
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      
      // For now, always succeed and navigate back
      _showSuccessDialog();
    }
  }

  void _bypassLogin() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const WelcomeScreen()),
      (route) => false,
    );
  }

  void _navigateToRegister() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const RegisterScreen()),
    );
  }

  void _showForgotPasswordDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Forgot Password'),
        content: const Text('Password reset functionality will be implemented in a future update.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Login Successful'),
        content: const Text('Welcome back! You have been successfully logged in.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pop(); // Go back to previous screen
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }
}

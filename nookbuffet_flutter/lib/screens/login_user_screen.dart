/*
Login Screen for Nook Buffet App
Allows users to log into the application
This screen also has an option to Register if the user is not already registered
Once logged in, it goes straight to the dashboard
*/

import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../widgets/custom_button.dart';
import 'register_user_screen.dart';
import 'welcome_screen.dart';

class LoginUserScreen extends StatefulWidget {
  const LoginUserScreen({super.key});

  @override
  State<LoginUserScreen> createState() => _LoginUserScreenState();
}

class _LoginUserScreenState extends State<LoginUserScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _rememberMe = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _togglePasswordVisibility() {
    setState(() {
      _obscurePassword = !_obscurePassword;
    });
  }

  void _login() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      // Simulate login process
      await Future.delayed(const Duration(seconds: 2));

      // For now, just show success and navigate back
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Login successful!'),
            backgroundColor: AppConfig.successColor,
          ),
        );

        // Navigate back to welcome screen
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) => const WelcomeScreen(),
          ),
        );
      }

      setState(() {
        _isLoading = false;
      });
    }
  }

  void _navigateToRegister() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const RegisterUserScreen(),
      ),
    );
  }

  void _forgotPassword() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Forgot Password'),
        content: const Text(
          'Please contact us at ${AppConfig.businessEmail} or call ${AppConfig.businessPhone} to reset your password.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _continueAsGuest() {
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConfig.backgroundColor,
      appBar: AppBar(
        title: const Text('Login'),
        backgroundColor: AppConfig.primaryColor,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppConfig.spacingLarge),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo and welcome text
              _buildHeader(),
              
              const SizedBox(height: AppConfig.spacingXLarge),
              
              // Login form
              _buildLoginForm(),
              
              const SizedBox(height: AppConfig.spacingLarge),
              
              // Login button
              CustomButton(
                text: 'Login',
                onPressed: _login,
                isLoading: _isLoading,
                isFullWidth: true,
                icon: Icons.login,
              ),
              
              const SizedBox(height: AppConfig.spacingMedium),
              
              // Forgot password
              Center(
                child: TextButton(
                  onPressed: _forgotPassword,
                  child: Text(
                    'Forgot Password?',
                    style: AppConfig.bodyMedium.copyWith(
                      color: AppConfig.primaryColor,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: AppConfig.spacingLarge),
              
              // Divider
              Row(
                children: [
                  const Expanded(child: Divider()),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppConfig.spacingMedium,
                    ),
                    child: Text(
                      'OR',
                      style: AppConfig.bodyMedium.copyWith(
                        color: AppConfig.textSecondaryColor,
                      ),
                    ),
                  ),
                  const Expanded(child: Divider()),
                ],
              ),
              
              const SizedBox(height: AppConfig.spacingLarge),
              
              // Register button
              CustomButton(
                text: 'Create New Account',
                onPressed: _navigateToRegister,
                type: ButtonType.outline,
                isFullWidth: true,
                icon: Icons.person_add,
              ),
              
              const SizedBox(height: AppConfig.spacingMedium),
              
              // Continue as guest
              CustomButton(
                text: 'Continue as Guest',
                onPressed: _continueAsGuest,
                type: ButtonType.text,
                isFullWidth: true,
                icon: Icons.person_outline,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        // Logo placeholder
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: AppConfig.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(AppConfig.borderRadiusLarge),
            border: Border.all(
              color: AppConfig.primaryColor.withOpacity(0.3),
              width: 2,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppConfig.borderRadiusLarge),
            child: Image.asset(
              AppConfig.logoPath,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return const Icon(
                  Icons.restaurant,
                  size: 60,
                  color: AppConfig.primaryColor,
                );
              },
            ),
          ),
        ),
        
        const SizedBox(height: AppConfig.spacingLarge),
        
        Text(
          'Welcome Back!',
          style: AppConfig.headingLarge.copyWith(
            color: AppConfig.primaryColor,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        
        const SizedBox(height: AppConfig.spacingSmall),
        
        Text(
          'Sign in to your account to manage your bookings',
          style: AppConfig.bodyMedium.copyWith(
            color: AppConfig.textSecondaryColor,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildLoginForm() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Email field
          TextFormField(
            controller: _emailController,
            decoration: const InputDecoration(
              labelText: 'Email Address',
              prefixIcon: Icon(Icons.email),
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Please enter your email';
              }
              if (!value.contains('@')) {
                return 'Please enter a valid email';
              }
              return null;
            },
          ),
          
          const SizedBox(height: AppConfig.spacingMedium),
          
          // Password field
          TextFormField(
            controller: _passwordController,
            decoration: InputDecoration(
              labelText: 'Password',
              prefixIcon: const Icon(Icons.lock),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility : Icons.visibility_off,
                ),
                onPressed: _togglePasswordVisibility,
              ),
              border: const OutlineInputBorder(),
            ),
            obscureText: _obscurePassword,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Please enter your password';
              }
              if (value.length < 6) {
                return 'Password must be at least 6 characters';
              }
              return null;
            },
          ),
          
          const SizedBox(height: AppConfig.spacingMedium),
          
          // Remember me checkbox
          Row(
            children: [
              Checkbox(
                value: _rememberMe,
                onChanged: (value) {
                  setState(() {
                    _rememberMe = value ?? false;
                  });
                },
                activeColor: AppConfig.primaryColor,
              ),
              Text(
                'Remember me',
                style: AppConfig.bodyMedium,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

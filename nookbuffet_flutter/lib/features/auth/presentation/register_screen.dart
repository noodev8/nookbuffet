/*
Register Screen for Nook Buffet Flutter Application
Allows users to create new accounts or bypass authentication for testing
Features form validation and gradient styling
*/

import 'package:flutter/material.dart';
import '../../../config/app_config.dart';
import '../../../core/widgets/gradient_container.dart';
import '../../../core/widgets/custom_button.dart';
import '../../welcome/presentation/welcome_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreeToTerms = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
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
                
                // Registration form
                _buildRegistrationForm(),
                
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
              'Create Account',
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

  Widget _buildRegistrationForm() {
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
                'Join The Nook',
                style: AppConfig.headingSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              
              const SizedBox(height: AppConfig.spacingS),
              
              Text(
                'Create your account to start ordering delicious buffets',
                style: AppConfig.bodyMedium.copyWith(
                  color: AppConfig.mediumGray,
                ),
              ),
              
              const SizedBox(height: AppConfig.spacingL),
              
              // Name fields row
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _firstNameController,
                      decoration: const InputDecoration(
                        labelText: 'First Name',
                        hintText: 'John',
                        prefixIcon: Icon(Icons.person_outlined),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Required';
                        }
                        return null;
                      },
                    ),
                  ),
                  
                  const SizedBox(width: AppConfig.spacingM),
                  
                  Expanded(
                    child: TextFormField(
                      controller: _lastNameController,
                      decoration: const InputDecoration(
                        labelText: 'Last Name',
                        hintText: 'Doe',
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Required';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: AppConfig.spacingM),
              
              // Email field
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  hintText: 'john.doe@example.com',
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
              
              // Phone field
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  hintText: '07551428162',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your phone number';
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
                  hintText: 'Create a strong password',
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
                    return 'Please enter a password';
                  }
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: AppConfig.spacingM),
              
              // Confirm password field
              TextFormField(
                controller: _confirmPasswordController,
                obscureText: _obscureConfirmPassword,
                decoration: InputDecoration(
                  labelText: 'Confirm Password',
                  hintText: 'Re-enter your password',
                  prefixIcon: const Icon(Icons.lock_outlined),
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() {
                        _obscureConfirmPassword = !_obscureConfirmPassword;
                      });
                    },
                    icon: Icon(
                      _obscureConfirmPassword ? Icons.visibility : Icons.visibility_off,
                    ),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please confirm your password';
                  }
                  if (value != _passwordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: AppConfig.spacingM),
              
              // Terms and conditions checkbox
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Checkbox(
                    value: _agreeToTerms,
                    onChanged: (value) {
                      setState(() {
                        _agreeToTerms = value ?? false;
                      });
                    },
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _agreeToTerms = !_agreeToTerms;
                        });
                      },
                      child: Text(
                        'I agree to the Terms of Service and Privacy Policy',
                        style: AppConfig.bodySmall.copyWith(
                          color: AppConfig.mediumGray,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: AppConfig.spacingL),
              
              // Register button
              CustomButton.primary(
                text: 'Create Account',
                onPressed: (_isLoading || !_agreeToTerms) ? null : _handleRegister,
                isLoading: _isLoading,
                width: double.infinity,
              ),
              
              const SizedBox(height: AppConfig.spacingM),
              
              // Login link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Already have an account? ',
                    style: AppConfig.bodyMedium.copyWith(
                      color: AppConfig.mediumGray,
                    ),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(
                      'Sign In',
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
              'Skip registration for testing purposes',
              style: AppConfig.bodySmall.copyWith(
                color: AppConfig.mediumGray,
              ),
              textAlign: TextAlign.center,
            ),
            
            const SizedBox(height: AppConfig.spacingM),
            
            CustomButton.outlined(
              text: 'Continue Without Registration',
              onPressed: () => _bypassRegistration(),
              width: double.infinity,
            ),
          ],
        ),
      ),
    );
  }

  void _handleRegister() async {
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

  void _bypassRegistration() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const WelcomeScreen()),
      (route) => false,
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Registration Successful'),
        content: const Text('Your account has been created successfully! You can now sign in.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pop(); // Go back to login screen
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }
}

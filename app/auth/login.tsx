import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { 
  ArrowLeft, 
  LogIn, 
  Phone, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserPlus,
  ChevronRight
} from 'lucide-react-native';
import { AuthProvider, LoginCredentials, UserRole } from '@/types';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithProvider, register, error, isLoading } = useAuthStore();
  
  // State for login/register mode
  const [mode, setMode] = useState<'provider' | 'email' | 'phone' | 'register'>('provider');
  
  // State for login form
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // State for registration form
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('orderer');
  
  const handleBack = () => {
    router.back();
  };
  
  const handleProviderLogin = async (provider: AuthProvider) => {
    try {
      await loginWithProvider(provider);
      // Only navigate if no error occurred
      if (!useAuthStore.getState().error) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }
    
    const credentials: LoginCredentials = {
      email,
      password,
      provider: 'email'
    };
    
    try {
      await login(credentials);
      // Only navigate if no error occurred
      if (!useAuthStore.getState().error) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handlePhoneLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Missing Information', 'Please enter both phone number and password');
      return;
    }
    
    const credentials: LoginCredentials = {
      phone,
      password,
      provider: 'phone'
    };
    
    try {
      await login(credentials);
      // Only navigate if no error occurred
      if (!useAuthStore.getState().error) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleRegister = async () => {
    // Validate form
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        providers: ['email', 'phone']
      });
      
      // Only navigate if no error occurred
      if (!useAuthStore.getState().error) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created. You can now log in.',
          [{ text: 'OK', onPress: () => setMode('email') }]
        );
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  
  const renderProviderOptions = () => (
    <View style={styles.providersContainer}>
      <TouchableOpacity 
        style={styles.providerButton}
        onPress={() => handleProviderLogin('google')}
        disabled={isLoading}
      >
        <View style={styles.providerIcon}>
          <Text style={styles.providerIconText}>G</Text>
        </View>
        <Text style={styles.providerText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.providerButton}
        onPress={() => handleProviderLogin('microsoft')}
        disabled={isLoading}
      >
        <View style={styles.providerIcon}>
          <Text style={styles.providerIconText}>M</Text>
        </View>
        <Text style={styles.providerText}>Continue with Microsoft</Text>
      </TouchableOpacity>
      
      {Platform.OS === 'ios' && (
        <TouchableOpacity 
          style={styles.providerButton}
          onPress={() => handleProviderLogin('apple')}
          disabled={isLoading}
        >
          <View style={styles.providerIcon}>
            <Text style={styles.providerIconText}>A</Text>
          </View>
          <Text style={styles.providerText}>Continue with Apple</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.providerButton}
        onPress={() => setMode('phone')}
        disabled={isLoading}
      >
        <View style={styles.providerIcon}>
          <Phone size={20} color={colors.text} />
        </View>
        <Text style={styles.providerText}>Continue with Phone</Text>
      </TouchableOpacity>
      
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>
      
      <Button 
        title="Continue with Email" 
        variant="outline"
        leftIcon={<Mail size={20} color={colors.primary} />}
        onPress={() => setMode('email')}
        style={styles.emailButton}
      />
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => setMode('register')}
      >
        <Text style={styles.registerText}>New user?</Text>
        <Text style={styles.registerTextBold}>Create an account</Text>
        <ChevronRight size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
  
  const renderEmailForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Login with Email</Text>
      
      <View style={styles.inputContainer}>
        <Mail size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Lock size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textLight}
        />
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.gray} />
          ) : (
            <Eye size={20} color={colors.gray} />
          )}
        </TouchableOpacity>
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <Button 
        title="Login" 
        onPress={handleEmailLogin}
        isLoading={isLoading}
        style={styles.loginButton}
      />
      
      <TouchableOpacity 
        style={styles.backToOptions}
        onPress={() => setMode('provider')}
      >
        <Text style={styles.backToOptionsText}>Back to login options</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => setMode('register')}
      >
        <Text style={styles.registerText}>New user?</Text>
        <Text style={styles.registerTextBold}>Create an account</Text>
        <ChevronRight size={16} color={colors.primary} />
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        Demo credentials: john.smith@example.com / password123
      </Text>
    </View>
  );
  
  const renderPhoneForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Login with Phone</Text>
      
      <View style={styles.inputContainer}>
        <Phone size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Lock size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textLight}
        />
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.gray} />
          ) : (
            <Eye size={20} color={colors.gray} />
          )}
        </TouchableOpacity>
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <Button 
        title="Login" 
        onPress={handlePhoneLogin}
        isLoading={isLoading}
        style={styles.loginButton}
      />
      
      <TouchableOpacity 
        style={styles.backToOptions}
        onPress={() => setMode('provider')}
      >
        <Text style={styles.backToOptionsText}>Back to login options</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => setMode('register')}
      >
        <Text style={styles.registerText}>New user?</Text>
        <Text style={styles.registerTextBold}>Create an account</Text>
        <ChevronRight size={16} color={colors.primary} />
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        Demo credentials: +1234567890 / password123
      </Text>
    </View>
  );
  
  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create an Account</Text>
      
      <View style={styles.inputContainer}>
        <User size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Mail size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Phone size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Lock size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textLight}
        />
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.gray} />
          ) : (
            <Eye size={20} color={colors.gray} />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Lock size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <Text style={styles.roleLabel}>I want to:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={[
            styles.roleOption,
            role === 'orderer' && styles.roleOptionSelected
          ]}
          onPress={() => setRole('orderer')}
        >
          <Text style={[
            styles.roleText,
            role === 'orderer' && styles.roleTextSelected
          ]}>
            Ship Goods
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.roleOption,
            role === 'transporter' && styles.roleOptionSelected
          ]}
          onPress={() => setRole('transporter')}
        >
          <Text style={[
            styles.roleText,
            role === 'transporter' && styles.roleTextSelected
          ]}>
            Transport Goods
          </Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <Button 
        title="Register" 
        onPress={handleRegister}
        isLoading={isLoading}
        style={styles.loginButton}
        leftIcon={<UserPlus size={20} color={colors.white} />}
      />
      
      <TouchableOpacity 
        style={styles.backToOptions}
        onPress={() => setMode('provider')}
      >
        <Text style={styles.backToOptionsText}>Back to login options</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to LogiTrack</Text>
            <Text style={styles.subtitle}>
              {mode === 'register' 
                ? 'Create an account to get started' 
                : 'Sign in to continue to the app'}
            </Text>
            
            {mode === 'provider' && renderProviderOptions()}
            {mode === 'email' && renderEmailForm()}
            {mode === 'phone' && renderPhoneForm()}
            {mode === 'register' && renderRegisterForm()}
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 32,
  },
  providersContainer: {
    gap: 16,
    marginBottom: 32,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  providerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  providerIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  providerText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    color: colors.textLight,
    fontSize: 14,
  },
  emailButton: {
    width: '100%',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
    gap: 4,
  },
  registerText: {
    color: colors.textLight,
    fontSize: 14,
  },
  registerTextBold: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: colors.text,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 8,
  },
  loginButton: {
    width: '100%',
    marginTop: 8,
  },
  backToOptions: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  backToOptionsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  helpText: {
    color: colors.textLight,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  roleOption: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleText: {
    fontSize: 14,
    color: colors.text,
  },
  roleTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
});
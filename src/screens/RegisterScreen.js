import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';

const RegisterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecialChar = /[!&_?*@]/.test(password);
    
    if (!hasNumber || !hasLetter || !hasSpecialChar) {
      return t('register.passwordMustContain');
    }
    if (password.length < 8) {
      return t('register.passwordMinLength');
    }
    return '';
  };

  const validateUsername = (rawUsername) => {
    const normalized = rawUsername.trim().toLowerCase();

    if (!normalized) {
      return t('register.enterUsername');
    }

    if (!/^[a-z0-9._-]{3,30}$/.test(normalized)) {
      return t('register.usernameRules');
    }

    return '';
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError(validatePassword(text));
  };

  const handleRegister = async () => {
    const usernameError = validateUsername(username);
    if (usernameError) {
      Alert.alert(t('common.error'), usernameError);
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      Alert.alert(t('common.error'), validationError);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('register.passwordsNoMatch'));
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(t('common.error'), t('register.acceptTerms'));
      return;
    }

    try {
      const { data, error } = await authService.registerWithUsername({
        username,
        password,
      });

      if (error) {
        const message = error.message?.toLowerCase() || '';

        if (message.includes('not configured')) {
          Alert.alert(t('common.error'), t('login.supabaseNotConfigured'));
          return;
        }

        if (message.includes('user already registered') || message.includes('already been registered')) {
          Alert.alert(t('common.error'), t('register.usernameExists'));
          return;
        }

        Alert.alert(t('common.error'), error.message || t('register.failedCreate'));
        return;
      }
      
      Alert.alert(t('common.success'), t('register.accountCreated'), [
        { text: t('common.ok'), onPress: () => navigation.navigate(data?.session ? 'Onboarding' : 'Login') }
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), t('register.failedCreate'));
      console.error('Registration error:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.bg }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={[styles.brand, { color: colors.accent }]}>Serapis</Text>
          <Text style={[styles.title, { color: colors.heading }]}>{t('register.signUp')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('register.subtitle')}</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.accent }]}>{t('register.username')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              value={username}
              onChangeText={setUsername}
              placeholder={t('login.usernamePlaceholder')}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.accent }]}>{t('register.password')}</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }, passwordError ? { borderColor: colors.errorInput, borderWidth: 2, backgroundColor: colors.errorInputBg } : null]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder={t('login.passwordPlaceholder')}
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityRole="button"
                accessibilityLabel="Toggle password visibility"
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.accentLight}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={[styles.errorText, { color: colors.errorInput }]}>{passwordError}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.accent }]}>{t('register.confirmPassword')}</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('register.confirmPlaceholder')}
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityRole="button"
                accessibilityLabel="Toggle password visibility"
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.accentLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              accessibilityLabel="Accept Terms & Conditions"
            >
              <View style={[styles.checkboxInner, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }, acceptedTerms && { backgroundColor: colors.accentLight, borderColor: colors.accentLight }]}>
                {acceptedTerms && <Text style={styles.checkmark}>×</Text>}
              </View>
            </TouchableOpacity>
            <Text style={[styles.checkboxText, { color: colors.secondary }]}>
              {t('register.termsCheckbox')}
              <Text style={[styles.link, { color: colors.link }]}>{t('register.termsLink')}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.accentLight },
              (!username || !password || !confirmPassword || !acceptedTerms || !!passwordError) && 
              { backgroundColor: colors.buttonDisabled, shadowOpacity: 0, elevation: 0 }
            ]}
            onPress={handleRegister}
            disabled={!username || !password || !confirmPassword || !acceptedTerms || !!passwordError}
          >
            <Text style={styles.submitButtonText}>{t('common.submit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.linkText, { color: colors.secondary }]}>
              {t('register.alreadyHaveAccount')}<Text style={[styles.link, { color: colors.link }]}>{t('register.logInHere')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 36,
  },
  inputContainer: {
    marginBottom: 22,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'lowercase',
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {},
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  link: {
    fontWeight: '600',
  },
  submitButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkContainer: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RegisterScreen;

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
import { onboardingService } from '../services/onboardingService';

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert(t('common.error'), t('login.enterUsername'));
      return;
    }

    if (!password.trim()) {
      Alert.alert(t('common.error'), t('login.enterPassword'));
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authService.loginWithUsername({
        username,
        password,
      });

      if (!error) {
        const { data: userData } = await authService.getCurrentUser();
        const userId = userData?.user?.id || 'guest';
        const onboarded = await onboardingService.isOnboarded(userId);

        Alert.alert(t('common.success'), t('login.loginSuccess'), [
          { text: t('common.ok'), onPress: () => {
            navigation.navigate(onboarded ? 'Home' : 'Onboarding');
          }}
        ]);
      } else {
        const message = error.message?.toLowerCase() || '';

        if (message.includes('not configured')) {
          Alert.alert(t('common.error'), t('login.supabaseNotConfigured'));
        } else if (message.includes('email not confirmed')) {
          Alert.alert(t('common.error'), t('login.emailNotConfirmed'));
        } else {
          Alert.alert(t('common.error'), t('login.invalidCredentials'));
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('login.loginFailed'));
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      t('login.forgotPasswordTitle'),
      t('login.forgotPasswordMessage'),
      [{ text: t('common.ok') }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.bg }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={[styles.brand, { color: colors.accent }]}>Serapis</Text>
          <Text style={[styles.title, { color: colors.heading }]}>{t('login.welcomeBack')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('login.subtitle')}</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.accent }]}>{t('login.username')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              value={username}
              onChangeText={setUsername}
              placeholder={t('login.usernamePlaceholder')}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.accent }]}>{t('login.password')}</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder={t('login.passwordPlaceholder')}
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityRole="button"
                accessibilityLabel={t('login.togglePassword')}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.accentLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.link }]}>{t('login.forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.accentLight },
              (!username || !password) && { backgroundColor: colors.buttonDisabled, shadowOpacity: 0, elevation: 0 },
              isLoading && { backgroundColor: colors.buttonLoading }
            ]}
            onPress={handleLogin}
            disabled={!username || !password || isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? t('login.signingIn') : t('common.submit')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.linkText, { color: colors.secondary }]}>
              {t('login.noAccount')}<Text style={[styles.link, { color: colors.link }]}>{t('login.signUpFree')}</Text>
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
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
  submitButtonLoading: {},
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
  link: {
    fontWeight: '600',
  },
});

export default LoginScreen;

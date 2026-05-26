import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { onboardingService, FEELING_OPTIONS, DISABILITY_OPTIONS } from '../services/onboardingService';

const TOTAL_STEPS = 3;

const OnboardingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [selectedFeelings, setSelectedFeelings] = useState([]);
  const [selectedDisabilities, setSelectedDisabilities] = useState({});
  const [saving, setSaving] = useState(false);

  const toggleFeeling = key => {
    setSelectedFeelings(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key],
    );
  };

  const toggleDisability = key => {
    setSelectedDisabilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const canAdvance = () => {
    if (step === 1) return selectedFeelings.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { data: userData } = await authService.getCurrentUser();
      const userId = userData?.user?.id || 'guest';

      const disabilities = {};
      for (const opt of DISABILITY_OPTIONS) {
        if (selectedDisabilities[opt.key]) {
          disabilities[opt.key] = true;
        }
      }

      await onboardingService.saveProfile(userId, {
        feelings: selectedFeelings,
        disabilities,
      });

      navigation?.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch {
      setSaving(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressBarContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            { backgroundColor: i <= step ? colors.accent : colors.border },
          ]}
        />
      ))}
    </View>
  );

  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accentBg }]}>
        <Ionicons name="heart-outline" size={48} color={colors.accent} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.heading }]}>Welcome to Serapis</Text>
      <Text style={[styles.stepDescription, { color: colors.secondary }]}>
        We are here to help you build small, healthy habits that fit your life. Let us personalise
        your experience so every task feels relevant to you.
      </Text>
      <Text style={[styles.stepHint, { color: colors.muted }]}>
        This takes less than a minute.
      </Text>
    </View>
  );

  const renderFeelings = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.heading }]}>
        What are you struggling with?
      </Text>
      <Text style={[styles.stepDescription, { color: colors.secondary }]}>
        Select everything that applies. We will use this to pick the right daily tasks for you.
      </Text>

      <View style={styles.optionsList}>
        {FEELING_OPTIONS.map(opt => {
          const isSelected = selectedFeelings.includes(opt.key);
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                isSelected && { backgroundColor: colors.accentBg, borderColor: colors.accent },
              ]}
              onPress={() => toggleFeeling(opt.key)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={opt.label}
            >
              <View style={styles.optionRow}>
                <View style={[styles.optionIconCircle, { backgroundColor: isSelected ? colors.accent : colors.border }]}>
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={isSelected ? '#fff' : colors.secondary}
                  />
                </View>
                <View style={styles.optionTextCol}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.optionDesc, { color: colors.secondary }]}>
                    {opt.description}
                  </Text>
                </View>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={isSelected ? colors.accent : colors.border}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderDisabilities = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.heading }]}>
        Any physical limitations?
      </Text>
      <Text style={[styles.stepDescription, { color: colors.secondary }]}>
        This helps us choose appropriate tasks. We will never give you a task that does not suit
        your abilities. You can skip this step if it does not apply.
      </Text>

      <View style={styles.optionsList}>
        {DISABILITY_OPTIONS.map(opt => {
          const isSelected = Boolean(selectedDisabilities[opt.key]);
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                isSelected && { backgroundColor: colors.accentBg, borderColor: colors.accent },
              ]}
              onPress={() => toggleDisability(opt.key)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={opt.label}
            >
              <View style={styles.optionRow}>
                <View style={styles.optionTextCol}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.optionDesc, { color: colors.secondary }]}>
                    {opt.description}
                  </Text>
                </View>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={isSelected ? colors.accent : colors.border}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const steps = [renderWelcome, renderFeelings, renderDisabilities];
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safeTop}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          {step > 0 ? (
            <TouchableOpacity
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color={colors.heading} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          {renderProgressBar()}
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollWrapper}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {steps[step]()}
      </ScrollView>

      <SafeAreaView style={[styles.footerSafe, { backgroundColor: colors.bg }]}>
        <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
          {isLast ? (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.accentLight },
                saving && { opacity: 0.6 },
              ]}
              onPress={handleFinish}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Finish onboarding"
            >
              <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {saving ? 'Saving...' : 'Start Your Journey'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.accentLight },
                !canAdvance() && { backgroundColor: colors.buttonDisabled },
              ]}
              onPress={handleNext}
              disabled={!canAdvance()}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeTop: {
    backgroundColor: 'transparent',
  },
  scrollWrapper: {
    flex: 1,
  },
  footerSafe: {
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerSpacer: {
    width: 22,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingVertical: 28,
    paddingBottom: 40,
  },
  stepContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 340,
  },
  stepHint: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  optionsList: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  optionCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;

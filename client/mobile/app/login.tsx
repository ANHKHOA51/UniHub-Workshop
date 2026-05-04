// ============================================================
// UniHub Workshop — Login Screen
// Giao diện đăng nhập cho Staff check-in
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Redirect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Brand, Colors, Radius, Spacing, Typography, Shadows } from '@/constants/theme';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nếu đã đăng nhập → redirect sang tabs
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background gradient */}
      <View style={styles.bgGradientTop}>
        <View style={[styles.glowOrb, styles.orbPrimary]} />
        <View style={[styles.glowOrb, styles.orbAccent]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { borderColor: theme.borderLight }]}>
              <MaterialIcons name="qr-code-scanner" size={40} color={theme.tint} />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>UniHub</Text>
            <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>Workshop Check-in</Text>
            <Text style={styles.roleLabel}>Dành cho Nhân sự check-in</Text>
          </View>

          {/* Login Form */}
          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Error message */}
            {error && (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={16} color={Brand.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <MaterialIcons name="email" size={20} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="staff@university.edu.vn"
                  placeholderTextColor="#4A4869"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <MaterialIcons name="lock" size={20} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#4A4869"
                  secureTextEntry={!showPassword}
                />
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={theme.icon}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.inputIconRight}
                />
              </View>
            </View>

            {/* Login Button */}
            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              style={styles.loginButton}
            />

            {/* Dev hint */}
            <Text style={styles.devHint}>
              💡 DEV: Nhập email bất kỳ (có @) + password bất kỳ
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0D23',
  },
  bgGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPrimary: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    top: -100,
    right: -80,
  },
  orbAccent: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    top: 50,
    left: -60,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  appName: {
    ...Typography.h1,
    color: '#F1F5F9',
    marginBottom: Spacing.xs,
  },
  appSubtitle: {
    ...Typography.h3,
    color: Brand.accent,
    marginBottom: Spacing.sm,
  },
  roleLabel: {
    ...Typography.caption,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: '#1E1B3A',
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: '#2D2A52',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Brand.errorBg,
    borderRadius: Radius.sm,
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...Typography.caption,
    color: Brand.error,
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: '#94A3B8',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15132B',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#2D2A52',
    height: 52,
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  inputIconRight: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  devHint: {
    ...Typography.caption,
    color: '#4A4869',
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

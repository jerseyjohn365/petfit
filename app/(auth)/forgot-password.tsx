import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/lib/auth';
import { Button, Input, colors, spacing, fontSize } from '../../src/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setLoading(true);
    const { error: resetError } = await resetPassword(email);
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.container}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>

          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>Check your email for a password reset link.</Text>
              <Button title="Back to Login" onPress={() => router.back()} variant="outline" style={styles.button} />
            </View>
          ) : (
            <>
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button title="Send Reset Link" onPress={handleReset} loading={loading} style={styles.button} />
            </>
          )}

          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xl },
  error: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.md },
  button: { marginTop: spacing.md },
  successBox: { backgroundColor: '#ECFDF5', padding: spacing.lg, borderRadius: 12, marginBottom: spacing.md },
  successText: { color: '#065F46', fontSize: fontSize.md, textAlign: 'center' },
  back: { alignItems: 'center', marginTop: spacing.lg },
  backText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '500' },
});

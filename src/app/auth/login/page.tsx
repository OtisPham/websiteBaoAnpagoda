import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const THEME = {
  bgLight: '#EEF5F7',
  textPrimary: '#0D3A4B',
  darkTeal: '#2B697D',
  accentTeal: '#5DA8A8',
  white: '#FFFFFF',
};

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Đăng Nhập Tài Khoản</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Chưa có tài khoản Phật tử? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>ĐỊA CHỈ EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="phattu@example.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>MẬT KHẨU</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Ẩn' : 'Hiện'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Đăng Nhập Ngay</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgLight,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  backButton: {
    color: THEME.darkTeal,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  subtitle: {
    color: THEME.textPrimary,
    opacity: 0.8,
  },
  linkText: {
    color: THEME.darkTeal,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: 'rgba(43, 105, 125, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: THEME.textPrimary,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: 'rgba(43, 105, 125, 0.3)',
    borderRadius: 12,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: THEME.textPrimary,
  },
  eyeButton: {
    padding: 16,
  },
  eyeText: {
    color: THEME.darkTeal,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: THEME.textPrimary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: THEME.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

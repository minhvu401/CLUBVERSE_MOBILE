import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClubverseLogo from '../../assets/images/clubverse-logo.png';
import { useLogin } from '../../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({ 
        email: email.trim(), 
        password 
      });

      // Đăng nhập thành công
      Alert.alert(
        'Thành công',
        `Chào mừng ${response.user.fullName}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation) {
                navigation.replace('Main');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Đăng nhập thất bại',
        error.message || 'Email hoặc mật khẩu không đúng'
      );
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Tích hợp Google Login
    Alert.alert('Thông báo', 'Tính năng đăng nhập Google đang được phát triển');
  };

  const handleForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ForgotPassword');
    }
  };

  const handleSignUp = () => {
    if (navigation) {
      navigation.navigate('Register');
    }
  };

  return (
    <LinearGradient
      colors={["#5D2DE2", "#020721"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <View style={styles.scrollContent}>
          <View style={styles.logoWrapper}>
            <Image
              source={ClubverseLogo}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign In to discover the clubs
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.googleButtonWrapper}
              onPress={handleGoogleLogin}
              disabled={loginMutation.isPending}
            >
              <View style={styles.googleButtonInner}>
                <View style={styles.googleIconPlaceholder}>
                  <Text style={styles.googleIconLetter}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dividerWrapper}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.35)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loginMutation.isPending}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loginMutation.isPending}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.rememberWrapper}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
                disabled={loginMutation.isPending}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleForgotPassword} 
                activeOpacity={0.8}
                disabled={loginMutation.isPending}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.signInButtonWrapper,
                loginMutation.isPending && styles.signInButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
            >
              <LinearGradient
                colors={loginMutation.isPending ? ["#9D8DE2", "#C09BC8"] : ["#5D2DE2", "#F05BC8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                {loginMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footerTextWrapper}>
              <Text style={styles.footerTextNormal}>Don&apos;t have an account? </Text>
              <TouchableOpacity 
                onPress={handleSignUp} 
                activeOpacity={0.8}
                disabled={loginMutation.isPending}
              >
                <Text style={styles.footerTextLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const CARD_WIDTH = 320;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 200,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 270,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(5, 12, 39, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  cardHeader: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
  googleButtonWrapper: {
    marginBottom: 20,
  },
  googleButtonInner: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googleIconLetter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.5)',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.9)',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: 'rgba(15,23,42,0.7)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    backgroundColor: 'rgba(15,23,42,0.7)',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  eyeButton: {
    padding: 10,
    paddingRight: 12,
  },
  eyeIcon: {
    fontSize: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 20,
  },
  rememberWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.9)',
    marginRight: 6,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#5D2DE2',
    borderColor: '#5D2DE2',
  },
  rememberText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  forgotText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  signInButtonWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 18,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInGradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerTextNormal: {
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.9)',
  },
  footerTextLink: {
    fontSize: 12,
    color: '#F472B6',
    fontWeight: '500',
  },
});

export default LoginScreen;
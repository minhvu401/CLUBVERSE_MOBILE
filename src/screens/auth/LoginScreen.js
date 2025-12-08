import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // TODO: hook vào logic đăng nhập thực tế
  };

  const handleGoogleLogin = () => {
    // TODO: hook vào logic đăng nhập Google
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
              <Text style={styles.welcomeTitle}>Chào mừng trở lại</Text>
              <Text style={styles.welcomeSubtitle}>
                Đăng nhập để khám phá các câu lạc bộ
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.googleButtonWrapper}
              onPress={handleGoogleLogin}
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
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="rgba(255,255,255,0.35)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.rememberWrapper}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.8}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.signInButtonWrapper}
              onPress={handleLogin}
            >
              <LinearGradient
                colors={["#5D2DE2", "#F05BC8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footerTextWrapper}>
              <Text style={styles.footerTextNormal}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} activeOpacity={0.8}>
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


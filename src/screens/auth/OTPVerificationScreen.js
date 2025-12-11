import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import ClubverseLogo from '../../assets/images/clubverse-logo.png';
import { useResendOTP, useVerifyOTP } from '../../hooks/useAuth';

const OTPVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  useEffect(() => {
    // Start countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOTPChange = (value, index) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOTP = value.slice(0, 6).split('');
      const newOTP = [...otp];
      pastedOTP.forEach((digit, i) => {
        if (index + i < 6) {
          newOTP[index + i] = digit;
        }
      });
      setOtp(newOTP);
      // Focus last filled input
      const lastIndex = Math.min(index + pastedOTP.length - 1, 5);
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }
      return;
    }

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ 6 số OTP');
      return;
    }

    if (!email) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      const response = await verifyOTPMutation.mutateAsync({
        email,
        otp: otpCode,
      });

      Alert.alert(
        'Thành công',
        'Xác thực email thành công! Bạn có thể đăng nhập ngay.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('Login');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Mã OTP không đúng. Vui lòng thử lại.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      await resendOTPMutation.mutateAsync({ email });
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    }
  };

  return (
    <LinearGradient
      colors={['#5D2DE2', '#020721']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            {/* <Image source={ClubverseLogo} style={styles.logoImage} resizeMode="contain" /> */}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.welcomeTitle}>Verify Your Email</Text>
              <Text style={styles.welcomeSubtitle}>
                We've sent a 6-digit code to{'\n'}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
            </View>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    verifyOTPMutation.isPending && styles.otpInputDisabled,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!verifyOTPMutation.isPending}
                />
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.verifyButtonWrapper,
                verifyOTPMutation.isPending && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={verifyOTPMutation.isPending}
            >
              <LinearGradient
                colors={
                  verifyOTPMutation.isPending
                    ? ['#9D8DE2', '#C09BC8']
                    : ['#5D2DE2', '#F05BC8']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyGradient}
              >
                {verifyOTPMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyText}>Verify</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={resendOTPMutation.isPending}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.resendLink}>
                      {resendOTPMutation.isPending ? 'Sending...' : 'Resend'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>
                    Resend in {timer}s
                  </Text>
                )}
              </Text>
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
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
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
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#5D2DE2',
    backgroundColor: 'rgba(93, 45, 226, 0.2)',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  verifyButtonWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 18,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyGradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.9)',
    textAlign: 'center',
  },
  resendLink: {
    color: '#F472B6',
    fontWeight: '500',
  },
  timerText: {
    color: '#F472B6',
    fontWeight: '500',
  },
});

export default OTPVerificationScreen;


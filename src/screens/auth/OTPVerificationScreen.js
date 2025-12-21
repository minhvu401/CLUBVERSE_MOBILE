 
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClubverseLogo from '../../assets/images/clubverse-logo.png';
import { useResendOTP, useVerifyOTP } from '../../hooks/useAuth';

const OTPVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params || {};
  const normalizedEmail = (email || '').trim();
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

    if (!normalizedEmail) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      // eslint-disable-next-line no-unused-vars
      const response = await verifyOTPMutation.mutateAsync({
        email: normalizedEmail,
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
    if (!normalizedEmail) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      await resendOTPMutation.mutateAsync({ email: normalizedEmail });
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
      colors={['#B390EC', '#1E2960', '#4F1494', '#711B99', '#091345']}
      locations={[0.01, 0.25, 0.5, 0.75, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1 }}>
              <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>← Quay lại</Text>
                </TouchableOpacity>

                <View style={styles.logoWrapper}>
                  <Image source={ClubverseLogo} style={styles.logoImage} resizeMode="contain" />
                  
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.welcomeTitle}>Xác thực email của bạn</Text>
                    <Text style={styles.welcomeSubtitle}>
                      Vui lòng check spam mail nếu không thấy email xác thực{'\n'}
                      Chúng tôi đã gửi mã xác thực đến{'\n'}
                      <Text style={styles.emailText}>{normalizedEmail}</Text>
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
                          : ['#4F1494', '#FF4CAD']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.verifyGradient}
                    >
                      {verifyOTPMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.verifyText}>Xác thực</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Chưa nhận được mã?</Text>
                    {canResend ? (
                      <TouchableOpacity
                        onPress={handleResendOTP}
                        disabled={resendOTPMutation.isPending}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.resendLink}>
                          {resendOTPMutation.isPending ? 'Đang gửi...' : 'Gửi lại'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.timerText}>Gửi lại trong {timer}s</Text>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 260,
    height: 220,
  },
  appName: {
    fontSize: 28,
    fontWeight: '300',
    fontStyle: 'italic',
    color: '#E8D9FF',
    marginTop: 8,
    letterSpacing: 1.5,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(5, 12, 39, 0.95)',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    shadowColor: '#5D2DE2',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 15,
  },
  cardHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  otpInput: {
    width: 44,
    height: 54,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  otpInputFilled: {
    borderColor: '#A78BFA',
    backgroundColor: 'transparent',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  verifyButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#FF4CAD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  resendLink: {
    color: '#A78BFA',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  timerText: {
    color: '#A78BFA',
    fontWeight: '500',
  },
});

export default OTPVerificationScreen;


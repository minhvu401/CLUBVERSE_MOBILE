import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClubverseLogo from '../../assets/images/clubverse-logo.png';
import { useRegister } from '../../hooks/useAuth';

const RegisterScreen = () => {
  // Standard navigation hook
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'user',
    school: '',
    major: '',
    password: '',
    confirmPassword: '',
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useRegister();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên đầy đủ');
      return false;
    }

    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Lỗi', 'Định dạng email không hợp lệ');
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }

    if (!formData.school.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập trường học/đại học');
      return false;
    }

    if (!formData.major.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập chuyên ngành');
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng tạo mật khẩu');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return false;
    }

    if (!agreeTerms) {
      Alert.alert(
        'Lỗi',
        'Vui lòng đồng ý với Điều khoản & Điều kiện và Chính sách Bảo mật'
      );
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const trimmedEmail = formData.email.trim();
      const payload = {
        email: trimmedEmail,
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
        school: formData.school.trim(),
        major: formData.major.trim(),
      };

      await registerMutation.mutateAsync(payload);

      // Navigate to OTP verification screen
      if (navigation && navigation.navigate) {
        navigation.navigate('OTPVerification', { email: trimmedEmail });
      } else {
        Alert.alert(
          'Thành công',
          'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.'
        );
      }
    } catch (error) {
      Alert.alert('Đăng ký thất bại', error.message || 'Vui lòng thử lại');
    }
  };

  const handleSignIn = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Login');
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
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1 }}>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.logoWrapper}>
                  {ClubverseLogo && (
                    <Image
                      source={ClubverseLogo}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  )}
                </View>

                <View style={styles.card}>
                  {/* Full Name */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Họ và tên</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập họ và tên của bạn"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        value={formData.fullName}
                        onChangeText={(value) => handleInputChange('fullName', value)}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập email của bạn"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                      />
                    </View>
                  </View>

                  {/* Phone */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Số điện thoại</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập số điện thoại của bạn"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        keyboardType="phone-pad"
                        value={formData.phoneNumber}
                        onChangeText={(value) =>
                          handleInputChange('phoneNumber', value)
                        }
                      />
                    </View>
                  </View>

                  {/* School */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Trường học / Đại học</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập tên trường của bạn"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        value={formData.school}
                        onChangeText={(value) => handleInputChange('school', value)}
                      />
                    </View>
                  </View>

                  {/* Major */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Chuyên ngành</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập chuyên ngành của bạn"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        value={formData.major}
                        onChangeText={(value) => handleInputChange('major', value)}
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Mật khẩu</Text>
                    <View style={[styles.inputWrapper, styles.passwordContainer]}>
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Tạo mật khẩu"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        secureTextEntry={!showPassword}
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        <Text style={styles.eyeIcon}>
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Xác nhận mật khẩu</Text>
                    <View style={[styles.inputWrapper, styles.passwordContainer]}>
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Xác nhận mật khẩu của bạn"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        secureTextEntry={!showConfirmPassword}
                        value={formData.confirmPassword}
                        onChangeText={(value) =>
                          handleInputChange('confirmPassword', value)
                        }
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeButton}
                      >
                        <Text style={styles.eyeIcon}>
                          {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Terms & Conditions */}
                  <TouchableOpacity
                    style={styles.checkboxWrapper}
                    onPress={() => setAgreeTerms(!agreeTerms)}
                  >
                    <View
                      style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
                    >
                      {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Tôi đồng ý với{' '}
                      <Text style={styles.checkboxLinkText}>Điều khoản & Điều kiện</Text>{' '}
                      và <Text style={styles.checkboxLinkText}>Chính sách Bảo mật</Text>
                    </Text>
                  </TouchableOpacity>

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.signUpButtonWrapper,
                      registerMutation.isPending && styles.signUpButtonDisabled,
                    ]}
                    onPress={handleRegister}
                    disabled={registerMutation.isPending}
                  >
                    <LinearGradient
                      colors={
                        registerMutation.isPending
                          ? ['#9D8DE2', '#C09BC8']
                          : ['#5D2DE2', '#F05BC8']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.signUpGradient}
                    >
                      {registerMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.signUpText}>Đăng ký</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Sign In */}
                  <View style={styles.footerTextWrapper}>
                    <Text style={styles.footerTextNormal}>
                      Đã có tài khoản?{' '}
                    </Text>
                    <TouchableOpacity onPress={handleSignIn}>
                      <Text style={styles.footerTextLink}>Đăng nhập</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.bottomPadding} />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

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
    paddingBottom: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 300,
    height: 270,
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  card: {
    width: 320,
    backgroundColor: 'rgba(5, 12, 39, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  inputWrapper: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'center',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    backgroundColor: 'rgba(15,23,42,0.7)',
    paddingRight: 4,
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
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.9)',
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5D2DE2',
    borderColor: '#5D2DE2',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  checkboxLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  checkboxLinkText: {
    color: '#F472B6',
    textDecorationLine: 'underline',
  },
  signUpButtonWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 14,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpGradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
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
  bottomPadding: {
    height: 8,
  },
});

export default RegisterScreen;

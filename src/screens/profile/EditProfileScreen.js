import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '../../services/userService';
import { toast } from '../../utils/toast';

const EditProfileScreen = ({ navigation, route }) => {
  const { user } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    avatarUrl: '',
    school: '',
    major: '',
    description: '',
    skills: [],
    interests: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        avatarUrl: user.avatarUrl || '',
        school: user.school || '',
        major: user.major || '',
        // description: user.description || '',
        skills: user.skills || [],
        interests: user.interests || [],
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()],
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (index) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }

    try {
      setLoading(true);
      await userService.updateProfile(formData);
      toast.success('Cập nhật hồ sơ thành công');
      navigation.goBack();
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Quay lại</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Họ và tên</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(value) =>
                    handleInputChange('phoneNumber', value)
                  }
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Trường học</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên trường"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.school}
                  onChangeText={(value) => handleInputChange('school', value)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Chuyên ngành</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập chuyên ngành"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.major}
                  onChangeText={(value) => handleInputChange('major', value)}
                />
              </View>

              {/* <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mô tả / Giới thiệu bản thân</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Viết vài dòng về bản thân..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                />
              </View> */}

            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kỹ năng</Text>
              <View style={styles.addTagContainer}>
                <TextInput
                  style={[styles.input, styles.tagInput]}
                  placeholder="Thêm kỹ năng..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={skillInput}
                  onChangeText={setSkillInput}
                  onSubmitEditing={addSkill}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addSkill}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addButtonText}>+ Thêm</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagsWrapper}>
                {formData.skills.map((skill, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                    <TouchableOpacity
                      onPress={() => removeSkill(index)}
                      style={styles.removeTagButton}
                    >
                      <Text style={styles.removeTagText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sở thích</Text>
              <View style={styles.addTagContainer}>
                <TextInput
                  style={[styles.input, styles.tagInput]}
                  placeholder="Thêm sở thích..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={interestInput}
                  onChangeText={setInterestInput}
                  onSubmitEditing={addInterest}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addInterest}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addButtonText}>+ Thêm</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagsWrapper}>
                {formData.interests.map((interest, index) => (
                  <View key={index} style={[styles.tag, styles.interestTag]}>
                    <Text style={styles.tagText}>{interest}</Text>
                    <TouchableOpacity
                      onPress={() => removeInterest(index)}
                      style={styles.removeTagButton}
                    >
                      <Text style={styles.removeTagText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={loading ? ["#9D8DE2", "#C09BC8"] : ["#5D2DE2", "#F05BC8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
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
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  addTagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  addButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interestTag: {
    backgroundColor: 'rgba(236, 72, 153, 0.3)',
    borderColor: 'rgba(236, 72, 153, 0.5)',
  },
  tagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTagText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 14,
  },
  saveButton: {
    borderRadius: 16,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveGradient: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EditProfileScreen;

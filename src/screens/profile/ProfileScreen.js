
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogout } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const logoutMutation = useLogout();
  const isFocused = useIsFocused();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const profileData = await userService.getUserProfile();
        if (isMounted) {
          setUser(profileData);
        }
      } catch (_error) {
        console.error('Error loading user profile:', _error);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      if (navigation) {
        navigation.replace('Login');
      }
    } catch (_error) {}
  };

  const fullName = user?.fullName;
  const email = user?.email;
  const phoneNumber = user?.phoneNumber;
  const major = user?.major;
  const university = user?.school;
  const description = user?.description;
  const skills = user?.skills || [];
  const interests = user?.interests || [];
  const schedule = user?.schedule || {};

  return (
    <LinearGradient
      colors={["#5D2DE2", "#020721"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#7C3AED", "#EC4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerTopRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {fullName?.charAt(0)?.toUpperCase() || 'H'}
                </Text>
              </View>

              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{fullName}</Text>
                <Text style={styles.headerMajor}>{major}</Text>
                <Text style={styles.headerUniversity}>{university}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.settingsButton}
                onPress={() => navigation?.navigate('EditProfile', { user })}
              >
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>{fullName || 'Chưa cập nhật'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email || 'Chưa cập nhật'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{phoneNumber || 'Chưa cập nhật'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Khoa/Ngành</Text>
                <View style={styles.infoValueRow}>
                  <Text style={styles.infoValue}>{major || 'Chưa cập nhật'}</Text>
                  <Text style={styles.infoValue}>{user?.year ? `Năm ${user.year}` : ''}</Text>
                </View>
              </View>
              {description && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Giới thiệu bản thân</Text>
                  <Text style={styles.bioText}>{description}</Text>
                </View>
              )}
            </View>
          </View>

          {(skills.length > 0 || interests.length > 0) && (
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>Kỹ năng & Sở thích</Text>

              <View style={styles.skillsCard}>
                {skills.length > 0 && (
                  <View style={styles.tagsContainer}>
                    <Text style={styles.tagsSectionLabel}>Kỹ năng</Text>
                    <View style={styles.tagsWrapper}>
                      {skills.map((skill, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {interests.length > 0 && (
                  <View style={styles.tagsContainer}>
                    <Text style={styles.tagsSectionLabel}>Sở thích</Text>
                    <View style={styles.tagsWrapper}>
                      {interests.map((interest, index) => (
                        <View key={index} style={[styles.tag, styles.interestTag]}>
                          <Text style={styles.tagText}>{interest}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {schedule && Object.keys(schedule).length > 0 && (
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>Lịch rảnh</Text>
              <View style={styles.scheduleContainer}>
                {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, index) => {
                  const dayKey = `day${index + 1}`;
                  const slots = schedule[dayKey] || [];
                  return (
                    <View key={index} style={styles.scheduleDay}>
                      <Text style={styles.scheduleDayLabel}>{day}</Text>
                      <View style={styles.scheduleSlots}>
                        {slots.length > 0 ? (
                          slots.map((slot, slotIndex) => (
                            <View key={slotIndex} style={styles.scheduleSlot}>
                              <Text style={styles.scheduleSlotText}>{slot}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noScheduleText}>-</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>Cài đặt</Text>

            <View style={styles.settingList}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.settingItem}
                onPress={() =>
                  navigation?.navigate(user?.role === 'club' ? 'ClubApplications' : 'MyApplications')
                }
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>📝</Text>
                  <Text style={styles.settingText}>Đơn gia nhập</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🏷️</Text>
                  <Text style={styles.settingText}>CLB đã tham gia</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🔔</Text>
                  <Text style={styles.settingText}>Cài đặt thông báo</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.logoutText}>Đăng xuất</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 28,
    padding: 18,
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
    
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerMajor: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  headerUniversity: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  settingsButton: {
    padding: 6,
  },
  settingsIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  skillSummaryCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  skillSummaryLeft: {
    flex: 1,
  },
  skillSummaryTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
  },
  skillSummaryLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FACC6B',
    marginBottom: 4,
  },
  skillSummarySub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  skillSummaryRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skillSummaryPoints: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skillSummaryPointsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(148,163,184,0.7)',
  },
  sectionWrapper: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  sectionActionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  badgeCard: {
    width: '48%',
    borderRadius: 18,
    padding: 12,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  badgeSubtitle: {
    fontSize: 11,
    color: 'rgba(15,23,42,0.9)',
    marginBottom: 8,
  },
  badgeDate: {
    fontSize: 10,
    color: 'rgba(15,23,42,0.8)',
  },
  skillList: {
    rowGap: 10,
  },
  skillItem: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  skillRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillName: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  skillPoints: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  skillProgressBackground: {
    flexDirection: 'row',
    borderRadius: 999,
    overflow: 'hidden',
    height: 6,
    backgroundColor: 'rgba(30,64,175,0.6)',
  },
  skillProgressFill: {
    backgroundColor: '#A855F7',
  },
  skillProgressRemaining: {
    backgroundColor: 'transparent',
  },
  settingList: {
    marginTop: 12,
    rowGap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#E5E7EB',
  },
  settingText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  settingArrow: {
    fontSize: 18,
    color: 'rgba(148,163,184,0.9)',
  },
  logoutButton: {
    marginTop: 4,
    backgroundColor: '#EF4444',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  infoRow: {
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  infoValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bioText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  tagsContainer: {
    gap: 10,
  },
  tagsSectionLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
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
  scheduleContainer: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  scheduleDay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  scheduleDayLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    width: 60,
  },
  scheduleSlots: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scheduleSlot: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  scheduleSlotText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  noScheduleText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  skillsCard: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 18,
    padding: 16,
    gap: 16,
  },
});

export default ProfileScreen;


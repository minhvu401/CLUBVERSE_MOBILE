
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
import { authService } from '../../services/authService';

const mockSoftSkillBadges = [
  {
    id: '1',
    title: 'Kỹ năng Lãnh đạo Cấp 1',
    subtitle: 'Tham gia ít nhất 1 hoạt động trong CLB',
    date: '15/08/2025',
    color: '#FBBF24',
  },
  {
    id: '2',
    title: 'Người đồng hành',
    subtitle: 'Tham gia 5 sự kiện',
    date: '20/08/2025',
    color: '#38BDF8',
  },
  {
    id: '3',
    title: 'Học viên xuất sắc',
    subtitle: 'Hoàn thành 3 workshop',
    date: '10/09/2025',
    color: '#FB7185',
  },
  {
    id: '4',
    title: 'Networking Pro',
    subtitle: 'Kết nối với 50+ thành viên',
    date: '05/10/2025',
    color: '#34D399',
  },
];

const mockSkills = [
  { id: '1', name: 'Leadership', points: 450, max: 500 },
  { id: '2', name: 'Communication', points: 360, max: 500 },
  { id: '3', name: 'Teamwork', points: 510, max: 600 },
  { id: '4', name: 'Problem Solving', points: 300, max: 500 },
];

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const logoutMutation = useLogout();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const current = await authService.getCurrentUser();
        if (isMounted) {
          setUser(current);
        }
      } catch (_error) {}
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      if (navigation) {
        navigation.replace('Login');
      }
    } catch (_error) {}
  };

  const fullName = user?.fullName ;
  const major = user?.major ;
  const university = user?.school ;

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
              >
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.skillSummaryCard}>
              <View style={styles.skillSummaryLeft}>
                <Text style={styles.skillSummaryTitle}>Điểm kỹ năng</Text>
                <Text style={styles.skillSummaryLevel}>Level 5</Text>
                <Text style={styles.skillSummarySub}>250 điểm nữa để đạt Level 6</Text>
              </View>
              <View style={styles.skillSummaryRight}>
                <Text style={styles.skillSummaryPoints}>1250</Text>
                <Text style={styles.skillSummaryPointsLabel}>điểm</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4</Text>
                <Text style={styles.statLabel}>Huy hiệu</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>CLB</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Sự kiện</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Chứng chỉ kỹ năng mềm</Text>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.sectionActionText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.badgeGrid}>
              {mockSoftSkillBadges.map((badge) => (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, { backgroundColor: badge.color }]}
                >
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={styles.badgeSubtitle}>{badge.subtitle}</Text>
                  <Text style={styles.badgeDate}>{badge.date}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Kỹ năng của bạn</Text>
            </View>

            <View style={styles.skillList}>
              {mockSkills.map((skill) => {
                const progress = skill.points / skill.max;
                return (
                  <View key={skill.id} style={styles.skillItem}>
                    <View style={styles.skillRowTop}>
                      <Text style={styles.skillName}>{skill.name}</Text>
                      <Text style={styles.skillPoints}>{skill.points} pts</Text>
                    </View>
                    <View style={styles.skillProgressBackground}>
                      <View
                        style={[styles.skillProgressFill, { flex: progress }]}
                      />
                      <View
                        style={[styles.skillProgressRemaining, { flex: 1 - progress }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>Cài đặt</Text>

            <View style={styles.settingList}>
              <TouchableOpacity activeOpacity={0.8} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>👤</Text>
                  <Text style={styles.settingText}>Thông tin cá nhân</Text>
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
    marginBottom: 16,
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
});

export default ProfileScreen;


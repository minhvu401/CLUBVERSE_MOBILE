import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { applicationService } from '../../services/applicationService';

const MyApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const isFocused = useIsFocused();

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getMyApplications();
        if (isMounted) {
          setApplications(response.applications || []);
          
          // Calculate statistics
          const total = response.total || 0;
          const pending = response.applications?.filter(
            (app) => app.status === 'PENDING'
          ).length || 0;
          const approved = response.applications?.filter(
            (app) => app.status === 'APPROVED'
          ).length || 0;
          const rejected = response.applications?.filter(
            (app) => app.status === 'REJECTED'
          ).length || 0;

          setStats({ total, pending, approved, rejected });
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        if (isMounted) {
          Alert.alert('Lỗi', error.message || 'Không thể tải danh sách đơn');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isFocused) {
      loadApplications();
    }

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const handleCancelApplication = async (applicationId, clubName) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn hủy đơn gia nhập "${clubName}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              await applicationService.cancelApplication(applicationId);
              // Reload applications
              const response = await applicationService.getMyApplications();
              setApplications(response.applications || []);
              
              const total = response.total || 0;
              const pending = response.applications?.filter(
                (app) => app.status === 'PENDING'
              ).length || 0;
              const approved = response.applications?.filter(
                (app) => app.status === 'APPROVED'
              ).length || 0;
              const rejected = response.applications?.filter(
                (app) => app.status === 'REJECTED'
              ).length || 0;

              setStats({ total, pending, approved, rejected });
              
              Alert.alert('Thành công', 'Đã hủy đơn gia nhập');
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể hủy đơn');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#FACC6B';
      case 'APPROVED':
        return '#34C25E';
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#94A3B8';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã phê duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return status;
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đơn Gia Nhập</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Chờ duyệt</Text>
                <Text style={styles.statIcon}>⏰</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.approved}</Text>
                <Text style={styles.statLabel}>Đã phê duyệt</Text>
                <Text style={styles.statIcon}>✓</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.rejected}</Text>
                <Text style={styles.statLabel}>Từ chối</Text>
                <Text style={styles.statIcon}>✗</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Tổng đơn</Text>
                <Text style={styles.statIcon}>📄</Text>
              </View>
            </View>

            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>Đơn Đăng Ký Của Tôi</Text>

              {applications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Bạn chưa có đơn gia nhập nào
                  </Text>
                </View>
              ) : (
                <View style={styles.applicationsList}>
                  {applications.map((application) => (
                    <View key={application._id} style={styles.applicationCard}>
                      <View style={styles.applicationHeader}>
                        <View style={styles.clubInfo}>
                          <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitial}>
                              {application.clubId?.fullName?.charAt(0)?.toUpperCase() || 'C'}
                            </Text>
                          </View>
                          <View style={styles.clubDetails}>
                            <Text style={styles.clubName}>
                              {application.clubId?.fullName || 'Câu lạc bộ'}
                            </Text>
                            <Text style={styles.applicationDate}>
                              Nộp đơn: {formatDate(application.submittedAt)}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(application.status) + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: getStatusColor(application.status) },
                            ]}
                          >
                            {getStatusText(application.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.reasonSection}>
                        <Text style={styles.reasonLabel}>Lý do gia nhập:</Text>
                        <Text style={styles.reasonText}>
                          {application.reason || 'Không có lý do'}
                        </Text>
                      </View>

                      {application.status === 'PENDING' && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() =>
                              handleCancelApplication(
                                application._id,
                                application.clubId?.fullName
                              )
                            }
                            activeOpacity={0.8}
                          >
                            <Text style={styles.cancelButtonText}>Hủy đơn</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  statIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 20,
  },
  sectionWrapper: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  applicationsList: {
    gap: 12,
  },
  applicationCard: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 16,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clubDetails: {
    flex: 1,
  },
  clubName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reasonSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.2)',
  },
  reasonLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 6,
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.2)',
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default MyApplicationsScreen;


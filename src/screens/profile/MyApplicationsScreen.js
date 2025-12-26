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
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { applicationService } from '../../services/applicationService';
import { toast } from '../../utils/toast';

const MyApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [applicationToCancel, setApplicationToCancel] = useState(null);
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
            (app) => app.status === 'APPROVED' || app.status === 'ACCEPTED'
          ).length || 0;
          const rejected = response.applications?.filter(
            (app) => app.status === 'REJECTED' || app.status === 'DECLINED'
          ).length || 0;

          setStats({ total, pending, approved, rejected });
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        if (isMounted) {
          toast.error(error.message || 'Không thể tải danh sách đơn');
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
    setApplicationToCancel({ id: applicationId, clubName });
    setCancelDialogVisible(true);
  };

  const confirmCancelApplication = async () => {
    if (!applicationToCancel) return;
    
    setCancelDialogVisible(false);
    try {
      await applicationService.cancelApplication(applicationToCancel.id);
      // Reload applications
      const response = await applicationService.getMyApplications();
      setApplications(response.applications || []);

      const total = response.total || 0;
      const pending = response.applications?.filter(
        (app) => app.status === 'PENDING'
      ).length || 0;
      const approved = response.applications?.filter(
        (app) => app.status === 'APPROVED' || app.status === 'ACCEPTED'
      ).length || 0;
              const rejected = response.applications?.filter(
                (app) => app.status === 'REJECTED' || app.status === 'DECLINED'
              ).length || 0;

              setStats({ total, pending, approved, rejected });

              toast.success('Đã hủy đơn gia nhập');
            } catch (error) {
              toast.error(error.message || 'Không thể hủy đơn');
            } finally {
              setApplicationToCancel(null);
            }
  };

  const cancelCancelApplication = () => {
    setCancelDialogVisible(false);
    setApplicationToCancel(null);
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
      case 'ACCEPTED':
        return '#34C25E';
      case 'REJECTED':
      case 'DECLINED':
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
      case 'DECLINED':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const handleFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setFilterDropdownVisible(false);
  };

  const filteredApplications = (() => {
    if (statusFilter === 'ALL') return applications;
    if (statusFilter === 'REJECTED') {
      return applications.filter(
        (app) => app.status === 'REJECTED' || app.status === 'DECLINED'
      );
    }
    if (statusFilter === 'APPROVED') {
      return applications.filter(
        (app) => app.status === 'APPROVED' || app.status === 'ACCEPTED'
      );
    }
    return applications.filter((app) => app.status === statusFilter);
  })();

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
                
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.approved}</Text>
                <Text style={styles.statLabel}>Đã phê duyệt</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.rejected}</Text>
                <Text style={styles.statLabel}>Từ chối</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Tổng đơn</Text>
              </View>
            </View>

            <View style={styles.sectionWrapper}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Đơn Đăng Ký Của Tôi</Text>
                <View style={styles.filterDropdownContainer}>
                  <TouchableOpacity
                    style={styles.filterDropdownButton}
                    onPress={() => setFilterDropdownVisible(!filterDropdownVisible)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.filterDropdownText}>
                      {statusFilter === 'ALL' && 'Tất cả trạng thái'}
                      {statusFilter === 'PENDING' && 'Chờ duyệt'}
                      {statusFilter === 'APPROVED' && 'Đã phê duyệt'}
                      {statusFilter === 'REJECTED' && 'Đã từ chối'}
                    </Text>
                    <Text style={styles.filterDropdownIcon}>
                      {filterDropdownVisible ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>

                  {filterDropdownVisible && (
                    <View style={styles.filterDropdownMenu}>
                      <TouchableOpacity
                        style={[
                          styles.filterDropdownItem,
                          statusFilter === 'ALL' && styles.filterDropdownItemActive,
                        ]}
                        onPress={() => handleFilterChange('ALL')}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            statusFilter === 'ALL' && styles.filterDropdownItemTextActive,
                          ]}
                        >
                          Tất cả trạng thái
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.filterDropdownItem,
                          statusFilter === 'PENDING' && styles.filterDropdownItemActive,
                        ]}
                        onPress={() => handleFilterChange('PENDING')}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            statusFilter === 'PENDING' && styles.filterDropdownItemTextActive,
                          ]}
                        >
                          Chờ duyệt
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.filterDropdownItem,
                          statusFilter === 'APPROVED' && styles.filterDropdownItemActive,
                        ]}
                        onPress={() => handleFilterChange('APPROVED')}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            statusFilter === 'APPROVED' && styles.filterDropdownItemTextActive,
                          ]}
                        >
                          Đã phê duyệt
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.filterDropdownItem,
                          statusFilter === 'REJECTED' && styles.filterDropdownItemActive,
                        ]}
                        onPress={() => handleFilterChange('REJECTED')}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            statusFilter === 'REJECTED' && styles.filterDropdownItemTextActive,
                          ]}
                        >
                          Đã từ chối
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {filteredApplications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Bạn chưa có đơn gia nhập nào
                  </Text>
                </View>
              ) : (
                <View style={styles.applicationsList}>
                  {filteredApplications.map((application) => (
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

        <ConfirmationDialog
          visible={cancelDialogVisible}
          title="Xác nhận"
          message={`Bạn có chắc chắn muốn hủy đơn gia nhập "${applicationToCancel?.clubName || ''}"?`}
          confirmText="Xác nhận"
          cancelText="Hủy"
          onConfirm={confirmCancelApplication}
          onCancel={cancelCancelApplication}
          type="danger"
        />
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  filterDropdownContainer: {
    position: 'relative',
    zIndex: 20,
  },
  filterDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    minWidth: 160,
  },
  filterDropdownText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  filterDropdownIcon: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    minWidth: 190,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 20,
  },
  filterDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.1)',
  },
  filterDropdownItemActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  filterDropdownItemText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  filterDropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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


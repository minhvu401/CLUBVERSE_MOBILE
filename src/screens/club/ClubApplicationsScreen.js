import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogout } from '../../hooks/useAuth';
import { applicationService } from '../../services/applicationService';
import { authService } from '../../services/authService';

const ClubApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clubId, setClubId] = useState(null);
  const logoutMutation = useLogout();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    accepted: 0,
    rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNote, setInterviewNote] = useState('');
  const [finalDecisionModalVisible, setFinalDecisionModalVisible] = useState(false);
  const [selectedFinalDecisionAppId, setSelectedFinalDecisionAppId] = useState(null);
  const [selectedFinalDecisionUserName, setSelectedFinalDecisionUserName] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    let isMounted = true;

    const loadClubId = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          // Check both _id and id (some APIs return id, some return _id)
          const id = user._id || user.id;
          if (id) {
            setClubId(id);
          } else {
            console.error('Club ID not found in user object:', user);
            Alert.alert('Lỗi', 'Không tìm thấy ID của club');
          }
        }
      } catch (error) {
        console.error('Error loading club ID:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin club');
      }
    };

    loadClubId();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      if (!clubId) return;

      try {
        setLoading(true);
        const response = await applicationService.getClubApplications(clubId);
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
          const accepted = response.applications?.filter(
            (app) => app.status === 'ACCEPTED'
          ).length || 0;
          const rejected = response.applications?.filter(
            (app) => app.status === 'REJECTED'
          ).length || 0;

          setStats({ total, pending, approved, accepted, rejected });
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

    if (isFocused && clubId) {
      loadApplications();
    }

    return () => {
      isMounted = false;
    };
  }, [isFocused, clubId]);

  const handleApprove = (applicationId, userName) => {
    setSelectedApplicationId(applicationId);
    setSelectedUserName(userName);
    setInterviewDate('');
    setInterviewLocation('');
    setInterviewNote('');
    setApproveModalVisible(true);
  };

  const confirmApprove = async () => {
    if (!interviewDate.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày phỏng vấn');
      return;
    }

    if (!interviewLocation.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa điểm phỏng vấn');
      return;
    }

    try {
      // Format date from YYYY-MM-DD HH:mm to ISO string
      const dateStr = interviewDate.trim();
      // Match format: YYYY-MM-DD HH:mm
      const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);

      if (!dateMatch) {
        Alert.alert('Lỗi', 'Ngày phỏng vấn không đúng định dạng YYYY-MM-DD HH:mm');
        return;
      }

      const [, year, month, day, hour, minute] = dateMatch;

      // Validate date values
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
      if (isNaN(date.getTime())) {
        Alert.alert('Lỗi', 'Ngày phỏng vấn không hợp lệ');
        return;
      }

      // Convert to ISO string
      const isoDate = date.toISOString();

      const interviewData = {
        interviewDate: isoDate,
        interviewLocation: interviewLocation.trim(),
        interviewNote: interviewNote.trim() || undefined,
      };

      await applicationService.approveApplication(selectedApplicationId, interviewData);
      setApproveModalVisible(false);
      setInterviewDate('');
      setInterviewLocation('');
      setInterviewNote('');

      // Reload applications
      const response = await applicationService.getClubApplications(clubId);
      setApplications(response.applications || []);

      const total = response.total || 0;
      const pending = response.applications?.filter(
        (app) => app.status === 'PENDING'
      ).length || 0;
      const approved = response.applications?.filter(
        (app) => app.status === 'APPROVED'
      ).length || 0;
      const accepted = response.applications?.filter(
        (app) => app.status === 'ACCEPTED'
      ).length || 0;
      const rejected = response.applications?.filter(
        (app) => app.status === 'REJECTED'
      ).length || 0;

      setStats({ total, pending, approved, accepted, rejected });

      Alert.alert('Thành công', 'Đã phê duyệt đơn và gửi lịch phỏng vấn');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể phê duyệt đơn');
    }
  };

  const handleReject = (applicationId, userName) => {
    setSelectedApplicationId(applicationId);
    setSelectedUserName(userName);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await applicationService.rejectApplication(selectedApplicationId, rejectReason.trim());
      setRejectModalVisible(false);
      setRejectReason('');

      // Reload applications
      const response = await applicationService.getClubApplications(clubId);
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

      Alert.alert('Thành công', 'Đã từ chối đơn gia nhập');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể từ chối đơn');
    }
  };

  const handleFinalDecision = (applicationId, userName) => {
    setSelectedFinalDecisionAppId(applicationId);
    setSelectedFinalDecisionUserName(userName);
    setFinalDecisionModalVisible(true);
  };

  const confirmFinalDecision = async (decision) => {
    try {
      await applicationService.finalDecision(
        selectedFinalDecisionAppId,
        decision,
        null // Không gửi rejectionReason
      );
      setFinalDecisionModalVisible(false);

      // Reload applications
      const response = await applicationService.getClubApplications(clubId);
      setApplications(response.applications || []);

      const total = response.total || 0;
      const pending = response.applications?.filter(
        (app) => app.status === 'PENDING'
      ).length || 0;
      const approved = response.applications?.filter(
        (app) => app.status === 'APPROVED'
      ).length || 0;
      const accepted = response.applications?.filter(
        (app) => app.status === 'ACCEPTED'
      ).length || 0;
      const rejected = response.applications?.filter(
        (app) => app.status === 'REJECTED'
      ).length || 0;

      setStats({ total, pending, approved, accepted, rejected });

      Alert.alert('Thành công', decision === 'accepted' ? 'Đã chấp nhận thành viên' : 'Đã từ chối thành viên');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể thực hiện xác nhận cuối cùng');
    }
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
      case 'ACCEPTED':
        return '#10B981';
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
      case 'ACCEPTED':
        return 'Đã chấp nhận';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const handleFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setFilterDropdownVisible(false);
  };

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'ALL') {
      return applications;
    }
    return applications.filter((app) => app.status === statusFilter);
  }, [statusFilter, applications]);

  return (
    <LinearGradient
      colors={['#5D2DE2', '#020721']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Đơn Gia Nhập Câu Lạc Bộ</Text>
              <Text style={styles.headerSubtitle}>
                Xem xét và phê duyệt đơn đăng ký thành viên mới
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={async () => {
                  if (!clubId) return;
                  try {
                    setLoading(true);
                    const response = await applicationService.getClubApplications(clubId);
                    setApplications(response.applications || []);

                    const total = response.total || 0;
                    const pending = response.applications?.filter(
                      (app) => app.status === 'PENDING'
                    ).length || 0;
                    const approved = response.applications?.filter(
                      (app) => app.status === 'APPROVED'
                    ).length || 0;
                    const accepted = response.applications?.filter(
                      (app) => app.status === 'ACCEPTED'
                    ).length || 0;
                    const rejected = response.applications?.filter(
                      (app) => app.status === 'REJECTED'
                    ).length || 0;

                    setStats({ total, pending, approved, accepted, rejected });
                  } catch (error) {
                    Alert.alert('Lỗi', error.message || 'Không thể tải danh sách đơn');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.refreshButtonText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={async () => {
                  Alert.alert(
                    'Xác nhận',
                    'Bạn có chắc chắn muốn đăng xuất?',
                    [
                      {
                        text: 'Hủy',
                        style: 'cancel',
                      },
                      {
                        text: 'Đăng xuất',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await logoutMutation.mutateAsync();
                            if (navigation) {
                              navigation.replace('Login');
                            }
                          } catch (error) {
                            Alert.alert('Lỗi', error.message || 'Không thể đăng xuất');
                          }
                        },
                      },
                    ]
                  );
                }}
                disabled={logoutMutation.isPending}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
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
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Đơn Đăng Ký Mới</Text>
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
                        {statusFilter === 'ACCEPTED' && 'Đã chấp nhận'}
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
                            statusFilter === 'ACCEPTED' && styles.filterDropdownItemActive,
                          ]}
                          onPress={() => handleFilterChange('ACCEPTED')}
                        >
                          <Text
                            style={[
                              styles.filterDropdownItemText,
                              statusFilter === 'ACCEPTED' && styles.filterDropdownItemTextActive,
                            ]}
                          >
                            Đã chấp nhận
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
                      {statusFilter === 'ALL'
                        ? 'Chưa có đơn đăng ký nào'
                        : 'Không có đơn nào với trạng thái này'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.applicationsList}>
                    {filteredApplications.map((application) => (
                      <View key={application._id} style={styles.applicationCard}>
                        <View style={styles.applicationHeader}>
                          <View style={styles.userInfo}>
                            <View style={styles.avatarCircle}>
                              <Text style={styles.avatarInitial}>
                                {application.userId?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                              </Text>
                            </View>
                            <View style={styles.userDetails}>
                              <Text style={styles.userName}>
                                {application.userId?.fullName || 'Người dùng'}
                              </Text>
                              <Text style={styles.userInfoText}>
                                {application.userId?.email || ''}
                              </Text>
                              <Text style={styles.userInfoText}>
                                {application.userId?.school || ''} • {application.userId?.major || ''}
                                {application.userId?.year ? ` • Năm ${application.userId.year}` : ''}
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

                        {application.status === 'REJECTED' && application.rejectionReason && (
                          <View style={styles.rejectionReasonSection}>
                            <Text style={styles.rejectionReasonLabel}>Lý do từ chối:</Text>
                            <Text style={styles.rejectionReasonText}>
                              {application.rejectionReason}
                            </Text>
                          </View>
                        )}

                        {application.status === 'APPROVED' && application.interviewDate && (
                          <View style={styles.interviewSection}>
                            <Text style={styles.interviewLabel}>Thông tin phỏng vấn:</Text>
                            <View style={styles.interviewInfo}>
                              <Text style={styles.interviewText}>
                                📅 Ngày: {formatDate(application.interviewDate)}
                              </Text>
                              {application.interviewLocation && (
                                <Text style={styles.interviewText}>
                                  📍 Địa điểm: {application.interviewLocation}
                                </Text>
                              )}
                              {application.interviewNote && (
                                <Text style={styles.interviewText}>
                                  📝 Ghi chú: {application.interviewNote}
                                </Text>
                              )}
                            </View>
                          </View>
                        )}

                        {application.status === 'PENDING' && (
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              style={styles.rejectButton}
                              onPress={() =>
                                handleReject(
                                  application._id,
                                  application.userId?.fullName
                                )
                              }
                              activeOpacity={0.8}
                            >
                              <Text style={styles.rejectButtonText}>Từ chối</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.approveButton}
                              onPress={() =>
                                handleApprove(
                                  application._id,
                                  application.userId?.fullName
                                )
                              }
                              activeOpacity={0.8}
                            >
                              <Text style={styles.approveButtonText}>Duyệt</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {application.status === 'APPROVED' && application.interviewDate && (
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              style={styles.finalDecisionButton}
                              onPress={() =>
                                handleFinalDecision(
                                  application._id,
                                  application.userId?.fullName
                                )
                              }
                              activeOpacity={0.8}
                            >
                              <Text style={styles.finalDecisionButtonText}>Xác nhận cuối cùng</Text>
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

          {/* Reject Modal */}
          <Modal
            visible={rejectModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setRejectModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Từ chối đơn gia nhập</Text>
                <Text style={styles.modalSubtitle}>
                  Vui lòng nhập lý do từ chối đơn của "{selectedUserName}"
                </Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Nhập lý do từ chối..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  numberOfLines={4}
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  textAlignVertical="top"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setRejectModalVisible(false);
                      setRejectReason('');
                    }}
                  >
                    <Text style={styles.modalButtonCancelText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={confirmReject}
                  >
                    <Text style={styles.modalButtonConfirmText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Approve Modal */}
          <Modal
            visible={approveModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setApproveModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Phê duyệt đơn gia nhập</Text>
                <Text style={styles.modalSubtitle}>
                  Nhập thông tin phỏng vấn cho "{selectedUserName}"
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Ngày phỏng vấn *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="YYYY-MM-DD HH:mm (ví dụ: 2025-12-01 10:00)"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={interviewDate}
                    onChangeText={setInterviewDate}
                  />
                  <Text style={styles.fieldHint}>
                    Định dạng: YYYY-MM-DD HH:mm
                  </Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Địa điểm phỏng vấn *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Nhập địa điểm phỏng vấn..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={interviewLocation}
                    onChangeText={setInterviewLocation}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Ghi chú (tùy chọn)</Text>
                  <TextInput
                    style={[styles.modalTextInput, styles.textArea]}
                    placeholder="Nhập ghi chú phỏng vấn..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={interviewNote}
                    onChangeText={setInterviewNote}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setApproveModalVisible(false);
                      setInterviewDate('');
                      setInterviewLocation('');
                      setInterviewNote('');
                    }}
                  >
                    <Text style={styles.modalButtonCancelText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonApprove]}
                    onPress={confirmApprove}
                  >
                    <Text style={styles.modalButtonApproveText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        {/* Final Decision Modal */}
        <Modal
          visible={finalDecisionModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setFinalDecisionModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setFinalDecisionModalVisible(false)}
          >
              <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                <Text style={styles.modalTitle}>Xác nhận cuối cùng</Text>
                <Text style={styles.modalSubtitle}>
                  Chọn quyết định cuối cùng cho "{selectedFinalDecisionUserName}"
                </Text>

                <View style={styles.finalDecisionButtons}>
                  <TouchableOpacity
                    style={[styles.finalDecisionOption, styles.finalDecisionAccept]}
                    onPress={() => confirmFinalDecision('accepted')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.finalDecisionOptionText, { color: '#34C25E' }]}>Chấp nhận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.finalDecisionOption, styles.finalDecisionDecline]}
                    onPress={() => confirmFinalDecision('declined')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.finalDecisionOptionText, { color: '#EF4444' }]}>Từ chối</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
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
    minWidth: 140,
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
    minWidth: 180,
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
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  filterButtonText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userInfoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  applicationDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
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
  rejectionReasonSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  rejectionReasonLabel: {
    fontSize: 12,
    color: 'rgba(239, 68, 68, 0.9)',
    marginBottom: 6,
    fontWeight: '600',
  },
  rejectionReasonText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  interviewSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.2)',
  },
  interviewLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 6,
    fontWeight: '500',
  },
  interviewInfo: {
    gap: 4,
  },
  interviewText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.2)',
  },
  rejectButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  rejectButtonText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: 'rgba(52, 194, 94, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 194, 94, 0.5)',
  },
  approveButtonText: {
    fontSize: 13,
    color: '#34C25E',
    fontWeight: '600',
  },
  finalDecisionButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    flex: 1,
    alignItems: 'center',
  },
  finalDecisionButtonText: {
    fontSize: 13,
    color: '#A855F7',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  modalTextInput: {
    backgroundColor: 'rgba(5, 12, 39, 0.8)',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    minHeight: 100,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(148,163,184,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
  },
  modalButtonConfirm: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  modalButtonCancelText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalButtonConfirmText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalButtonApprove: {
    backgroundColor: 'rgba(52, 194, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 194, 94, 0.5)',
  },
  modalButtonApproveText: {
    fontSize: 14,
    color: '#34C25E',
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
    fontWeight: '500',
  },
  fieldHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  finalDecisionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  finalDecisionOption: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  finalDecisionAccept: {
    backgroundColor: 'rgba(52, 194, 94, 0.2)',
    borderColor: 'rgba(52, 194, 94, 0.5)',
  },
  finalDecisionDecline: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  finalDecisionOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 15,
    backgroundColor: 'transparent',
  },
});

export default ClubApplicationsScreen;


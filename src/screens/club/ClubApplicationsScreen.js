import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useLogout } from '../../hooks/useAuth';
import { applicationService } from '../../services/applicationService';
import { authService } from '../../services/authService';
import { toast } from '../../utils/toast';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [finalDecisionModalVisible, setFinalDecisionModalVisible] = useState(false);
  const [selectedFinalDecisionAppId, setSelectedFinalDecisionAppId] = useState(null);
  const [selectedFinalDecisionUserName, setSelectedFinalDecisionUserName] = useState('');
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const isFocused = useIsFocused();

  const normalizeApplicationsResponse = useCallback((res) => {
    const apps =
      res?.applications ||
      res?.data?.applications ||
      res?.data?.data?.applications ||
      res?.data?.data ||
      res?.data ||
      [];
    const list = Array.isArray(apps) ? apps : [];
    const total =
      res?.total ??
      res?.data?.total ??
      res?.data?.data?.total ??
      (Array.isArray(list) ? list.length : 0);
    return { applications: list, total };
  }, []);

  useEffect(() => {
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
            toast.error('Không tìm thấy ID của club');
          }
        }
      } catch (error) {
        console.error('Error loading club ID:', error);
        toast.error(error.message || 'Không thể tải thông tin club');
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
        const normalized = normalizeApplicationsResponse(response);
        if (isMounted) {
          setApplications(normalized.applications);

          // Calculate statistics
          const total = normalized.total || 0;
          const pending = normalized.applications?.filter(
            (app) => app.status === 'PENDING'
          ).length || 0;
          const approved = normalized.applications?.filter(
            (app) => app.status === 'APPROVED'
          ).length || 0;
          const accepted = normalized.applications?.filter(
            (app) => app.status === 'ACCEPTED'
          ).length || 0;
          const rejected = normalized.applications?.filter(
            (app) => app.status === 'REJECTED' || app.status === 'DECLINED'
          ).length || 0;

          setStats({ total, pending, approved, accepted, rejected });
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

    if (isFocused && clubId) {
      loadApplications();
    }

    return () => {
      isMounted = false;
    };
  }, [isFocused, clubId, normalizeApplicationsResponse]);

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
      toast.error('Vui lòng nhập ngày phỏng vấn');
      return;
    }

    if (!interviewLocation.trim()) {
      toast.error('Vui lòng nhập địa điểm phỏng vấn');
      return;
    }

    try {
      // Validate date from YYYY-MM-DD HH:mm and convert to ISO 8601 (local time, no TZ)
      const dateStr = interviewDate.trim();
      // Match format: YYYY-MM-DD HH:mm
      const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);

      if (!dateMatch) {
        toast.error('Ngày phỏng vấn không đúng định dạng YYYY-MM-DD HH:mm');
        return;
      }

      const [, year, month, day, hour, minute] = dateMatch;

      // Validate date values
      const yearNum = parseInt(year, 10);
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      const hourNum = parseInt(hour, 10);
      const minuteNum = parseInt(minute, 10);

      // Basic range validation before constructing Date
      const isValidRange =
        monthNum >= 1 &&
        monthNum <= 12 &&
        dayNum >= 1 &&
        dayNum <= 31 &&
        hourNum >= 0 &&
        hourNum <= 23 &&
        minuteNum >= 0 &&
        minuteNum <= 59;
      if (!isValidRange) {
        toast.error('Ngày phỏng vấn không hợp lệ (kiểm tra tháng/ngày/giờ/phút)');
        return;
      }

      // Construct date in local time then verify components to avoid rollover (e.g., month 37)
      const date = new Date(yearNum, monthNum - 1, dayNum, hourNum, minuteNum);
      if (
        isNaN(date.getTime()) ||
        date.getFullYear() !== yearNum ||
        date.getMonth() !== monthNum - 1 ||
        date.getDate() !== dayNum ||
        date.getHours() !== hourNum ||
        date.getMinutes() !== minuteNum
      ) {
        toast.error('Ngày phỏng vấn không hợp lệ (sai định dạng hoặc giá trị)');
        return;
      }

      // Build ISO 8601 string with local timezone offset to preserve entered time
      const pad = (v) => v.toString().padStart(2, '0');
      const tzOffsetMinutes = -date.getTimezoneOffset(); // reverse sign to get local offset
      const tzSign = tzOffsetMinutes >= 0 ? '+' : '-';
      const tzHours = pad(Math.floor(Math.abs(tzOffsetMinutes) / 60));
      const tzMins = pad(Math.abs(tzOffsetMinutes) % 60);
      const isoLocalWithOffset = `${pad(yearNum)}-${pad(monthNum)}-${pad(dayNum)}T${pad(hourNum)}:${pad(minuteNum)}:00${tzSign}${tzHours}:${tzMins}`;

      const interviewData = {
        interviewDate: isoLocalWithOffset,
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
      const normalized = normalizeApplicationsResponse(response);
      setApplications(normalized.applications);

      const total = normalized.total || 0;
      const pending = normalized.applications?.filter(
        (app) => app.status === 'PENDING'
      ).length || 0;
      const approved = normalized.applications?.filter(
        (app) => app.status === 'APPROVED'
      ).length || 0;
      const accepted = normalized.applications?.filter(
        (app) => app.status === 'ACCEPTED'
      ).length || 0;
      const rejected = normalized.applications?.filter(
        (app) => app.status === 'REJECTED' || app.status === 'DECLINED'
      ).length || 0;

      setStats({ total, pending, approved, accepted, rejected });

      toast.success('Đã phê duyệt đơn và gửi lịch phỏng vấn');
    } catch (error) {
      toast.error(error.message || 'Không thể phê duyệt đơn');
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
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await applicationService.rejectApplication(selectedApplicationId, rejectReason.trim());
      setRejectModalVisible(false);
      setRejectReason('');

      // Reload applications
      const response = await applicationService.getClubApplications(clubId);
      const normalized = normalizeApplicationsResponse(response);
      setApplications(normalized.applications);

      const total = normalized.total || 0;
      const pending = normalized.applications?.filter(
        (app) => app.status === 'PENDING'
      ).length || 0;
      const approved = normalized.applications?.filter(
        (app) => app.status === 'APPROVED'
      ).length || 0;
      const rejected = normalized.applications?.filter(
        (app) => app.status === 'REJECTED' || app.status === 'DECLINED'
      ).length || 0;

      setStats({ total, pending, approved, rejected });

      toast.success('Đã từ chối đơn gia nhập');
    } catch (error) {
      toast.error(error.message || 'Không thể từ chối đơn');
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
      const normalized = normalizeApplicationsResponse(response);
      setApplications(normalized.applications);

      const total = normalized.total || 0;
      const pending = normalized.applications?.filter(
        (app) => app.status === 'PENDING'
      ).length || 0;
      const approved = normalized.applications?.filter(
        (app) => app.status === 'APPROVED'
      ).length || 0;
      const accepted = normalized.applications?.filter(
        (app) => app.status === 'ACCEPTED'
      ).length || 0;
      const rejected = normalized.applications?.filter(
        (app) => app.status === 'REJECTED' || app.status === 'DECLINED'
      ).length || 0;

      setStats({ total, pending, approved, accepted, rejected });

      toast.success(
        decision === 'accepted' ? 'Đã chấp nhận thành viên' : 'Đã từ chối thành viên'
      );
    } catch (error) {
      toast.error(error.message || 'Không thể thực hiện xác nhận cuối cùng');
    }
  };

  const parseDateTime = (dateString) => {
    if (!dateString) return null;

    // Chuẩn hóa: hỗ trợ ISO đầy đủ, "YYYY-MM-DD HH:mm", "YYYY-MM-DDTHH:mm"
    let normalized = dateString;
    if (!normalized.includes('T') && normalized.includes(' ')) {
      normalized = normalized.replace(' ', 'T');
    }

    const date = new Date(normalized);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const formatInputDateTime = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const pad = (v) => v.toString().padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
  };

  const formatDate = (dateString) => {
    const date = parseDateTime(dateString);
    if (!date) return dateString || '';
    return date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  };

  const formatDateTime = (dateString) => {
    const date = parseDateTime(dateString);
    if (!date) return dateString || '';
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpenDatePicker = () => {
    const parsed = parseDateTime(interviewDate);
    const baseDate = parsed || new Date();
    setPickerDate(baseDate);
    setShowDatePicker(true);
  };

  const handleDatePicked = (event, selected) => {
    setShowDatePicker(false);
    if (event.type !== 'set' || !selected) return;
    const prev = parseDateTime(interviewDate) || selected;
    const merged = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
      prev.getHours(),
      prev.getMinutes()
    );
    setPickerDate(merged);
    setShowTimePicker(true);
  };

  const handleTimePicked = (event, selected) => {
    setShowTimePicker(false);
    if (event.type !== 'set' || !selected) return;
    const base = parseDateTime(interviewDate) || pickerDate || new Date();
    const merged = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      selected.getHours(),
      selected.getMinutes()
    );
    setPickerDate(merged);
    setInterviewDate(formatInputDateTime(merged));
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
      case 'ACCEPTED':
        return 'Đã chấp nhận';
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

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'ALL') {
      return applications;
    }
    if (statusFilter === 'REJECTED') {
      // Filter includes both REJECTED and DECLINED
      return applications.filter((app) => app.status === 'REJECTED' || app.status === 'DECLINED');
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>← Quay lại</Text>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={async () => {
                  if (!clubId) return;
                  try {
                    setLoading(true);
                    const response = await applicationService.getClubApplications(clubId);
                    const normalized = normalizeApplicationsResponse(response);
                    setApplications(normalized.applications);

                    const total = normalized.total || 0;
                    const pending = normalized.applications?.filter(
                      (app) => app.status === 'PENDING'
                    ).length || 0;
                    const approved = normalized.applications?.filter(
                      (app) => app.status === 'APPROVED'
                    ).length || 0;
                    const accepted = normalized.applications?.filter(
                      (app) => app.status === 'ACCEPTED'
                    ).length || 0;
                    const rejected = normalized.applications?.filter(
                      (app) => app.status === 'REJECTED' || app.status === 'DECLINED'
                    ).length || 0;

                    setStats({ total, pending, approved, accepted, rejected });
                  } catch (error) {
                    toast.error(error.message || 'Không thể tải danh sách đơn');
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
                onPress={() => setLogoutDialogVisible(true)}
                disabled={logoutMutation.isPending}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Đơn Gia Nhập Câu Lạc Bộ</Text>
            <Text style={styles.headerSubtitle}>
              Xem xét và phê duyệt đơn đăng ký thành viên mới
            </Text>
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

                      {(application.status === 'REJECTED' || application.status === 'DECLINED') && application.rejectionReason && (
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
                              📅 Thời gian: {formatDateTime(application.interviewDate)}
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
                            <Text style={styles.finalDecisionButtonText}>Xác nhận</Text>
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Từ chối đơn gia nhập</Text>
              <Text style={styles.modalSubtitle}>
                Vui lòng nhập lý do từ chối đơn của “{selectedUserName}”
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
          </TouchableWithoutFeedback>
        </Modal>

        {/* Approve Modal */}
        <Modal
          visible={approveModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setApproveModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Phê duyệt đơn gia nhập</Text>
              <Text style={styles.modalSubtitle}>
                Nhập thông tin phỏng vấn cho “{selectedUserName}”
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Ngày phỏng vấn *</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="YYYY-MM-DD HH:mm (ví dụ: 2025-12-01 10:00)"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={interviewDate}
                  editable={false}
                  pointerEvents="none"
                />
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={handleOpenDatePicker}
                  activeOpacity={0.85}
                >
                  <Text style={styles.datePickerButtonText}>Chọn ngày giờ</Text>
                </TouchableOpacity>
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

            {showDatePicker && (
              <DateTimePicker
                value={pickerDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDatePicked}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={pickerDate || new Date()}
                mode="time"
                display="default"
                onChange={handleTimePicked}
              />
            )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Final Decision Modal */}
        <Modal
          visible={finalDecisionModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setFinalDecisionModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setFinalDecisionModalVisible(false)}
            >
              <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Xác nhận</Text>
              <Text style={styles.modalSubtitle}>
                Xác nhận thành viên “{selectedFinalDecisionUserName}”
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
          </TouchableWithoutFeedback>
        </Modal>

        <ConfirmationDialog
          visible={logoutDialogVisible}
          title="Xác nhận"
          message="Bạn có chắc chắn muốn đăng xuất?"
          confirmText="Đăng xuất"
          cancelText="Hủy"
          onConfirm={async () => {
            setLogoutDialogVisible(false);
            try {
              await logoutMutation.mutateAsync();
              if (navigation) {
                navigation.replace('Login');
              }
            } catch (error) {
              toast.error(error.message || 'Không thể đăng xuất');
            }
          }}
          onCancel={() => setLogoutDialogVisible(false)}
          type="danger"
        />
        </SafeAreaView>
      </TouchableWithoutFeedback>
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
  backButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '600',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginTop: 12,
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
  datePickerButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    marginBottom: 10,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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


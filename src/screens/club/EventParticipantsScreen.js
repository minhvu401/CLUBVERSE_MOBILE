import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { eventService } from '../../services/eventService';
import { toast } from '../../utils/toast';

const EventParticipantsScreen = ({ route, navigation }) => {
  const [confirmUndoDialog, setConfirmUndoDialog] = useState({ visible: false, userId: null, userName: '' });
  const [confirmCheckInDialog, setConfirmCheckInDialog] = useState({ visible: false, userId: null, userName: '' });
  const { eventId, eventTitle } = route.params || {};
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadParticipants = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        // Get event detail first to get maxParticipants
        const eventDetail = await eventService.getEventDetail(eventId);
        if (isMounted && eventDetail?.maxParticipants) {
          setMaxParticipants(eventDetail.maxParticipants);
        }
        
        // Then get participants
        const response = await eventService.getEventParticipants(eventId);
        if (isMounted) {
          const participantsList = response.participants || response.data || [];
          // Normalize isCheckedIn field (có thể là isCheckedIn, checkedIn, isChecked, etc.)
          const normalizedList = participantsList.map(p => ({
            ...p,
            isCheckedIn: p.isCheckedIn !== undefined ? p.isCheckedIn : 
                        p.checkedIn !== undefined ? p.checkedIn :
                        p.isChecked !== undefined ? p.isChecked : false
          }));
          setParticipants(normalizedList);
          setFilteredParticipants(normalizedList);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || 'Không thể tải danh sách người tham gia');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadParticipants();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredParticipants(participants);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = participants.filter((participant) => {
      const email = (participant.userId?.email || participant.email || '').toLowerCase();
      const fullName = (participant.userId?.fullName || participant.fullName || '').toLowerCase();
      return email.includes(query) || fullName.includes(query);
    });
    setFilteredParticipants(filtered);
  }, [searchQuery, participants]);

  const handleCheckIn = async (userId, userName) => {
    try {
      await eventService.checkInParticipant(eventId, userId);
      toast.success(`Đã check-in cho ${userName}`);
      
      // Reload participants
      const response = await eventService.getEventParticipants(eventId);
      const participantsList = response.participants || response.data || [];
      // Normalize isCheckedIn field
      const normalizedList = participantsList.map(p => ({
        ...p,
        isCheckedIn: p.isCheckedIn !== undefined ? p.isCheckedIn : 
                    p.checkedIn !== undefined ? p.checkedIn :
                    p.isChecked !== undefined ? p.isChecked : false
      }));
      setParticipants(normalizedList);
      setFilteredParticipants(normalizedList);
    } catch (error) {
      // Nếu lỗi là "đã check-in rồi", reload lại danh sách để cập nhật UI
      const errorMessage = error.message || error.response?.data?.message || '';
      if (errorMessage.toLowerCase().includes('đã check-in') || 
          errorMessage.toLowerCase().includes('already checked') ||
          errorMessage.toLowerCase().includes('check-in')) {
        // Reload participants để cập nhật UI
        try {
          const response = await eventService.getEventParticipants(eventId);
          const participantsList = response.participants || response.data || [];
          const normalizedList = participantsList.map(p => ({
            ...p,
            isCheckedIn: p.isCheckedIn !== undefined ? p.isCheckedIn : 
                        p.checkedIn !== undefined ? p.checkedIn :
                        p.isChecked !== undefined ? p.isChecked : false
          }));
          setParticipants(normalizedList);
          setFilteredParticipants(normalizedList);
        } catch (reloadError) {
          console.error('Error reloading participants:', reloadError);
        }
      }
      toast.error(errorMessage || 'Không thể check-in');
    }
  };

  const handleUndoCheckIn = async (userId, userName) => {
    try {
      await eventService.undoCheckIn(eventId, userId);
      toast.success(`Đã hủy check-in cho ${userName}`);
      
      // Reload participants
      const response = await eventService.getEventParticipants(eventId);
      const participantsList = response.participants || response.data || [];
      // Normalize isCheckedIn field
      const normalizedList = participantsList.map(p => ({
        ...p,
        isCheckedIn: p.isCheckedIn !== undefined ? p.isCheckedIn : 
                    p.checkedIn !== undefined ? p.checkedIn :
                    p.isChecked !== undefined ? p.isChecked : false
      }));
      setParticipants(normalizedList);
      setFilteredParticipants(normalizedList);
    } catch (error) {
      toast.error(error.message || 'Không thể hủy check-in');
    }
  };

  // Helper function to get userId from participant object
  const getParticipantUserId = (participant) => {
    // Try multiple possible structures based on API response
    return participant.userId?._id || 
           participant.userId || 
           participant._id || 
           participant.id;
  };

  return (
    <>
    <LinearGradient
      colors={['#5D2DE2', '#020721']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Người tham gia</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.eventTitleText} numberOfLines={2}>
            {eventTitle || 'Sự kiện'}
          </Text>
          <Text style={styles.participantsCount}>
            Tổng: {participants.length}/{maxParticipants || 'N/A'}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo email hoặc tên..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : filteredParticipants.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() 
                ? 'Không tìm thấy người tham gia nào' 
                : 'Chưa có người tham gia'}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredParticipants.map((participant) => {
              const userId = getParticipantUserId(participant);
              const userName = participant.userId?.fullName || participant.fullName || 'Người dùng';
              const userEmail = participant.userId?.email || participant.email || '';

              return (
                <View key={participant._id || participant.userId?._id || userId} style={styles.participantCard}>
                  <View style={styles.participantInfo}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitial}>
                        {userName.charAt(0)?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.participantDetails}>
                      <Text style={styles.participantName}>{userName}</Text>
                      <Text style={styles.participantEmail}>{userEmail}</Text>
                      {participant.userId?.school && (
                        <Text style={styles.participantSchool}>
                          {participant.userId.school}
                          {participant.userId.major ? ` • ${participant.userId.major}` : ''}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.participantActions}>
                    {participant.isCheckedIn ? (
                      <>
                        <View style={styles.checkedInBadge}>
                          <Text style={styles.checkedInText}>✓ Đã check-in</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.checkInButton, styles.undoCheckInButton]}
                          onPress={() => {
                            if (userId && userName) {
                              setConfirmUndoDialog({ visible: true, userId, userName });
                            } else {
                              toast.error('Không thể lấy thông tin người dùng');
                            }
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.undoCheckInText}>Hủy check-in</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={[styles.checkInButton, styles.doCheckInButton]}
                        onPress={() => {
                          if (userId && userName) {
                            setConfirmCheckInDialog({ visible: true, userId, userName });
                          } else {
                            toast.error('Không thể lấy thông tin người dùng');
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.doCheckInText}>✓ Check-in</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
      <ConfirmationDialog
        visible={confirmCheckInDialog.visible}
        title="Check-in?"
        message={`Xác nhận check-in cho ${confirmCheckInDialog.userName}`}
        confirmText="Check-in"
        cancelText="Hủy"
        type="success"
        onCancel={() => setConfirmCheckInDialog({visible: false, userId: null, userName: ''})}
        onConfirm={async () => {
          try {
            await handleCheckIn(confirmCheckInDialog.userId, confirmCheckInDialog.userName);
            setConfirmCheckInDialog({visible: false, userId: null, userName: ''});
          } catch (error) {
            // Error đã được xử lý trong handleCheckIn, chỉ cần đóng dialog
            setConfirmCheckInDialog({visible: false, userId: null, userName: ''});
          }
        }}
      />

      <ConfirmationDialog
        visible={confirmUndoDialog.visible}
        title="Hủy check-in?"
        message={`Xác nhận hủy check-in cho ${confirmUndoDialog.userName}`}
        confirmText="Hủy check-in"
        cancelText="Không"
        type="danger"
        onCancel={() => setConfirmUndoDialog({visible: false, userId: null, userName: ''})}
        onConfirm={async () => {
          try {
            await handleUndoCheckIn(confirmUndoDialog.userId, confirmUndoDialog.userName);
            setConfirmUndoDialog({visible: false, userId: null, userName: ''});
          } catch (error) {
            // Error đã được xử lý trong handleUndoCheckIn, chỉ cần đóng dialog
            setConfirmUndoDialog({visible: false, userId: null, userName: ''});
          }
        }}
      />
  </>
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
  headerInfo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  eventTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  participantsCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  participantCard: {
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  participantEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  participantSchool: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  participantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  checkInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  doCheckInButton: {
    borderColor: '#34C25E',
    backgroundColor: 'rgba(52, 194, 94, 0.25)',
    borderWidth: 1.5,
  },
  undoCheckInButton: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1.5,
  },
  doCheckInText: {
    color: '#34C25E',
    fontSize: 13,
    fontWeight: '700',
  },
  undoCheckInText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  checkedInBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 194, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 194, 94, 0.5)',
  },
  checkedInText: {
    color: '#34C25E',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EventParticipantsScreen;


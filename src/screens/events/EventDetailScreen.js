import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { eventService } from '../../services/eventService';
import { toast } from '../../utils/toast';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params || {};
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      console.log('Fetching event detail for ID:', eventId);
      if (!eventId) {
        console.error('No eventId provided to EventDetailScreen');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [eventRes, userRes] = await Promise.all([
          eventService.getEventDetail(eventId),
          authService.getCurrentUser()
        ]);
        
        if (userRes) setCurrentUser(userRes);

        console.log('Event detail response received');
        const eventData = eventRes.event || eventRes.data?.event || eventRes.data || eventRes;
        if (eventData) {
          // Compute isRegistered if not provided
          if (userRes && !eventData.isRegistered) {
            const currentUserId = userRes._id || userRes.id;
            const participants = eventData.joinedUsers || eventData.participants || [];
            const isAlreadyJoined = participants.some(p => {
              const pId = p.userId?._id || p.userId || p._id || p.id || p;
              return pId === currentUserId;
            });
            eventData.isRegistered = isAlreadyJoined;
          }
          setEvent(eventData);
        } else {
          throw new Error('Không có dữ liệu sự kiện');
        }
      } catch (error) {
        console.error('Error fetching event detail:', error);
        toast.error('Không thể tải chi tiết sự kiện');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [eventId]);

  const handleRegister = async () => {
    if (!eventId) return;
    try {
      setRegistering(true);
      await eventService.registerEvent(eventId);
      toast.success('Đăng ký tham gia thành công!');
      // Refresh event data to show registered status
      const response = await eventService.getEventDetail(eventId);
      setEvent(response.event || response.data?.event || response.data || response);
    } catch (error) {
      toast.error(error.message || 'Không thể đăng ký tham gia');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A855F7" />
        <Text style={styles.loadingText}>Đang tải chi tiết sự kiện...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy sự kiện.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const eventTime = event.startTime || event.time;
  const date = eventTime ? new Date(eventTime) : null;
  const formattedDate = date ? date.toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Chưa cập nhật';
  
  const formattedTime = date ? date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : 'Chưa cập nhật';

  const isFull = event.availableSlots !== undefined ? event.availableSlots <= 0 : false;
  const participantCount = event.joinedUsers?.length || event.participants?.length || 0;

  return (
    <LinearGradient
      colors={['#5D2DE2', '#020721']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết sự kiện</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Event Image */}
          <View style={styles.imageContainer}>
            { (event.images && event.images.length > 0 && event.images[0]) || event.image ? (
              <Image
                source={{ uri: (event.images && event.images[0]) || event.image }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={60} color="rgba(255,255,255,0.2)" />
                <Text style={styles.placeholderText}>Chưa có hình ảnh</Text>
              </View>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(2, 7, 33, 0.8)']}
              style={styles.imageOverlay}
            />
          </View>

          {/* Event Content */}
          <View style={styles.contentCard}>
            <View style={styles.eventHeaderRow}>
               <View style={styles.tagPill}>
                 <Text style={styles.tagText}>Workshop</Text>
               </View>
               <View style={event.isRegistered ? styles.statusBadgeRegistered : styles.statusBadge}>
                 <Text style={event.isRegistered ? styles.statusTextRegistered : styles.statusText}>
                   {event.isRegistered ? 'Đã đăng ký' : isFull ? 'Hết chỗ' : 'Sắp diễn ra'}
                 </Text>
               </View>
            </View>

            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <TouchableOpacity 
              style={styles.clubRow}
              onPress={() => navigation.navigate('ClubProfile', { clubId: event.clubId?._id || event.clubId })}
            >
              <View style={styles.clubAvatar}>
                <Text style={styles.clubInitial}>
                  {(event.clubId?.fullName || 'C').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.clubName}>{event.clubId?.fullName || 'Câu lạc bộ'}</Text>
                <Text style={styles.viewClubText}>Xem hồ sơ câu lạc bộ ›</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Event Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="calendar" size={20} color="#A855F7" />
                </View>
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>Ngày tổ chức</Text>
                  <Text style={styles.infoValue}>{formattedDate}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="time" size={20} color="#A855F7" />
                </View>
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>Thời gian</Text>
                  <Text style={styles.infoValue}>{formattedTime}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="location" size={20} color="#A855F7" />
                </View>
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>Địa điểm</Text>
                  <Text style={styles.infoValue}>{event.location || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="people" size={20} color="#A855F7" />
                </View>
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>Số lượng</Text>
                  <Text style={styles.infoValue}>
                    {participantCount} / {event.maxParticipants || 'Không giới hạn'} người tham gia
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Mô tả sự kiện</Text>
            <Text style={styles.descriptionText}>{event.description || 'Chưa có mô tả chi tiết cho sự kiện này.'}</Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {currentUser?.role === 'club' ? (
            <TouchableOpacity 
              style={styles.mainCtaButton}
              onPress={() => navigation.navigate('EventParticipants', { eventId: event._id })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7C3AED', '#9333EA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Danh sách người tham gia</Text>
                <Ionicons name="people" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          ) : !event.isRegistered && !isFull ? (
            <TouchableOpacity 
              style={styles.mainCtaButton}
              onPress={handleRegister}
              disabled={registering}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7C3AED', '#9333EA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                {registering ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.ctaText}>Đăng ký tham gia ngay</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : event.isRegistered ? (
            <View style={styles.registeredContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.registeredBigText}>Bạn đã đăng ký tham gia</Text>
            </View>
          ) : (
            <View style={styles.fullContainer}>
              <Text style={styles.fullText}>Sự kiện này đã đủ số lượng người đăng ký</Text>
            </View>
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020721',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#020721',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#A855F7',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    backgroundColor: '#1A1B2E',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    fontSize: 14,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  contentCard: {
    marginTop: -20,
    backgroundColor: '#1A1B2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 500,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  tagText: {
    color: '#D8B4FE',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeRegistered: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusTextRegistered: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '700',
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    lineHeight: 32,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  clubAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clubInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  clubName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  viewClubText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 20,
  },
  infoGrid: {
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  infoTexts: {
    flex: 1,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#020721',
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  mainCtaButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  registeredContainer: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  registeredBigText: {
    color: '#6EE7B7',
    fontSize: 16,
    fontWeight: '700',
  },
  fullContainer: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EventDetailScreen;

/* eslint-disable no-unused-vars */
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import ReasonDialog from '../../components/common/ReasonDialog';
import { applicationService } from '../../services/applicationService';
import { clubService } from '../../services/clubService';
import { eventService } from '../../services/eventService';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';
import { toast } from '../../utils/toast';
const { width } = Dimensions.get('window');

const RECOMMEND_CARD_WIDTH = width * 0.78;

const mockRecommendedClubs = [
  {
    id: '1',
    match: 95,
    name: 'Tech Innovation Club',
    description: 'CLB đổi mới sáng tạo và công nghệ',
    category: 'Công nghệ',
    members: 1234,
  },
  {
    id: '2',
    match: 88,
    name: 'English Speaking Club',
    description: 'Nơi nâng cao kỹ năng tiếng Anh',
    category: 'Ngôn ngữ',
    members: 956,
  },
];

// Removed mockEvents

const mockMyClubsColors = ['#8E5AF7', '#FF4F8B', '#45E07E', '#FF8A3C'];

const HomeScreen = () => {
  const [userName, setUserName] = useState('');
  const [clubs, setClubs] = useState([]);
  const [appliedClubIds, setAppliedClubIds] = useState([]);
  const [joinedClubIds, setJoinedClubIds] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [reasonDialogVisible, setReasonDialogVisible] = useState(false);
  const [joinReason, setJoinReason] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const getUnread = async () => {
        try {
          const res = await notificationService.getUnreadCount();
          if (isActive) {
            setUnreadCount(res.count || res.unreadCount || res || 0);
          }
        } catch (error) {
          // ignore
        }
      };
      getUnread();

      return () => {
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const profileResponse = await userService.getUserProfile();
        const profile = profileResponse.user || profileResponse.data?.user || profileResponse.data || profileResponse;
        
        if (isMounted && profile) {
          setUserName(profile.fullName || '');
          const jClubs = profile.clubsJoined || profile.clubJoined || profile.joinedClubs || profile.clubs || [];
          setJoinedClubs(jClubs);
          setJoinedClubIds(jClubs.map(c => c.clubId?._id || c.clubId || c._id || c.id));
        }

        const clubsResponse = await clubService.getAllClubs();
        const applicationsResponse = await applicationService.getMyApplications();
        
        if (isMounted) {
          const allClubs = clubsResponse.clubs || [];
          setClubs(allClubs);
          
          const apps = applicationsResponse.applications || 
                       applicationsResponse.data?.applications || 
                       applicationsResponse.data || [];
          
          const appliedIds = apps.map(app => app.clubId?._id || app.clubId);
          setAppliedClubIds(appliedIds);
        }

        const eventsResponse = await eventService.getEvents({ limit: 10 });
        if (isMounted) {
          const rawEvents = eventsResponse.events || eventsResponse.data?.events || eventsResponse.data || [];
          
          // Filter out past events
          const now = new Date();
          const upcomingEvents = rawEvents.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate > now;
          });
          
          setEvents(upcomingEvents);
        }
      } catch (_error) {
        // console.error('Error loading data:', _error);
      } finally {
        if (isMounted) {
          setLoadingClubs(false);
          setLoadingEvents(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplyToClub = (club) => {
    setSelectedClub(club);
    setReasonDialogVisible(true);
  };

  const handleReasonConfirm = (reason) => {
    setJoinReason(reason);
    setReasonDialogVisible(false);
    setConfirmDialogVisible(true);
  };

  const handleReasonCancel = () => {
    setReasonDialogVisible(false);
    setSelectedClub(null);
  };

  const handleConfirmJoin = async () => {
    if (!selectedClub) return;

    setConfirmDialogVisible(false);
    try {
      await applicationService.createApplication(
        selectedClub._id,
        joinReason || 'Em rất mong muốn được tham gia và đóng góp cho câu lạc bộ.'
      );
      toast.success('Đã gửi đơn gia nhập CLB.');
      // Refresh applied club IDs to hide the club immediately
      setAppliedClubIds(prev => [...prev, selectedClub._id]);
    } catch (error) {
      toast.error(error.message || 'Không thể gửi đơn gia nhập.');
    } finally {
      setSelectedClub(null);
      setJoinReason('');
    }
  };

  const handleCancelJoin = () => {
    setConfirmDialogVisible(false);
    setSelectedClub(null);
  };

  const formatEventDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      day: `T${d.getMonth() + 1}`,
      date: d.getDate().toString().padStart(2, '0'),
      time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    };
  };

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
          <View style={styles.headerRow}>
            <View style={styles.headerWrapper}>
              <Text style={styles.welcomeTitle}>Xin chào, {userName}! 👋</Text>
              <Text style={styles.welcomeSubtitle}>
                Chào mừng đến với Clubverse
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellIconContainer}>
              <Ionicons name="notifications-outline" size={28} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionIconBullet} />
                <Text style={styles.sectionTitle}>Tất cả CLB</Text>
              </View>
            </View>

            {loadingClubs ? (
              <View style={styles.loadingRow}>
                <Text style={styles.loadingText}>Đang tải danh sách CLB...</Text>
              </View>
            ) : clubs.length === 0 ? (
              <View style={styles.loadingRow}>
                <Text style={styles.loadingText}>Hiện chưa có CLB nào.</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToInterval={RECOMMEND_CARD_WIDTH + 16}
                contentContainerStyle={styles.recommendScrollContent}
              >
                {clubs.map((club, index) => {
                  const isMember = club._id ? joinedClubIds.includes(club._id) : false;
                  const isApplied = club._id ? appliedClubIds.includes(club._id) && !isMember : false;
                  const canView = isMember || isApplied;
                  
                  return (
                    <TouchableOpacity
                      key={club._id || `club-${index}`}
                      activeOpacity={0.9}
                      onPress={() => {
                        if (canView) {
                          navigation.navigate('Hồ sơ', {
                            screen: 'ClubProfile',
                            params: { 
                              clubId: club._id, 
                              userStatus: isMember ? 'ACCEPTED' : (isApplied ? 'APPLIED' : null)
                            }
                          });
                        } else {
                          handleApplyToClub(club);
                        }
                      }}
                    >
                      <LinearGradient
                        colors={isMember ? ["#10B981", "#059669"] : isApplied ? ["#4B5563", "#1F2937"] : ["#6C4DEB", "#F05BC8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.recommendCard}
                      >
                        <View style={styles.recommendTopRow}>
                          <View style={styles.matchBadge}>
                            <Text style={styles.matchBadgeText}>
                              {isMember ? 'THÀNH VIÊN' : isApplied ? 'ĐÃ GỬI ĐƠN' : 'CLB'}
                            </Text>
                          </View>
                        </View>

                      <Text numberOfLines={2} style={styles.recommendName}>
                        {club.fullName || 'Tên CLB'}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={styles.recommendDescription}
                      >
                        {club.description || ''}
                      </Text>

                      <View style={styles.recommendBottomRow}>
                        {club.category ? (
                          <View style={styles.tagPill}>
                            <Text style={styles.tagPillText}>{club.category}</Text>
                          </View>
                        ) : null}
                        <Text style={styles.membersText}>
                          {club.school ? club.school : ''}
                        </Text>
                      </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {!loadingEvents && events.length > 0 && (
            <View style={styles.sectionWrapper}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Sự kiện sắp diễn ra</Text>
                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Sự kiện')}>
                  <Text style={styles.sectionActionText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.eventListWrapper}>
                {events.map((event, index) => {
                  const { day, date, time } = formatEventDate(event.startTime);
                  return (
                    <TouchableOpacity 
                      key={event._id || event.id || `event-${index}`} 
                      style={styles.eventCard}
                      activeOpacity={0.8}
                      onPress={() => {
                        console.log('Navigating to EventDetail from Home:', event._id || event.id);
                        navigation.navigate('Sự kiện', { 
                          screen: 'EventDetail', 
                          params: { eventId: event._id || event.id } 
                        });
                      }}
                    >
                      <LinearGradient
                        colors={["#6C4DEB", "#F05BC8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.eventDateBadge}
                      >
                        <Text style={styles.eventMonthText}>{day}</Text>
                        <Text style={styles.eventDateText}>{date}</Text>
                      </LinearGradient>

                      <View style={styles.eventContent}>
                        <Text numberOfLines={2} style={styles.eventTitle}>
                          {event.title}
                        </Text>
                        <Text numberOfLines={1} style={styles.eventClub}>
                          {event.clubId?.fullName || 'Câu lạc bộ'}
                        </Text>

                        <View style={styles.eventMetaRow}>
                          <View style={styles.eventMetaItem}>
                            <Text style={styles.eventMetaDot}>●</Text>
                            <Text style={styles.eventMetaText}>{time}</Text>
                          </View>
                          <View style={styles.eventMetaItem}>
                            <Text style={styles.eventMetaDot}>📍</Text>
                            <Text numberOfLines={1} style={styles.eventMetaText}>{event.location}</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {joinedClubs.length > 0 && (
            <View style={styles.sectionWrapper}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>CLB của tôi</Text>
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Hồ sơ')}>
                  <Text style={styles.sectionActionText}>Quản lý</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.myClubsRow}>
                {joinedClubs.map((club, index) => (
                  <TouchableOpacity 
                    key={club._id || (club.clubId?._id || club.clubId) || `joined-${index}`}
                    onPress={() => navigation.navigate('Hồ sơ', {
                      screen: 'ClubProfile',
                      params: { 
                        clubId: club.clubId?._id || club.clubId || club._id || club.id, 
                        userStatus: 'ACCEPTED' 
                      }
                    })}
                  >
                    <View style={styles.clubCircle}>
                      {club.avatar ? (
                        <Image source={{ uri: club.avatar }} style={styles.clubCircleImage} />
                      ) : (
                        <View style={[styles.clubCirclePlaceholder, { backgroundColor: '#6C4DEB' }]}>
                          <Text style={styles.clubCircleText}>
                            {club.fullName?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <ReasonDialog
          visible={reasonDialogVisible}
          title={`Tham gia ${selectedClub?.fullName || 'CLB'}`}
          onConfirm={handleReasonConfirm}
          onCancel={handleReasonCancel}
        />

        <ConfirmationDialog
          visible={confirmDialogVisible}
          title="Xác nhận gửi đơn"
          message={`Bạn có chắc chắn muốn gửi đơn gia nhập "${selectedClub?.fullName || ''}" với lý do đã nhập?`}
          confirmText="Gửi đơn"
          cancelText="Quay lại"
          onConfirm={handleConfirmJoin}
          onCancel={handleCancelJoin}
          type="default"
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  headerWrapper: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  welcomeSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  bellIconContainer: {
    padding: 8,
    position: 'relative',
    marginLeft: 16,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconBullet: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#FACC6B',
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionActionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  recommendScrollContent: {
    paddingRight: 16,
  },
  recommendCard: {
    width: RECOMMEND_CARD_WIDTH,
    height: 170,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  recommendTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  matchBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cardSeeAllText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  recommendName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  recommendDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 14,
  },
  recommendBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(2,7,33,0.28)',
  },
  tagPillText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  membersText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  paginationWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  eventListWrapper: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 20,
    backgroundColor: 'rgba(3, 9, 40, 0.9)',
    padding: 14,
  },
  eventDateBadge: {
    width: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginRight: 14,
  },
  eventMonthText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 2,
  },
  eventDateText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventClub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaDot: {
    fontSize: 12,
    color: 'rgba(250, 204, 107, 0.95)',
    marginRight: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  myClubsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 4,
  },
  clubCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  clubCircleImage: {
    width: '100%',
    height: '100%',
  },
  clubCirclePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubCircleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});

export default HomeScreen;


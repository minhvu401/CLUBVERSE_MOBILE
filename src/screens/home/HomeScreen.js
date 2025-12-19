import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { applicationService } from '../../services/applicationService';
import { authService } from '../../services/authService';
import { clubService } from '../../services/clubService';

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

const mockEvents = [
  {
    id: '1',
    day: 'T10',
    date: '28',
    title: 'Workshop: AI & Machine Learning',
    club: 'Tech Innovation Club',
    time: '14:00',
    location: 'Phòng A101',
  },
  {
    id: '2',
    day: 'T10',
    date: '28',
    title: 'Buổi giao lưu tiếng Anh',
    club: 'English Speaking Club',
    time: '16:00',
    location: 'Sân trường',
  },
];

const mockMyClubsColors = ['#8E5AF7', '#FF4F8B', '#45E07E', '#FF8A3C'];

const HomeScreen = () => {
  const [userName, setUserName] = useState('');
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (isMounted && user && user.fullName) {
          setUserName(user.fullName);
        }

        const clubsResponse = await clubService.getAllClubs();
        if (isMounted) {
          setClubs(clubsResponse.clubs || []);
        }
      } catch (_error) {
        // TODO: you could show an Alert here if needed
      } finally {
        if (isMounted) setLoadingClubs(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplyToClub = (club) => {
    Alert.alert(
      'Tham gia CLB',
      `Bạn có chắc chắn muốn gửi đơn gia nhập "${club.fullName}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Gửi đơn',
          onPress: async () => {
            try {
              await applicationService.createApplication(
                club._id,
                'Em rất mong muốn được tham gia và đóng góp cho câu lạc bộ.'
              );
              Alert.alert('Thành công', 'Đã gửi đơn gia nhập CLB.');
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể gửi đơn gia nhập.');
            }
          },
        },
      ]
    );
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
          <View style={styles.headerWrapper}>
            <Text style={styles.welcomeTitle}>Xin chào, {userName}! 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              Chào mừng đến với Clubverse
            </Text>
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
                {clubs.map((club) => (
                  <TouchableOpacity
                    key={club._id}
                    activeOpacity={0.9}
                    onPress={() => handleApplyToClub(club)}
                  >
                    <LinearGradient
                      colors={["#6C4DEB", "#F05BC8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.recommendCard}
                    >
                      <View style={styles.recommendTopRow}>
                        <View style={styles.matchBadge}>
                          <Text style={styles.matchBadgeText}>CLB</Text>
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
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Sự kiện sắp diễn ra</Text>
              </View>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.sectionActionText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.eventListWrapper}>
              {mockEvents.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <LinearGradient
                    colors={["#6C4DEB", "#F05BC8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.eventDateBadge}
                  >
                    <Text style={styles.eventMonthText}>{event.day}</Text>
                    <Text style={styles.eventDateText}>{event.date}</Text>
                  </LinearGradient>

                  <View style={styles.eventContent}>
                    <Text numberOfLines={2} style={styles.eventTitle}>
                      {event.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.eventClub}>
                      {event.club}
                    </Text>

                    <View style={styles.eventMetaRow}>
                      <View style={styles.eventMetaItem}>
                        <Text style={styles.eventMetaDot}>●</Text>
                        <Text style={styles.eventMetaText}>{event.time}</Text>
                      </View>
                      <View style={styles.eventMetaItem}>
                        <Text style={styles.eventMetaDot}>📍</Text>
                        <Text style={styles.eventMetaText}>{event.location}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>CLB của tôi</Text>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.sectionActionText}>Quản lý</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.myClubsRow}>
              {mockMyClubsColors.map((color, index) => (
                <View
                  key={index.toString()}
                  style={[styles.clubCircle, { backgroundColor: color }]}
                />
              ))}
            </View>
          </View>
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
  headerWrapper: {
    marginBottom: 24,
    marginTop: 8,
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
    width: 42,
    height: 42,
    borderRadius: 21,
  },
});

export default HomeScreen;


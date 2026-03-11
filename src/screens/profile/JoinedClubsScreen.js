
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '../../services/userService';

const JoinedClubsScreen = ({ navigation, route }) => {
  const [joinedClubs, setJoinedClubs] = useState(route?.params?.joinedClubs || []);
  const [loading, setLoading] = useState(!route?.params?.joinedClubs);

  useEffect(() => {
    const fetchJoinedClubs = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserProfile();
        const profile = response.user || response.data?.user || response.data || response;
        const clubs = profile.clubsJoined || profile.clubJoined || profile.joinedClubs || profile.clubs || [];
        setJoinedClubs(clubs);
      } catch (error) {
        console.error('Error fetching joined clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedClubs();
  }, []);

  return (
    <LinearGradient
      colors={['#5D2DE2', '#020721']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CLB đã tham gia</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A855F7" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {joinedClubs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🏘️</Text>
                <Text style={styles.emptyText}>Bạn chưa tham gia câu lạc bộ nào.</Text>
                <TouchableOpacity 
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('Trang chủ')}
                >
                  <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
                </TouchableOpacity>
              </View>
            ) : (
              joinedClubs.map((club) => {
                const clubId = club.clubId?._id || club.clubId || club._id || club.id;
                const name = club.clubName || club.fullName || 'Câu lạc bộ';
                
                return (
                  <TouchableOpacity
                    key={clubId}
                    style={styles.clubCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('ClubProfile', { clubId: clubId, userStatus: 'ACCEPTED' })}
                  >
                    <View style={styles.clubInfo}>
                      <View style={styles.avatarCircle}>
                        {club.avatar || club.clubId?.avatar ? (
                          <Image source={{ uri: club.avatar || club.clubId?.avatar }} style={styles.avatarImage} />
                        ) : (
                          <Text style={styles.avatarInitial}>
                            {name.charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={styles.clubTextDetails}>
                        <Text style={styles.clubName}>{name}</Text>
                        <Text style={styles.clubCategory}>{club.category || club.clubId?.category || 'Thành viên'}</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <Text style={styles.chevron}>›</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    paddingRight: 15,
  },
  backButtonText: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    gap: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 15,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  clubCard: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  clubTextDetails: {
    flex: 1,
    gap: 4,
  },
  clubName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  clubCategory: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  chevronContainer: {
    paddingLeft: 10,
  },
  chevron: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 30,
    fontWeight: '300',
  },
});

export default JoinedClubsScreen;

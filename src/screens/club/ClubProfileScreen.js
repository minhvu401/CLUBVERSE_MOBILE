import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ClubProfileScreen = ({ navigation, club, onLogout, isLoggingOut }) => {
  const [joining, setJoining] = useState(false);

  const posts = club?.posts || [];
  const socialLinks = club?.socialLink || [];
  const isVerified = club?.isVerified;
  const createdAt = club?.createdAt;
  const category = club?.category;

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ),
    [posts]
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

//   const handleJoin = async () => {
//     if (!club?._id) {
//       Alert.alert('Lỗi', 'Không tìm thấy ID CLB để gửi đơn.');
//       return;
//     }
//     // For now, block club owners from applying to themselves
//     if (club?.role === 'club') {
//       Alert.alert('Thông báo', 'Bạn đang quản trị CLB này nên không thể gửi đơn.');
//       return;
//     }
//     try {
//       setJoining(true);
//       await applicationService.createApplication(
//         club._id,
//         'Em mong muốn được tham gia và đóng góp cho câu lạc bộ.'
//       );
//       Alert.alert('Thành công', 'Đã gửi đơn gia nhập CLB.');
//     } catch (error) {
//       Alert.alert('Lỗi', error.message || 'Không thể gửi đơn gia nhập.');
//     } finally {
//       setJoining(false);
//     }
//   };

  return (
    <LinearGradient
      colors={['#5D2DE2', '#020721']}
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
            colors={['#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerTopRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {club?.fullName?.charAt(0)?.toUpperCase() || 'C'}
                </Text>
              </View>

              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{club?.fullName || 'Tên CLB'}</Text>
                <View style={styles.headerTagRow}>
                  {category ? (
                    <View style={styles.tagPill}>
                      <Text style={styles.tagPillText}>{category}</Text>
                    </View>
                  ) : null}
                  {isVerified ? (
                    <View style={[styles.tagPill, styles.verifiedPill]}>
                      <Text style={styles.tagPillText}>Đã xác minh ✅</Text>
                    </View>
                  ) : null}
                </View>
                {/* <Text style={styles.headerSubText}>
                  {club?.description || 'CLB chưa cập nhật mô tả.'}
                </Text> */}
              </View>
            </View>

            <View style={styles.ctaRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.secondaryButton}
                onPress={() => navigation?.navigate('ClubApplications')}
              >
                <Text style={styles.secondaryButtonText}>Đơn gia nhập</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{club?.rating ?? 0}</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Hoạt động</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Trạng thái</Text>
              <Text
                style={[
                  styles.statNumber,
                  club?.isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {club?.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
              </Text>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>Giới thiệu CLB</Text>
            <View style={styles.card}>
              <Text style={styles.bodyText}>
                {club?.description || 'CLB chưa cập nhật mô tả chi tiết.'}
              </Text>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>Liên hệ & thông tin</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{club?.email || 'Chưa cập nhật'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{club?.phoneNumber || 'Chưa cập nhật'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lĩnh vực</Text>
                <Text style={styles.infoValue}>{category || 'Chưa cập nhật'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thời gian hoạt động</Text>
                <Text style={styles.infoValue}>
                  {createdAt ? `Từ ${formatDate(createdAt)}` : 'Chưa cập nhật'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
              <Text style={styles.sectionActionText}>{posts.length} bài</Text>
            </View>
            <View style={[styles.card, styles.postsCard]}>
              {sortedPosts.length === 0 ? (
                <Text style={styles.bodyText}>Chưa có hoạt động nào.</Text>
              ) : (
                sortedPosts.map((post) => (
                  <View key={post._id} style={styles.postItem}>
                    <View style={styles.postDateBadge}>
                      <Text style={styles.postDateText}>{formatDate(post.createdAt)}</Text>
                    </View>
                    <View style={styles.postContent}>
                      <Text style={styles.postTitle} numberOfLines={2}>
                        {post.title || 'Hoạt động'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>Kênh mạng xã hội</Text>
            <View style={styles.card}>
              {socialLinks.length === 0 ? (
                <Text style={styles.bodyText}>Chưa cập nhật liên kết.</Text>
              ) : (
                socialLinks.map((link, index) => (
                  <View key={index.toString()} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Link {index + 1}</Text>
                    <Text style={styles.infoValue}>{link}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}
            onPress={onLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
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
    marginBottom: 18,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
    gap: 8,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(2,7,33,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  verifiedPill: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderColor: 'rgba(34,197,94,0.6)',
  },
  tagPillText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  headerSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#F472B6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeText: {
    color: '#34D399',
    marginLeft: 20,
  },
  inactiveText: {
    color: '#F59E0B',
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(148,163,184,0.5)',
  },
  sectionWrapper: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionActionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  bodyText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  postsCard: {
    gap: 12,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  postDateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
  },
  postDateText: {
    color: '#E0E7FF',
    fontWeight: '600',
    fontSize: 12,
  },
  postContent: {
    flex: 1,
    gap: 4,
  },
  postTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  postSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    
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

export default ClubProfileScreen;

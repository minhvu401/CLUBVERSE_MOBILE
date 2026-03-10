import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postService } from '../../services/postService';
import { toast } from '../../utils/toast';

const TABS = [
  { key: 'latest', label: 'Mới nhất' },
  { key: 'popular', label: 'Phổ biến' },
  { key: 'following', label: 'Theo dõi' },
];

const ForumScreen = () => {
  const [activeTab, setActiveTab] = useState('latest');

  const sortBy = useMemo(() => {
    if (activeTab === 'popular') return 'popular';
    if (activeTab === 'following') return 'newest'; // placeholder, could map to follow feed
    return 'newest';
  }, [activeTab]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['posts', sortBy],
    queryFn: async () => {
      const res = await postService.getPosts({ sortBy, limit: 20, skip: 0 });
      return res.posts || res.data?.posts || [];
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể tải bài viết');
    },
  });

  const posts = useMemo(() => data || [], [data]);

  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }) =>
      isLiked ? postService.unlikePost(postId) : postService.likePost(postId),
    onSuccess: (_res, variables) => {
      queryClient.setQueryData(['posts', sortBy], (old) => {
        if (!old) return old;
        return old.map((p) => {
          if ((p._id || p.id) === variables.postId) {
            const liked = variables.isLiked ? -1 : 1;
            return {
              ...p,
              like: (p.like || 0) + liked,
              isLiked: !variables.isLiked,
            };
          }
          return p;
        });
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể cập nhật trạng thái thích');
    },
  });

  const toggleLike = (post) => {
    const postId = post._id || post.id;
    if (!postId) return;
    likeMutation.mutate({ postId, isLiked: post.isLiked });
  };

  return (
    <LinearGradient
      colors={['#7C3AED', '#020721']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Diễn Đàn</Text>
              <Text style={styles.subtitle}>Kết nối và chia sẻ với cộng đồng</Text>
            </View>
            <Image
              source={require('../../assets/images/clubverse-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.tabRow}>
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  activeOpacity={0.9}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#A855F7" />
              <Text style={styles.loadingText}>Đang tải bài viết...</Text>
            </View>
          )}

          {!isLoading && posts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Chưa có bài viết</Text>
              <Text style={styles.emptyText}>Hãy quay lại sau hoặc thử tab khác.</Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={() => refetch()}>
                <Text style={styles.refreshText}>Tải lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {posts.map((post) => (
            <View key={post._id || post.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarPlaceholder}>
                  {post.clubId?.fullName ? (
                    <Text style={styles.avatarInitial}>
                      {post.clubId.fullName.charAt(0).toUpperCase()}
                    </Text>
                  ) : (
                    <Text style={styles.avatarInitial}>C</Text>
                  )}
                </View>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.club}>{post.clubId?.fullName || 'Câu lạc bộ'}</Text>
                </View>
                <Text style={styles.time}>
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : ''}
                </Text>
              </View>

              <Text style={styles.cardTitle}>{post.title}</Text>
              <Text style={styles.cardDescription}>{post.content}</Text>

              <View style={styles.tagRow}>
                {post.tags?.map((tag) => (
                  <View key={tag} style={[styles.badge, styles.tagBadge]}>
                    <Text style={[styles.badgeText, styles.tagText]}>#{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.footerItem}
                  activeOpacity={0.8}
                  onPress={() => toggleLike(post)}
                  disabled={likeMutation.isPending}
                >
                  <Ionicons 
                    name={post.isLiked ? "heart" : "heart-outline"} 
                    size={18} 
                    color={post.isLiked ? "#EF4444" : "rgba(255,255,255,0.85)"} 
                  />
                  <Text style={[styles.footerText, post.isLiked && styles.footerTextActive]}>
                    {post.like ?? 0}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 4,
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 6,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#6EE7B7',
  },
  tabText: {
    color: '#D1D5DB',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  author: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  club: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  time: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 12,
  },
  trendingBadge: {
    backgroundColor: '#FDE68A',
  },
  trendingText: {
    color: '#92400E',
  },
  tagBadge: {
    backgroundColor: 'rgba(148,163,184,0.25)',
  },
  tagText: {
    color: '#E0E7FF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerIcon: {
    color: 'rgba(255,255,255,0.85)',
  },
  footerIconActive: {
    color: '#6EE7B7',
  },
  footerText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  footerTextActive: {
    color: '#EF4444',
  },
});

export default ForumScreen;

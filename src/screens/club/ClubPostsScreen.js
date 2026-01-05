import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { authService } from '../../services/authService';
import { postService } from '../../services/postService';
import { toast } from '../../utils/toast';

const ClubPostsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [clubName, setClubName] = useState('');
  const [showDeletedPosts, setShowDeletedPosts] = useState(false);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [title, setTitle] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [restoreDialogVisible, setRestoreDialogVisible] = useState(false);
  const [postToRestore, setPostToRestore] = useState(null);
  const [permanentDeleteDialogVisible, setPermanentDeleteDialogVisible] = useState(false);
  const [postToPermanentDelete, setPostToPermanentDelete] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        setLoading(true);
        const user = await authService.getCurrentUser();
        const clubId = user?._id || user?.id;
        if (isMounted && user?.fullName) {
          setClubName(user.fullName);
        }
        if (!clubId) {
          throw new Error('Không tìm thấy ID của CLB');
        }

        const response = await postService.getClubPosts(clubId);
        if (isMounted) {
          setPosts(response.posts || response.data || []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || 'Không thể tải danh sách bài viết');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (isFocused) {
      loadInitial();
    }

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const resetForm = () => {
    setTitle('');
    setTagsText('');
    setContent('');
    setImageUrl('');
    setEditingPost(null);
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setTitle(post.title || '');
    setTagsText((post.tags || []).join(', '));
    setContent(post.content || '');
    setImageUrl((post.images && post.images[0]) || '');
    setCreateModalVisible(true);
  };

  const handleSubmitPost = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết');
      return;
    }
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết');
      return;
    }

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const images = imageUrl.trim() ? [imageUrl.trim()] : [];

    try {
      setSubmitting(true);
      if (editingPost) {
        const updated = await postService.updatePost(editingPost._id, {
          title: title.trim(),
          content: content.trim(),
          tags,
          images,
        });
        
        // Reload danh sách bài viết từ server để đảm bảo sync với dữ liệu mới nhất (bao gồm tags đã được xử lý)
        const user = await authService.getCurrentUser();
        const clubId = user?._id || user?.id;
        if (clubId) {
          const response = await postService.getClubPosts(clubId);
          setPosts(response.posts || response.data || []);
        } else {
          // Fallback: update local state nếu không reload được
          setPosts((prev) =>
            prev.map((p) => (p._id === editingPost._id ? (updated.post || updated) : p))
          );
        }
        
        toast.success('Đã cập nhật bài viết');
      } else {
        const created = await postService.createPost({
          title: title.trim(),
          content: content.trim(),
          tags,
          images,
        });
        const newPost = created.post || created;
        setPosts((prev) => [newPost, ...prev]);
        toast.success('Đã tạo bài viết mới');
      }

      setCreateModalVisible(false);
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Không thể lưu bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setDeleteDialogVisible(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    
    setDeleteDialogVisible(false);
    try {
      await postService.deletePost(postToDelete);
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete));
      toast.success('Đã xóa bài viết');
    } catch (error) {
      toast.error(error.message || 'Không thể xóa bài viết');
    } finally {
      setPostToDelete(null);
    }
  };

  const cancelDeletePost = () => {
    setDeleteDialogVisible(false);
    setPostToDelete(null);
  };

  const loadDeletedPosts = async () => {
    try {
      setLoadingDeleted(true);
      const response = await postService.getDeletedPosts();
      setDeletedPosts(response.posts || response.data || []);
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách bài viết đã xóa');
      setDeletedPosts([]);
    } finally {
      setLoadingDeleted(false);
    }
  };

  // Load deleted posts khi chuyển sang tab "Đã xóa"
  useEffect(() => {
    if (showDeletedPosts) {
      loadDeletedPosts();
    }
  }, [showDeletedPosts]);

  const handleToggleView = (showDeleted) => {
    setShowDeletedPosts(showDeleted);
  };

  const handleRestorePost = (postId) => {
    setPostToRestore(postId);
    setRestoreDialogVisible(true);
  };

  const confirmRestorePost = async () => {
    if (!postToRestore) return;
    
    setRestoreDialogVisible(false);
    try {
      await postService.restorePost(postToRestore);
      setDeletedPosts((prev) => prev.filter((p) => p._id !== postToRestore));
      toast.success('Đã khôi phục bài viết');
      
      // Reload danh sách bài viết thường
      const user = await authService.getCurrentUser();
      const clubId = user?._id || user?.id;
      if (clubId) {
        const response = await postService.getClubPosts(clubId);
        setPosts(response.posts || response.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Không thể khôi phục bài viết');
    } finally {
      setPostToRestore(null);
    }
  };

  const cancelRestorePost = () => {
    setRestoreDialogVisible(false);
    setPostToRestore(null);
  };

  const handlePermanentDeletePost = (postId) => {
    setPostToPermanentDelete(postId);
    setPermanentDeleteDialogVisible(true);
  };

  const confirmPermanentDeletePost = async () => {
    if (!postToPermanentDelete) return;
    
    setPermanentDeleteDialogVisible(false);
    try {
      await postService.permanentDeletePost(postToPermanentDelete);
      setDeletedPosts((prev) => prev.filter((p) => p._id !== postToPermanentDelete));
      toast.success('Đã xóa vĩnh viễn bài viết');
    } catch (error) {
      toast.error(error.message || 'Không thể xóa vĩnh viễn bài viết');
    } finally {
      setPostToPermanentDelete(null);
    }
  };

  const cancelPermanentDeletePost = () => {
    setPermanentDeleteDialogVisible(false);
    setPostToPermanentDelete(null);
  };

  const openDetailModal = (post) => {
    setSelectedPost(post);
    setDetailModalVisible(true);
  };

  return (
    <LinearGradient
      colors={['#5D2DE2', '#020721']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quản lý bài viết CLB</Text>
          <Text style={styles.headerSubtitle}>
            {clubName ? `Câu lạc bộ: ${clubName}` : 'Dành cho tài khoản CLB'}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={styles.toggleWrapper}
              onPress={() => handleToggleView(false)}
              activeOpacity={0.8}
            >
              {!showDeletedPosts ? (
                <LinearGradient
                  colors={['#6C4DEB', '#5D2DE2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.toggleButtonActive}
                >
                  <Text style={styles.toggleButtonTextActive}>Bài viết</Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleButton}>
                  <Text style={styles.toggleButtonText}>Bài viết</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.toggleWrapper}
              onPress={() => handleToggleView(true)}
              activeOpacity={0.8}
            >
              {showDeletedPosts ? (
                <LinearGradient
                  colors={['#6C4DEB', '#5D2DE2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.toggleButtonActive}
                >
                  <Text style={styles.toggleButtonTextActive}>Đã xóa</Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleButton}>
                  <Text style={styles.toggleButtonText}>Đã xóa</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.createButton} onPress={openCreateModal} activeOpacity={0.85}>
            <LinearGradient
              colors={['#A855F7', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>+ Tạo bài viết mới</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading || loadingDeleted ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {showDeletedPosts ? (
              // Hiển thị bài viết đã xóa
              deletedPosts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Chưa có bài viết đã xóa nào</Text>
                  <Text style={styles.emptySubText}>Các bài viết đã xóa sẽ hiển thị ở đây.</Text>
                </View>
              ) : (
                deletedPosts.map((post) => {
                  const likeCount = typeof post.like === 'number' ? post.like : (post.likedBy?.length || 0);
                  return (
                    <TouchableOpacity
                      key={post._id}
                      style={[styles.postCard, styles.deletedPostCard]}
                      activeOpacity={0.9}
                      onPress={() => openDetailModal(post)}
                    >
                      <View style={styles.postHeaderRow}>
                        <Text style={styles.postTitle} numberOfLines={2}>
                          {post.title}
                        </Text>
                        <View style={styles.postHeaderRight}>
                          <View style={[styles.likeBadge, { marginRight: 6 }]}>
                            <Text style={styles.likeIcon}>👍</Text>
                            <Text style={styles.likeText}>{likeCount}</Text>
                          </View>
                          <View style={styles.deletedBadge}>
                            <Text style={styles.deletedBadgeText}>Đã xóa</Text>
                          </View>
                        </View>
                      </View>

                      <Text numberOfLines={3} style={styles.postContent}>
                        {post.content}
                      </Text>

                      {post.tags?.length > 0 && (
                        <View style={styles.tagRow}>
                          {post.tags.map((tag) => (
                            <View key={tag} style={styles.tagChip}>
                              <Text style={styles.tagChipText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <View style={styles.postActions}>
                        <TouchableOpacity
                          style={[styles.postActionButton, styles.postRestoreButton]}
                          onPress={() => handleRestorePost(post._id)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.postRestoreText}>Khôi phục</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.postActionButton, styles.postDeleteButton]}
                          onPress={() => handlePermanentDeletePost(post._id)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.postDeleteText}>Xóa vĩnh viễn</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )
            ) : (
              // Hiển thị bài viết thường
              posts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
                  <Text style={styles.emptySubText}>Hãy bắt đầu bằng cách tạo bài viết đầu tiên.</Text>
                </View>
              ) : (
                posts.map((post) => {
                  const likeCount = typeof post.like === 'number' ? post.like : (post.likedBy?.length || 0);
                  return (
                    <TouchableOpacity
                      key={post._id}
                      style={styles.postCard}
                      activeOpacity={0.9}
                      onPress={() => openDetailModal(post)}
                    >
                      <View style={styles.postHeaderRow}>
                        <Text style={styles.postTitle} numberOfLines={2}>
                          {post.title}
                        </Text>
                        <View style={styles.likeBadge}>
                          <Text style={styles.likeIcon}>👍</Text>
                          <Text style={styles.likeText}>{likeCount}</Text>
                        </View>
                      </View>

                      <Text numberOfLines={3} style={styles.postContent}>
                        {post.content}
                      </Text>

                      {post.tags?.length > 0 && (
                        <View style={styles.tagRow}>
                          {post.tags.map((tag) => (
                            <View key={tag} style={styles.tagChip}>
                              <Text style={styles.tagChipText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <View style={styles.postActions}>
                        <TouchableOpacity
                          style={[styles.postActionButton, styles.postEditButton]}
                          onPress={() => openEditModal(post)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.postEditText}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.postActionButton, styles.postDeleteButton]}
                          onPress={() => handleDeletePost(post._id)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.postDeleteText}>Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )
            )}
          </ScrollView>
        )}

        <Modal
          visible={createModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {
            if (!submitting) {
              setCreateModalVisible(false);
              resetForm();
            }
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </Text>

              <Text style={styles.fieldLabel}>Tiêu đề *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập tiêu đề bài viết"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.fieldLabel}>Tags (cách nhau bằng dấu phẩy)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="VD: technology, education"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={tagsText}
                onChangeText={setTagsText}
              />

              <Text style={styles.fieldLabel}>Nội dung *</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextarea]}
                placeholder="Nhập nội dung bài viết"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>Ảnh (URL, tùy chọn)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Dán link ảnh nếu có"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={imageUrl}
                onChangeText={setImageUrl}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => {
                    if (!submitting) {
                      setCreateModalVisible(false);
                      resetForm();
                    }
                  }}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSubmitButton]}
                  onPress={handleSubmitPost}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitText}>
                      {editingPost ? 'Lưu thay đổi' : 'Tạo bài viết'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Detail Modal */}
        <Modal
          visible={detailModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.detailModalContent]}>
              {selectedPost && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 12 }}
                >
                  <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                  {selectedPost.images?.length > 0 && (
                    <Image
                      source={{ uri: selectedPost.images[0] }}
                      style={styles.detailImage}
                      resizeMode="cover"
                    />
                  )}
                  {selectedPost.tags?.length > 0 && (
                    <View style={[styles.tagRow, { marginTop: 10 }]}>
                      {selectedPost.tags.map((tag) => (
                        <View key={tag} style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <Text style={[styles.postContent, { marginTop: 12 }]}>
                    {selectedPost.content}
                  </Text>
                </ScrollView>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setDetailModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalCancelText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ConfirmationDialog
          visible={deleteDialogVisible}
          title="Xác nhận"
          message="Bạn có chắc chắn muốn xóa bài viết này?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDeletePost}
          onCancel={cancelDeletePost}
          type="danger"
        />

        <ConfirmationDialog
          visible={restoreDialogVisible}
          title="Khôi phục bài viết"
          message="Bạn có chắc chắn muốn khôi phục bài viết này?"
          confirmText="Khôi phục"
          cancelText="Hủy"
          onConfirm={confirmRestorePost}
          onCancel={cancelRestorePost}
          type="success"
        />

        <ConfirmationDialog
          visible={permanentDeleteDialogVisible}
          title="Xóa vĩnh viễn"
          message="Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Hành động này không thể hoàn tác."
          confirmText="Xóa vĩnh viễn"
          cancelText="Hủy"
          onConfirm={confirmPermanentDeletePost}
          onCancel={cancelPermanentDeletePost}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 14,
    padding: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  toggleWrapper: {
    flex: 1,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  toggleButtonActive: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#6C4DEB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  createButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  postHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  postContent: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.25)',
  },
  tagChipText: {
    fontSize: 11,
    color: '#E5E7EB',
  },
  likeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(251,113,133,0.16)',
  },
  likeIcon: {
    fontSize: 12,
    marginRight: 4,
    color: '#fb7185',
  },
  likeText: {
    fontSize: 12,
    color: '#fecaca',
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  postActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  postEditButton: {
    borderColor: 'rgba(59,130,246,0.7)',
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  postDeleteButton: {
    borderColor: 'rgba(239,68,68,0.7)',
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  postEditText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
  postDeleteText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
  },
  deletedPostCard: {
    opacity: 0.7,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  deletedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
  },
  deletedBadgeText: {
    fontSize: 11,
    color: '#FCA5A5',
    fontWeight: '600',
  },
  postRestoreButton: {
    borderColor: 'rgba(52,194,94,0.7)',
    backgroundColor: 'rgba(52,194,94,0.15)',
  },
  postRestoreText: {
    color: '#86EFAC',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  detailModalContent: {
    maxHeight: 520,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
    marginTop: 10,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  modalTextarea: {
    minHeight: 90,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(148,163,184,0.25)',
  },
  modalSubmitButton: {
    backgroundColor: 'rgba(168,85,247,0.95)',
  },
  modalCancelText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginTop: 12,
  },
});

export default ClubPostsScreen;



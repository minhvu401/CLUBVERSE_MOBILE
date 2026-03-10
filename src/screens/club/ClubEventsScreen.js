import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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
import { eventService } from '../../services/eventService';
import { toast } from '../../utils/toast';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ClubEventsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [clubName, setClubName] = useState('');
  const [clubId, setClubId] = useState(null);
  const [showDeletedEvents, setShowDeletedEvents] = useState(false);
  const [deletedEvents, setDeletedEvents] = useState([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Date/Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());

  // Detail modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Delete dialogs
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [restoreDialogVisible, setRestoreDialogVisible] = useState(false);
  const [eventToRestore, setEventToRestore] = useState(null);
  const [hardDeleteDialogVisible, setHardDeleteDialogVisible] = useState(false);
  const [eventToHardDelete, setEventToHardDelete] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        setLoading(true);
        const user = await authService.getCurrentUser();
        const id = user?._id || user?.id;
        if (isMounted && user?.fullName) {
          setClubName(user.fullName);
        }
        if (!id) {
          throw new Error('Không tìm thấy ID của CLB');
        }
        setClubId(id);

        const response = await eventService.getClubEvents(id);
        if (isMounted) {
          setEvents(response.events || response.data || []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || 'Không thể tải danh sách sự kiện');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setMaxParticipants('');
    setImageUrl('');
    setEditingEvent(null);
    setSelectedDateTime(new Date());
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setTitle(event.title || '');
    setDescription(event.description || '');
    setLocation(event.location || '');
    setMaxParticipants(event.maxParticipants?.toString() || '');
    setImageUrl((event.images && event.images[0]) || '');
    if (event.time) {
      setSelectedDateTime(new Date(event.time));
    } else {
      setSelectedDateTime(new Date());
    }
    setCreateModalVisible(true);
  };

  const formatDateTime = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day} ${hours}:${minutes}:00.000Z`;
  };

  const handleDatePicked = (event, selected) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selected) {
      const merged = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        selectedDateTime.getHours(),
        selectedDateTime.getMinutes()
      );
      setSelectedDateTime(merged);
      setShowTimePicker(true);
    }
  };

  const handleTimePicked = (event, selected) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selected) {
      const merged = new Date(
        selectedDateTime.getFullYear(),
        selectedDateTime.getMonth(),
        selectedDateTime.getDate(),
        selected.getHours(),
        selected.getMinutes()
      );
      setSelectedDateTime(merged);
    }
  };

  const handleSubmitEvent = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề sự kiện');
      return;
    }
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả sự kiện');
      return;
    }
    if (!location.trim()) {
      toast.error('Vui lòng nhập địa điểm');
      return;
    }
    if (!maxParticipants.trim() || parseInt(maxParticipants) <= 0) {
      toast.error('Vui lòng nhập số lượng người tham gia tối đa');
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      time: formatDateTime(selectedDateTime),
      maxParticipants: parseInt(maxParticipants),
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
    };

    try {
      setSubmitting(true);
      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, eventData);
        
        // Reload events
        const response = await eventService.getClubEvents(clubId);
        setEvents(response.events || response.data || []);
        
        toast.success('Đã cập nhật sự kiện');
      } else {
        await eventService.createEvent(eventData);
        
        // Reload events để có đầy đủ dữ liệu (bao gồm image)
        const response = await eventService.getClubEvents(clubId);
        setEvents(response.events || response.data || []);
        
        toast.success('Đã tạo sự kiện mới');
      }

      setCreateModalVisible(false);
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Không thể lưu sự kiện');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetailModal = async (event) => {
    setSelectedEvent(event);
    setDetailModalVisible(true);
  };

  const openParticipantsScreen = (event) => {
    if (navigation) {
      navigation.navigate('EventParticipants', {
        eventId: event._id,
        eventTitle: event.title,
      });
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setDeleteDialogVisible(false);
    try {
      await eventService.deleteEvent(eventToDelete);
      setEvents((prev) => prev.filter((e) => e._id !== eventToDelete));
      toast.success('Đã xóa sự kiện');
    } catch (error) {
      toast.error(error.message || 'Không thể xóa sự kiện');
    } finally {
      setEventToDelete(null);
    }
  };

  const cancelDeleteEvent = () => {
    setDeleteDialogVisible(false);
    setEventToDelete(null);
  };

  const loadDeletedEvents = async () => {
    if (!clubId) return;
    try {
      setLoadingDeleted(true);
      const response = await eventService.getDeletedEvents(clubId);
      setDeletedEvents(response.events || response.data || []);
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách sự kiện đã xóa');
      setDeletedEvents([]);
    } finally {
      setLoadingDeleted(false);
    }
  };

  useEffect(() => {
    if (showDeletedEvents && clubId) {
      loadDeletedEvents();
    }
  }, [showDeletedEvents, clubId]);

  const handleToggleView = (showDeleted) => {
    setShowDeletedEvents(showDeleted);
  };

  const handleRestoreEvent = (eventId) => {
    setEventToRestore(eventId);
    setRestoreDialogVisible(true);
  };

  const confirmRestoreEvent = async () => {
    if (!eventToRestore) return;
    
    setRestoreDialogVisible(false);
    try {
      await eventService.restoreEvent(eventToRestore);
      setDeletedEvents((prev) => prev.filter((e) => e._id !== eventToRestore));
      toast.success('Đã khôi phục sự kiện');
      // Reload active events
      const response = await eventService.getClubEvents(clubId);
      setEvents(response.events || response.data || []);
    } catch (error) {
      toast.error(error.message || 'Không thể khôi phục sự kiện');
    } finally {
      setEventToRestore(null);
    }
  };

  const cancelRestoreEvent = () => {
    setRestoreDialogVisible(false);
    setEventToRestore(null);
  };

  const handleHardDeleteEvent = (eventId) => {
    setEventToHardDelete(eventId);
    setHardDeleteDialogVisible(true);
  };

  const confirmHardDeleteEvent = async () => {
    if (!eventToHardDelete) return;
    
    setHardDeleteDialogVisible(false);
    try {
      await eventService.hardDeleteEvent(eventToHardDelete);
      setDeletedEvents((prev) => prev.filter((e) => e._id !== eventToHardDelete));
      toast.success('Đã xóa vĩnh viễn sự kiện');
    } catch (error) {
      toast.error(error.message || 'Không thể xóa vĩnh viễn sự kiện');
    } finally {
      setEventToHardDelete(null);
    }
  };

  const cancelHardDeleteEvent = () => {
    setHardDeleteDialogVisible(false);
    setEventToHardDelete(null);
  };


  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTimeDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
          <Text style={styles.headerTitle}>Quản lý sự kiện CLB</Text>
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
              {!showDeletedEvents ? (
                <LinearGradient
                  colors={['#6C4DEB', '#5D2DE2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.toggleButtonActive}
                >
                  <Text style={styles.toggleButtonTextActive}>Sự kiện</Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleButton}>
                  <Text style={styles.toggleButtonText}>Sự kiện</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.toggleWrapper}
              onPress={() => handleToggleView(true)}
              activeOpacity={0.8}
            >
              {showDeletedEvents ? (
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
              <Text style={styles.createButtonText}>+ Tạo sự kiện mới</Text>
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
            {showDeletedEvents ? (
              deletedEvents.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Chưa có sự kiện đã xóa</Text>
                </View>
              ) : (
                deletedEvents.map((event) => (
                  <View
                    key={event._id}
                    style={[styles.eventCard, styles.deletedEventCard]}
                  >
                    {event.images && event.images.length > 0 && event.images[0] ? (
                      <Image
                        source={{ uri: event.images[0] }}
                        style={{ width: '100%', height: 140, borderRadius: 12, marginBottom: 10, backgroundColor: '#22223b' }}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={[styles.eventHeaderRow, { alignItems: 'center'}]}>
                      <Text style={styles.eventTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <View style={styles.deletedBadge}>
                        <Text style={styles.deletedBadgeText}>Đã xóa</Text>
                      </View>
                    </View>
                    <View style={[styles.eventMetaRow, { marginBottom: 2 }]}> 
                      <View style={[styles.eventMetaItem, { flex: 1 }]}> 
                        <Text style={styles.eventMetaIcon}>📅</Text> 
                        <Text style={styles.eventMetaText}>{formatDateTimeDisplay(event.time)}</Text> 
                      </View> 
                      <View style={[styles.eventMetaItem, { flex: 1 }]}> 
                        <Text style={styles.eventMetaIcon}>📍</Text> 
                        <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text> 
                      </View> 
                    </View>
                    <Text numberOfLines={2} style={styles.eventDescription}>
                      {event.description}
                    </Text>

                    <View style={styles.eventActions}>
                      <TouchableOpacity
                        style={[styles.eventActionButton, styles.eventRestoreButton]}
                        onPress={() => handleRestoreEvent(event._id)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.eventRestoreText}>Khôi phục</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.eventActionButton, styles.eventHardDeleteButton]}
                        onPress={() => handleHardDeleteEvent(event._id)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.eventHardDeleteText}>Xóa vĩnh viễn</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )
            ) : events.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Chưa có sự kiện nào</Text>
                <Text style={styles.emptySubText}>Hãy bắt đầu bằng cách tạo sự kiện đầu tiên.</Text>
              </View>
            ) : (
              events.map((event) => (
                <TouchableOpacity
                  key={event._id}
                  style={styles.eventCard}
                  activeOpacity={0.9}
                  onPress={() => openDetailModal(event)}
                >
                  {/* Ảnh event (nếu có) */}
                  {event.images && event.images.length > 0 && event.images[0] ? (
                    <Image
                      source={{ uri: event.images[0] }}
                      style={{ width: '100%', height: 140, borderRadius: 12, marginBottom: 10, backgroundColor: '#22223b' }}
                      resizeMode="cover"
                    />
                  ) : null}
                  {/* Header title + badge */}
                  <View style={[styles.eventHeaderRow, { alignItems: 'center'}]}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View style={styles.participantsBadge}>
                      <Text style={styles.participantsText}>
                        {(event.joinedUsers?.length || event.participants?.length || 0)}/{event.maxParticipants || 0}
                      </Text>
                    </View>
                  </View>
                  {/* Icon row */}
                  <View style={[styles.eventMetaRow, { marginBottom: 2 }]}> 
                    <View style={[styles.eventMetaItem, { flex: 1 }]}> 
                      <Text style={styles.eventMetaIcon}>📅</Text> 
                      <Text style={styles.eventMetaText}>{formatDateTimeDisplay(event.time)}</Text> 
                    </View> 
                    <View style={[styles.eventMetaItem, { flex: 1 }]}> 
                      <Text style={styles.eventMetaIcon}>📍</Text> 
                      <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text> 
                    </View> 
                  </View>
                  {/* Mô tả */}
                  <Text numberOfLines={2} style={styles.eventDescription}>
                    {event.description}
                  </Text>
                  <View style={styles.eventActions}>
                    <TouchableOpacity
                      style={[styles.eventActionButton, styles.eventEditButton]}
                      onPress={() => openEditModal(event)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.eventEditText}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.eventActionButton, styles.eventParticipantsButton]}
                      onPress={() => openParticipantsScreen(event)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.eventParticipantsText}>Người tham gia</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.eventActionButton, styles.eventDeleteButton]}
                      onPress={() => handleDeleteEvent(event._id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.eventDeleteText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        {/* Create/Edit Modal */}
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
              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.modalTitle}>
                  {editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
                </Text>

                <Text style={styles.fieldLabel}>Tiêu đề *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nhập tiêu đề sự kiện"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.fieldLabel}>Mô tả *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextarea]}
                  placeholder="Nhập mô tả sự kiện"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <Text style={styles.fieldLabel}>Địa điểm *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nhập địa điểm tổ chức"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={location}
                  onChangeText={setLocation}
                />

                <Text style={styles.fieldLabel}>Thời gian *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.datePickerButtonText}>
                    {formatDateTimeDisplay(selectedDateTime.toISOString())}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.fieldLabel}>Số lượng người tham gia tối đa *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nhập số lượng"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={maxParticipants}
                  onChangeText={setMaxParticipants}
                  keyboardType="number-pad"
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
                    onPress={handleSubmitEvent}
                    disabled={submitting}
                    activeOpacity={0.85}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalSubmitText}>
                        {editingEvent ? 'Lưu thay đổi' : 'Tạo sự kiện'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {showDatePicker && (
              <DateTimePicker
                value={selectedDateTime}
                mode="date"
                display="default"
                onChange={handleDatePicked}
              />
            )}
              {showTimePicker && (
                <DateTimePicker
                  value={selectedDateTime}
                  mode="time"
                  display="default"
                  onChange={handleTimePicked}
                />
              )}
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
              {selectedEvent && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 12 }}
                >
                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  {selectedEvent.images && selectedEvent.images.length > 0 && selectedEvent.images[0] ? (
                    <Image
                      source={{ uri: selectedEvent.images[0] }}
                      style={styles.detailImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.log('Image load error:', error);
                      }}
                    />
                  ) : null}
                  <Text style={[styles.eventDescription, { marginTop: 12 }]}>
                    {selectedEvent.description}
                  </Text>
                  <View style={styles.detailMetaRow}>
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>📅 Thời gian:</Text>
                      <Text style={styles.detailMetaValue}>{formatDateTimeDisplay(selectedEvent.time)}</Text>
                    </View>
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>📍 Địa điểm:</Text>
                      <Text style={styles.detailMetaValue}>{selectedEvent.location}</Text>
                    </View>
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>👥 Số lượng đăng ký:</Text>
                      <Text style={styles.detailMetaValue}>
                        {(selectedEvent.joinedUsers?.length || selectedEvent.participants?.length || 0)}/{selectedEvent.maxParticipants || 0}
                      </Text>
                    </View>
                  </View>
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
          message="Bạn có chắc chắn muốn xóa sự kiện này?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDeleteEvent}
          onCancel={cancelDeleteEvent}
          type="danger"
        />

        <ConfirmationDialog
          visible={restoreDialogVisible}
          title="Khôi phục sự kiện"
          message="Bạn có chắc chắn muốn khôi phục sự kiện này?"
          confirmText="Khôi phục"
          cancelText="Hủy"
          onConfirm={confirmRestoreEvent}
          onCancel={cancelRestoreEvent}
          type="success"
        />

        <ConfirmationDialog
          visible={hardDeleteDialogVisible}
          title="Xóa vĩnh viễn"
          message="Bạn có chắc chắn muốn xóa vĩnh viễn sự kiện này? Hành động này không thể hoàn tác."
          confirmText="Xóa vĩnh viễn"
          cancelText="Hủy"
          onConfirm={confirmHardDeleteEvent}
          onCancel={cancelHardDeleteEvent}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
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
  eventCard: {
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
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  participantsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(52, 194, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 194, 94, 0.5)',
  },
  participantsText: {
    fontSize: 12,
    color: '#34C25E',
    fontWeight: '600',
  },
  eventDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginBottom: 12,
  },
  eventMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventMetaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  eventMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  eventActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  eventEditButton: {
    borderColor: 'rgba(59,130,246,0.7)',
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  eventParticipantsButton: {
    borderColor: 'rgba(168,85,247,0.7)',
    backgroundColor: 'rgba(168,85,247,0.15)',
  },
  eventEditText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
  eventParticipantsText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
  },
  eventDeleteButton: {
    borderColor: 'rgba(239,68,68,0.7)',
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  eventDeleteText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
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
  deletedEventCard: {
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
  eventRestoreButton: {
    borderColor: 'rgba(52,194,94,0.7)',
    backgroundColor: 'rgba(52,194,94,0.15)',
  },
  eventRestoreText: {
    color: '#86EFAC',
    fontSize: 13,
    fontWeight: '600',
  },
  eventHardDeleteButton: {
    borderColor: 'rgba(239,68,68,0.7)',
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  eventHardDeleteText: {
    color: '#FCA5A5',
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
  modalScrollContent: {
    paddingBottom: 10,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  detailModalContent: {
    maxHeight: 520,
  },
  participantsModalContent: {
    maxHeight: 600,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 16,
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
  detailMetaRow: {
    marginTop: 12,
    gap: 12,
  },
  detailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailMetaLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  detailMetaValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  participantsList: {
    gap: 12,
    marginBottom: 12,
  },
  participantCard: {
    backgroundColor: 'rgba(5, 12, 39, 0.8)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  participantActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  checkInButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  doCheckInButton: {
    borderColor: 'rgba(52, 194, 94, 0.7)',
    backgroundColor: 'rgba(52, 194, 94, 0.15)',
  },
  undoCheckInButton: {
    borderColor: 'rgba(239, 68, 68, 0.7)',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  doCheckInText: {
    color: '#34C25E',
    fontSize: 12,
    fontWeight: '600',
  },
  undoCheckInText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  checkedInBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 194, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 194, 94, 0.5)',
  },
  checkedInText: {
    color: '#34C25E',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ClubEventsScreen;


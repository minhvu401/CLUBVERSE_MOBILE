import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventService } from '../../services/eventService';
import { toast } from '../../utils/toast';

const INITIAL_SELECTED_DATE = null;

const tabs = [
  { key: 'mine', label: 'Của tôi' },
  { key: 'featured', label: 'Nổi bật' },
  { key: 'all', label: 'Tất cả' },
];

const pad = (n) => n.toString().padStart(2, '0');
const toDateKey = (date) => {
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const StudentEventsScreen = ({ navigation, route }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(INITIAL_SELECTED_DATE);
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);

  const calendar = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // 0 Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < 42; i++) {
      const dayNum = i - startDay + 1;
      const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
      const dateObj = isCurrentMonth ? new Date(year, month, dayNum) : null;
      const isToday =
        dateObj &&
        dateObj.toDateString() === new Date().toDateString();

      days.push({
        key: i,
        label: isCurrentMonth ? dayNum : '',
        date: dateObj,
        isToday,
        isCurrentMonth,
      });
    }

    const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    return { days, monthLabel };
  }, [currentDate]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      // Filter out past events
      const eventDate = new Date(event.date);
      if (eventDate < now) return false;

      // Tab filters
      if (activeTab === 'mine' && !event.isRegistered) return false;
      if (activeTab === 'featured' && !event.isHighlight) return false;
      
      // Date filter
      if (selectedDate) {
        const selectedKey = toDateKey(selectedDate);
        return selectedKey === event.dateKey;
      }
      return true;
    });
  }, [events, activeTab, selectedDate]);

  const mapApiEvent = (raw) => {
    const eventTime = raw.startTime || raw.time;
    const dateObj = eventTime ? new Date(eventTime) : null;
    const timeRange = dateObj ? dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
    const slots = raw.availableSlots;
    const isFull = raw.isFull !== undefined ? raw.isFull : (slots !== undefined && slots !== null ? slots <= 0 : false);
    const eventId = raw._id || raw.id;
    return {
      id: eventId,
      title: raw.title,
      club: raw.clubId?.fullName || 'Câu lạc bộ',
      date: eventTime,
      dateKey: toDateKey(dateObj),
      time: timeRange,
      location: raw.location,
      tag: 'Workshop',
      isRegistered: !!raw.isRegistered,
      isHighlight: raw.status === 'upcoming' && isFull === false,
      isFull,
      status: raw.status,
      availableSlots: slots,
      image: raw.images?.[0],
    };
  };

  const loadEvents = useCallback(async () => {
    try {
      const res = await eventService.getEvents({ limit: 50, skip: 0 });
      const list =
        res?.data?.events ||
        res?.data?.data?.events ||
        res?.data?.data ||
        res?.events ||
        res?.data ||
        [];
      setEvents(list.map(mapApiEvent));
    } catch (error) {
      toast.error(error.message || 'Không thể tải sự kiện');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadEvents().finally(() => setLoading(false));
  }, [loadEvents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleMonthChange = (direction) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const formatDateDisplay = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN');
  };

  const handleRegister = async (eventId) => {
    if (!eventId) return;
    setRegisteringId(eventId);
    try {
      const res = await eventService.registerEvent(eventId);
      const resEvent =
        res?.data?.event ||
        res?.event ||
        res?.data ||
        null;
      toast.success('Đăng ký thành công');
      // cập nhật trạng thái local
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.id !== eventId) return ev;
          const nextSlots =
            resEvent?.availableSlots !== undefined
              ? resEvent.availableSlots
              : ev.availableSlots === undefined || ev.availableSlots === null
                ? ev.availableSlots
                : Math.max(0, ev.availableSlots - 1);
          return {
            ...ev,
            isRegistered: true,
            availableSlots: nextSlots,
            isFull: nextSlots !== undefined && nextSlots !== null ? nextSlots <= 0 : ev.isFull,
          };
        })
      );
    } catch (error) {
      toast.error(error.message || 'Không thể đăng ký sự kiện');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <LinearGradient
      colors={['#5A1FAE', '#0A0630']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Sự kiện</Text>
              <Text style={styles.subtitle}>Khám phá và theo dõi sự kiện</Text>
            </View>
            <Image
              source={require('../../assets/images/clubverse-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <LinearGradient
            colors={['#4727A2', '#2B185F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.calendarCard}
          >
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => handleMonthChange(-1)} style={styles.navBtn} activeOpacity={0.8}>
                <Feather name="chevron-left" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{calendar.monthLabel}</Text>
              <TouchableOpacity onPress={() => handleMonthChange(1)} style={styles.navBtn} activeOpacity={0.8}>
                <Feather name="chevron-right" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <Text key={d} style={styles.weekDay}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendar.days.map((day) => {
                const isSelected =
                  day.date &&
                  selectedDate &&
                  day.date.toDateString() === selectedDate.toDateString();
                return (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      day.isToday && !isSelected && styles.dayCellToday,
                    ]}
                    activeOpacity={day.isCurrentMonth ? 0.8 : 1}
                    onPress={() => day.isCurrentMonth && day.date && setSelectedDate(day.date)}
                  >
                    <Text
                      style={[
                        styles.dayLabel,
                        !day.isCurrentMonth && styles.dayLabelMuted,
                        isSelected && styles.dayLabelSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>

          <TouchableOpacity style={styles.syncButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="calendar-sync" size={18} color="#fff" />
            <Text style={styles.syncText}>Đồng bộ với Google Calendar</Text>
          </TouchableOpacity>

          <View style={styles.tabRow}>
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              if (isActive) {
                return (
                  <LinearGradient
                    key={tab.key}
                    colors={['#7C3AED', '#9333EA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabActive}
                  >
                    <TouchableOpacity activeOpacity={0.9} onPress={() => setActiveTab(tab.key)}>
                      <Text style={styles.tabTextActive}>{tab.label}</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                );
              }
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tab}
                  activeOpacity={0.9}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={styles.tabText}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự kiện</Text>
            {selectedDate && (
              <TouchableOpacity
                style={styles.clearDateBtn}
                onPress={() => setSelectedDate(null)}
                activeOpacity={0.85}
              >
                <Ionicons name="close-circle" size={16} color="#E9D5FF" style={{ marginRight: 6 }} />
                <Text style={styles.clearDateText}>Bỏ lọc ngày</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#A855F7" />
              <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Không có sự kiện trong ngày này.</Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} activeOpacity={0.85}>
                <Text style={styles.refreshText}>Tải lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id || event._id}
                activeOpacity={0.9}
                onPress={() => {
                  console.log('Navigating to detail with ID:', event.id || event._id);
                  navigation.navigate('EventDetail', { eventId: event.id || event._id });
                }}
                style={styles.eventCardWrapper}
              >
                <LinearGradient
                  colors={['#25144F', '#1A0E38']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.eventCardGradient}
                >
                  {event.image ? (
                    <Image
                      source={{ uri: event.image }}
                      style={styles.eventImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.eventImg, { backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.2)" />
                    </View>
                  )}
                  <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{event.tag}</Text>
                  </View>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventClub}>{event.club}</Text>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={16} color="#B8C1FF" />
                    <Text style={styles.infoText}>{formatDateDisplay(event.date)}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={16} color="#B8C1FF" />
                    <Text style={styles.infoText}>{event.time}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={16} color="#B8C1FF" />
                  <Text style={styles.infoText}>{event.location}</Text>
                </View>
                <View style={styles.metaRow}>
                  {event.availableSlots !== undefined && event.availableSlots !== null && (
                    <View style={styles.slotBadge}>
                      <Text style={styles.slotText}>
                        {event.isFull ? 'Đã đủ chỗ' : `Còn ${event.availableSlots} chỗ`}
                      </Text>
                    </View>
                  )}
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {event.isRegistered ? 'Đã đăng ký' : event.isFull ? 'Đã đủ chỗ' : 'Sẵn sàng đăng ký'}
                    </Text>
                  </View>
                </View>
                <View style={styles.ctaRow}>
                  <TouchableOpacity
                    activeOpacity={event.isRegistered || event.isFull ? 1 : 0.9}
                    disabled={event.isRegistered || event.isFull || registeringId === event.id}
                    onPress={() => handleRegister(event.id)}
                    style={{ width: '100%' }}
                  >
                    <LinearGradient
                      colors={
                        event.isRegistered || event.isFull
                          ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.08)']
                          : ['#7C3AED', '#9333EA']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.applyBtn, (event.isRegistered || event.isFull) && styles.applyBtnDisabled]}
                    >
                      {registeringId === event.id ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.applyBtnText}>
                          {event.isRegistered ? 'Đã đăng ký' : event.isFull ? 'Đã đủ chỗ' : 'Đăng ký tham gia'}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  loadingBox: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  logo: {
    width: 68,
    height: 68,
  },
  calendarCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDay: {
    color: 'rgba(255,255,255,0.6)',
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderRadius: 12,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  dayCellSelected: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  dayLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  dayLabelMuted: {
    color: 'rgba(255,255,255,0.25)',
  },
  dayLabelSelected: {
    color: '#fff',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B21B6',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  syncText: {
    color: '#fff',
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
  tabActive: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  clearDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(233, 213, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  clearDateText: {
    color: '#E9D5FF',
    fontWeight: '700',
    fontSize: 12,
  },
  empty: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
  },
  refreshBtn: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  refreshText: {
    color: '#E9D5FF',
    fontWeight: '700',
  },
  eventCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 12,
    marginBottom: 4,
  },
  eventCardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  eventImg: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
  },
  badgeText: {
    color: '#93C5FD',
    fontWeight: '700',
    fontSize: 12,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  eventClub: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  ctaRow: {
    marginTop: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  slotBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
  },
  slotText: {
    color: '#BFDBFE',
    fontWeight: '700',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  statusText: {
    color: '#E5E7EB',
    fontWeight: '700',
    fontSize: 12,
  },
  registeredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(52, 194, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 194, 94, 0.45)',
  },
  registeredText: {
    color: '#86EFAC',
    fontWeight: '700',
    fontSize: 12,
  },
  applyBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    overflow: 'hidden',
  },
  applyBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
});

export default StudentEventsScreen;

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationService } from '../../services/notificationService';
import { toast } from '../../utils/toast';

const NotificationScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            // Assuming getNotifications without params returns the list directly or data.notifications
            const response = await notificationService.getNotifications({ limit: 50 });
            // Handle different possible API response structures (e.g., paginated results)
            let dataArr = [];
            if (Array.isArray(response)) {
                dataArr = response;
            } else if (response && Array.isArray(response.notifications)) {
                dataArr = response.notifications;
            } else if (response && Array.isArray(response.data)) {
                dataArr = response.data;
             } else if (response && response.data && Array.isArray(response.data.notifications)) {
                dataArr = response.data.notifications;
            }
            setNotifications(dataArr);
        } catch (error) {
            toast.error(error.message || 'Không thể tải thông báo');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAsRead = async (id, isRead) => {
        if (isRead) return; // Already read

        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                (prev || []).map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            toast.error(error.message || 'Không thể đánh dấu đã đọc');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => (prev || []).map((n) => ({ ...n, isRead: true })));
            toast.success('Đã đánh dấu tất cả là đã đọc');
        } catch (error) {
            toast.error(error.message || 'Lỗi khi đánh dấu tất cả đã đọc');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications((prev) => (prev || []).filter((n) => n._id !== id && n.id !== id));
            toast.success('Đã xóa thông báo');
        } catch (error) {
            toast.error(error.message || 'Không thể xóa thông báo');
        }
    };

    const renderItem = ({ item }) => {
        const isUnread = !item.isRead;
        const notificationId = item._id || item.id;

        return (
            <TouchableOpacity
                style={[styles.notificationCard, isUnread && styles.unreadCard]}
                onPress={() => handleMarkAsRead(notificationId, item.isRead)}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={
                            item.type === 'APPLICATION_STATUS'
                                ? 'document-text'
                                : item.type === 'EVENT'
                                    ? 'calendar'
                                    : 'notifications'
                        }
                        size={24}
                        color={isUnread ? '#A855F7' : 'rgba(255,255,255,0.6)'}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.title, isUnread && styles.unreadText]}>
                        {item.title}
                    </Text>
                    <Text style={styles.message} numberOfLines={2}>
                        {item.message}
                    </Text>
                    <Text style={styles.timeText}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Vừa xong'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(notificationId)}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
                {isUnread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <LinearGradient
            colors={['#5D2DE2', '#020721']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thông báo</Text>
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Ionicons name="checkmark-done-outline" size={24} color="#A855F7" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#A855F7" />
                    </View>
                ) : notifications.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => (item._id || item.id).toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor="#A855F7"
                                colors={['#A855F7']}
                            />
                        }
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.6)',
        marginTop: 16,
        fontSize: 16,
    },
    listContainer: {
        padding: 16,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    unreadCard: {
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    unreadText: {
        fontWeight: '700',
    },
    message: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 6,
    },
    timeText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#A855F7',
        position: 'absolute',
        top: 16,
        right: 16,
    },
    deleteButton: {
        padding: 8,
        marginRight: -4, // Counteract extra padding to align better
    },
});

export default NotificationScreen;

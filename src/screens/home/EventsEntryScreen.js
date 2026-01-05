import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { authService } from '../../services/authService';
import ClubEventsScreen from '../club/ClubEventsScreen';
import EventParticipantsScreen from '../club/EventParticipantsScreen';

const EventsStack = createNativeStackNavigator();

const EventsEntryScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (isMounted) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#020721',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  // Nếu role là 'club', hiển thị EventsStack với ClubEventsScreen
  if (user?.role === 'club') {
    return (
      <EventsStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <EventsStack.Screen name="ClubEvents" component={ClubEventsScreen} />
        <EventsStack.Screen name="EventParticipants" component={EventParticipantsScreen} />
      </EventsStack.Navigator>
    );
  }

  // Nếu không phải club, hiển thị placeholder (có thể thêm EventsScreen cho student sau)
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#020721',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18, marginBottom: 8 }}>Sự kiện</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' }}>
          Tính năng đang được phát triển
        </Text>
      </View>
    </View>
  );
};

export default EventsEntryScreen;


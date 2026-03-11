import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { authService } from '../../services/authService';
import ClubEventsScreen from '../club/ClubEventsScreen';
import ClubProfileScreen from '../club/ClubProfileScreen';
import EventParticipantsScreen from '../club/EventParticipantsScreen';
import EventDetailScreen from '../events/EventDetailScreen';
import StudentEventsScreen from '../events/StudentEventsScreen';

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
        <EventsStack.Screen name="EventDetail" component={EventDetailScreen} />
      </EventsStack.Navigator>
    );
  }

  // Student/other role: hiển thị màn Events theo thiết kế
  return (
    <EventsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <EventsStack.Screen name="StudentEvents" component={StudentEventsScreen} />
      <EventsStack.Screen name="EventDetail" component={EventDetailScreen} />
      <EventsStack.Screen name="ClubProfile" component={ClubProfileScreen} />
    </EventsStack.Navigator>
  );
};

export default EventsEntryScreen;


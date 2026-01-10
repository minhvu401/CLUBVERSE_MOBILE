import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { authService } from '../../services/authService';
import ClubEventsScreen from '../club/ClubEventsScreen';
import EventParticipantsScreen from '../club/EventParticipantsScreen';
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
      </EventsStack.Navigator>
    );
  }

  // Student/other role: hiển thị màn Events theo thiết kế
  return <StudentEventsScreen />;
};

export default EventsEntryScreen;


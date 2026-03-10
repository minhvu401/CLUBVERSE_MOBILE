
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import ClubApplicationsScreen from '../screens/club/ClubApplicationsScreen';
import ClubProfileScreen from '../screens/club/ClubProfileScreen';
import EventParticipantsScreen from '../screens/club/EventParticipantsScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import ForumScreen from '../screens/forum/ForumScreen';
import EventsEntryScreen from '../screens/home/EventsEntryScreen';
import HomeEntryScreen from '../screens/home/HomeEntryScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import JoinedClubsScreen from '../screens/profile/JoinedClubsScreen';
import MyApplicationsScreen from '../screens/profile/MyApplicationsScreen';
import ProfileEntryScreen from '../screens/profile/ProfileEntryScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();


const ProfileStackNavigator = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <ProfileStack.Screen name="ProfileMain" component={ProfileEntryScreen} />
    <ProfileStack.Screen name="ClubProfile" component={ClubProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="JoinedClubs" component={JoinedClubsScreen} />
    <ProfileStack.Screen name="MyApplications" component={MyApplicationsScreen} />
    <ProfileStack.Screen name="ClubApplications" component={ClubApplicationsScreen} />
    <ProfileStack.Screen name="EventDetail" component={EventDetailScreen} />
    <ProfileStack.Screen name="EventParticipants" component={EventParticipantsScreen} />
  </ProfileStack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: '#A855F7',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
        tabBarIcon: ({ focused, color }) => {
          let icon = '●';
          if (route.name === 'Trang chủ') icon = '🏠';
          if (route.name === 'Sự kiện') icon = '📅';
          if (route.name === 'Diễn đàn') icon = '💬';
          if (route.name === 'Hồ sơ') icon = '👤';

          return (
            <Text style={[styles.tabIcon, { color: focused ? '#A855F7' : color }]}>
              {icon}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Trang chủ" component={HomeEntryScreen} />
      <Tab.Screen 
        name="Sự kiện" 
        component={EventsEntryScreen} 
        options={{ unmountOnBlur: true }}
      />
      <Tab.Screen name="Diễn đàn" component={ForumScreen} />
      <Tab.Screen name="Hồ sơ" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020721',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  tabBar: {
    backgroundColor: '#050A2A',
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    marginTop: 0,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
});

export default MainNavigator;


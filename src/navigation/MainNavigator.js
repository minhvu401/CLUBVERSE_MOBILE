
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import HomeScreen from '../screens/home/HomeScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const EventsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Sự kiện</Text>
  </View>
);

const ExploreScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Khám phá</Text>
  </View>
);

const ForumScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Diễn đàn</Text>
  </View>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
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
          if (route.name === 'Khám phá') icon = '🧭';
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
      <Tab.Screen name="Trang chủ" component={HomeScreen} />
      <Tab.Screen name="Sự kiện" component={EventsScreen} />
      <Tab.Screen name="Khám phá" component={ExploreScreen} />
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


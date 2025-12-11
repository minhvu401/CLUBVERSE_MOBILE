
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';

import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const EventsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Events</Text>
  </View>
);

const ExploreScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Explore</Text>
  </View>
);

const ForumScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Forum</Text>
  </View>
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
          if (route.name === 'Home') icon = '🏠';
          if (route.name === 'Events') icon = '📅';
          if (route.name === 'Explore') icon = '🧭';
          if (route.name === 'Forum') icon = '💬';
          if (route.name === 'Profile') icon = '👤';

          return (
            <Text style={[styles.tabIcon, { color: focused ? '#A855F7' : color }]}>
              {icon}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Forum" component={ForumScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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


import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClubApplicationsScreen from '../screens/club/ClubApplicationsScreen';

const Stack = createNativeStackNavigator();

const ClubNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ClubApplications" component={ClubApplicationsScreen} />
    </Stack.Navigator>
  );
};

export default ClubNavigator;


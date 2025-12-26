import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import ClubNavigator from './src/navigation/ClubNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import LoginScreen from './src/screens/auth/LoginScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="ClubMain" component={ClubNavigator} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
      <Toast
        topOffset={60}
        config={{
          success: ({ text1, text2 }) => (
            <View
              style={{
                height: 60,
                width: '90%',
                backgroundColor: 'rgba(52, 194, 94, 0.95)',
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderLeftWidth: 4,
                borderLeftColor: '#34C25E',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>✓</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{text1}</Text>
                {text2 && (
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 }}>
                    {text2}
                  </Text>
                )}
              </View>
            </View>
          ),
          error: ({ text1, text2 }) => (
            <View
              style={{
                height: 60,
                width: '90%',
                backgroundColor: 'rgba(239, 68, 68, 0.95)',
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderLeftWidth: 4,
                borderLeftColor: '#EF4444',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>✗</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{text1}</Text>
                {text2 && (
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 }}>
                    {text2}
                  </Text>
                )}
              </View>
            </View>
          ),
          info: ({ text1, text2 }) => (
            <View
              style={{
                height: 60,
                width: '90%',
                backgroundColor: 'rgba(168, 85, 247, 0.95)',
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderLeftWidth: 4,
                borderLeftColor: '#A855F7',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>ℹ</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{text1}</Text>
                {text2 && (
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 }}>
                    {text2}
                  </Text>
                )}
              </View>
            </View>
          ),
        }}
      />
    </QueryClientProvider>
  );
}
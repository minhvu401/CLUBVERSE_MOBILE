import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { authService } from '../../services/authService';
import ClubPostsScreen from '../club/ClubPostsScreen';
import HomeScreen from './HomeScreen';

const HomeEntryScreen = () => {
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

  // Nếu role là 'club', hiển thị ClubPostsScreen
  if (user?.role === 'club') {
    return <ClubPostsScreen />;
  }

  // Nếu không phải club, hiển thị HomeScreen như bình thường
  return <HomeScreen />;
};

export default HomeEntryScreen;


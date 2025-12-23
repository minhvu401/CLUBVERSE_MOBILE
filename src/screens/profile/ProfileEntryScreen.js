import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useLogout } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import ClubProfileScreen from '../club/ClubProfileScreen';
import ProfileScreen from './ProfileScreen';

const ProfileEntryScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutMutation = useLogout();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profileData = await userService.getUserProfile();
        if (isMounted) {
          setProfile(profileData);
        }
      } catch (error) {
        Alert.alert('Lỗi', error.message || 'Không thể tải hồ sơ.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigation?.replace('Login');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng xuất.');
    }
  };

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

  if (profile?.role === 'club') {
    return (
      <ClubProfileScreen
        navigation={navigation}
        club={profile}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
      />
    );
  }

  return <ProfileScreen navigation={navigation} prefetchedUser={profile} />;
};

export default ProfileEntryScreen;

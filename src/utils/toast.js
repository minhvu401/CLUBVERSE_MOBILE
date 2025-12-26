import Toast from 'react-native-toast-message';

export const toast = {
  success: (message, title = 'Thành công') => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  error: (message, title = 'Lỗi') => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },

  info: (message, title = 'Thông báo') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  warning: (message, title = 'Cảnh báo') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      props: {
        style: { backgroundColor: '#FACC6B' },
      },
    });
  },
};

export default toast;


import { LinearGradient } from 'expo-linear-gradient';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ConfirmationDialog = ({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  type = 'default', // 'default', 'danger', 'success'
  showCancel = true,
}) => {
  const getButtonColors = () => {
    switch (type) {
      case 'danger':
        return {
          confirmGradient: ['#EF4444', '#DC2626'],
          confirmText: '#FFFFFF',
        };
      case 'success':
        return {
          confirmGradient: ['#34C25E', '#22C55E'],
          confirmText: '#FFFFFF',
        };
      default:
        return {
          confirmGradient: ['#4C1D95', '#3B1A6B'],
          confirmText: '#FFFFFF',
        };
    }
  };

  const buttonColors = getButtonColors();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View style={styles.dialogContainer}>
          <LinearGradient
            colors={['rgba(109, 77, 235, 0.95)', 'rgba(93, 45, 226, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dialog}
          >
            {/* Icon decoration */}
            <View style={styles.iconContainer}>
              {type === 'danger' ? (
                <Text style={styles.iconText}>⚠️</Text>
              ) : type === 'success' ? (
                <Text style={styles.iconText}>✓</Text>
              ) : (
                <Text style={styles.iconText}>💬</Text>
              )}
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {showCancel && (
                <View style={styles.cancelButtonWrapper}>
                  <TouchableOpacity
                    style={styles.cancelButtonTouchable}
                    onPress={onCancel}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>{cancelText}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
              <View style={[styles.confirmButtonWrapper, showCancel && styles.buttonSpacing]}>
                <TouchableOpacity
                  style={styles.confirmButtonTouchable}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={buttonColors.confirmGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmButton}
                  >
                    <Text style={[styles.confirmButtonText, { color: buttonColors.confirmText }]}>
                      {confirmText}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  dialog: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
  },
  buttonSpacing: {
    marginLeft: 6,
  },
  cancelButtonWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ConfirmationDialog;


import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ReasonDialog = ({
  visible,
  title = 'Lý do tham gia',
  placeholder = 'Nhập lý do tại sao bạn muốn tham gia CLB...',
  confirmText = 'Tiếp tục',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  const handleCancel = () => {
    onCancel();
    setReason('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleCancel}
        />
        <View style={styles.dialogContainer}>
          <LinearGradient
            colors={['rgba(109, 77, 235, 0.95)', 'rgba(93, 45, 226, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dialog}
          >
            <Text style={styles.title}>{title}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
            />

            <View style={styles.buttonContainer}>
              <View style={styles.cancelButtonWrapper}>
                <TouchableOpacity
                  style={styles.cancelButtonTouchable}
                  onPress={handleCancel}
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
              <View style={[styles.confirmButtonWrapper, { marginLeft: 6 }]}>
                <TouchableOpacity
                  style={styles.confirmButtonTouchable}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  disabled={!reason.trim()}
                >
                  <LinearGradient
                    colors={reason.trim() ? ['#4C1D95', '#3B1A6B'] : ['#9CA3AF', '#6B7280']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmButton}
                  >
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  cancelButtonWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  confirmButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ReasonDialog;

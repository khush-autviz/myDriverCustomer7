import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  DeviceEventEmitter,
  SafeAreaView,
} from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type?: ToastType;
}

const DURATION = 1500; // 1.5 seconds
const TOAST_EVENT = 'SHOW_TOAST';

export const ShowToast = (message: string, options?: ToastOptions) => {
  DeviceEventEmitter.emit(TOAST_EVENT, { message, type: options?.type || 'info' });
};

export const Toast = () => {
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const hideToast = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToastConfig(prev => ({ ...prev, visible: false }));
    });
  }, [fadeAnim]);

  const showToast = useCallback(({ message, type }: { message: string; type: ToastType }) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToastConfig({
      message,
      type,
      visible: true,
    });

    // Show animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Set timeout to hide
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, DURATION);
  }, [fadeAnim, hideToast]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(TOAST_EVENT, showToast);
    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showToast]);

  if (!toastConfig.visible) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.container,
          styles[`${toastConfig.type}Toast`],
          { opacity: fadeAnim }
        ]}
      >
        <Text style={[styles.message, styles[`${toastConfig.type}Text`]]}>
          {toastConfig.message}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    marginTop: 60,
  },
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    maxWidth: width - 32,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  successToast: {
    backgroundColor: '#E6F4EA',
    borderLeftWidth: 4,
    borderLeftColor: '#34A853',
  },
  errorToast: {
    backgroundColor: '#FDEDED',
    borderLeftWidth: 4,
    borderLeftColor: '#EA4335',
  },
  warningToast: {
    backgroundColor: '#FEF7E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FBBC04',
  },
  infoToast: {
    backgroundColor: '#E8F0FE',
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  successText: {
    color: '#1E8E3E',
  },
  errorText: {
    color: '#C5221F',
  },
  warningText: {
    color: '#EA8600',
  },
  infoText: {
    color: '#1967D2',
  },
});

// Usage example:
// const [showToast, setShowToast] = useState(false);
// <Toast
//   message="Operation successful!"
//   type="success"
//   isVisible={showToast}
//   onClose={() => setShowToast(false)}
// />

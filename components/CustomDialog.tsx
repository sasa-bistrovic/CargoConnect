import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export type DialogType = 'info' | 'success' | 'warning' | 'error';

interface DialogButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: DialogButton[];
  type?: DialogType;
  onDismiss?: () => void;
  showCloseButton?: boolean;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  visible,
  title,
  message,
  buttons,
  type = 'info',
  onDismiss,
  showCloseButton = true
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.9));
  
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const getIconByType = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={32} color={colors.success} />;
      case 'warning':
        return <AlertTriangle size={32} color={colors.warning} />;
      case 'error':
        return <XCircle size={32} color={colors.secondary} />;
      case 'info':
      default:
        return <Info size={32} color={colors.primary} />;
    }
  };

  const getColorByType = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.secondary;
      case 'info':
      default:
        return colors.primary;
    }
  };

  const getBackgroundColorByType = () => {
    switch (type) {
      case 'success':
        return colors.successLight;
      case 'warning':
        return colors.warningLight;
      case 'error':
        return colors.secondaryLight;
      case 'info':
      default:
        return colors.primaryLight;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.dialogContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {showCloseButton && (
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onDismiss}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <X size={20} color={colors.gray} />
            </TouchableOpacity>
          )}
          
          <View style={[styles.iconContainer, { backgroundColor: getBackgroundColorByType() }]}>
            {getIconByType()}
          </View>
          
          <Text style={[styles.title, { color: getColorByType() }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              let buttonStyle = styles.button;
              let textStyle = styles.buttonText;
              
              if (button.style === 'cancel') {
                buttonStyle = styles.cancelButton;
                textStyle = styles.cancelButtonText;
              } else if (button.style === 'destructive') {
                buttonStyle = styles.destructiveButton;
                textStyle = styles.destructiveButtonText;
              } else {
                buttonStyle = [styles.button, { backgroundColor: getColorByType() }];
              }
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    buttonStyle,
                    buttons.length > 1 && styles.multipleButtons,
                    index === buttons.length - 1 && styles.lastButton
                  ]}
                  onPress={() => {
                    if (button.onPress) {
                      button.onPress();
                    } else if (onDismiss) {
                      onDismiss();
                    }
                  }}
                >
                  <Text style={textStyle}>{button.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const dialogWidth = Math.min(width - 48, 340);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: dialogWidth,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      }
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  destructiveButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  multipleButtons: {
    marginBottom: 8,
  },
  lastButton: {
    marginBottom: 0,
  },
});

export default CustomDialog;
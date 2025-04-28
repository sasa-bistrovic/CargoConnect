import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  StyleProp, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium'
}) => {
  const getButtonStyle = () => {
    let buttonStyle: StyleProp<ViewStyle> = [styles.button];
    
    // Add variant styles
    switch (variant) {
      case 'secondary':
        buttonStyle = [...buttonStyle, styles.secondaryButton];
        break;
      case 'outline':
        buttonStyle = [...buttonStyle, styles.outlineButton];
        break;
      case 'ghost':
        buttonStyle = [...buttonStyle, styles.ghostButton];
        break;
      default:
        buttonStyle = [...buttonStyle, styles.primaryButton];
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        buttonStyle = [...buttonStyle, styles.smallButton];
        break;
      case 'large':
        buttonStyle = [...buttonStyle, styles.largeButton];
        break;
      default:
        // Medium is the default
        break;
    }
    
    // Add disabled style
    if (disabled || isLoading) {
      buttonStyle = [...buttonStyle, styles.disabledButton];
    }
    
    // Add custom style
    if (style) {
      buttonStyle = [...buttonStyle, style];
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let btnTextStyle: StyleProp<TextStyle> = [styles.buttonText];
    
    // Add variant text styles
    switch (variant) {
      case 'outline':
        btnTextStyle = [...btnTextStyle, styles.outlineButtonText];
        break;
      case 'ghost':
        btnTextStyle = [...btnTextStyle, styles.ghostButtonText];
        break;
      default:
        // Primary and secondary use the default text style
        break;
    }
    
    // Add size text styles
    switch (size) {
      case 'small':
        btnTextStyle = [...btnTextStyle, styles.smallButtonText];
        break;
      case 'large':
        btnTextStyle = [...btnTextStyle, styles.largeButtonText];
        break;
      default:
        // Medium is the default
        break;
    }
    
    // Add disabled text style
    if (disabled) {
      btnTextStyle = [...btnTextStyle, styles.disabledButtonText];
    }
    
    // Add custom text style
    if (textStyle) {
      btnTextStyle = [...btnTextStyle, textStyle];
    }
    
    return btnTextStyle;
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white} 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButtonText: {
    color: colors.primary,
  },
  ghostButtonText: {
    color: colors.primary,
  },
  smallButtonText: {
    fontSize: 14,
  },
  largeButtonText: {
    fontSize: 18,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
});
import { useState } from 'react';
import { DialogType } from '@/components/CustomDialog';

interface DialogOptions {
  title: string;
  message: string;
  type?: DialogType;
  showCloseButton?: boolean;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export const useDialog = () => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({
    title: '',
    message: '',
    type: 'info',
    showCloseButton: true,
    buttons: [{ text: 'OK' }],
  });

  const showDialog = (dialogOptions: DialogOptions) => {
    // Ensure there's at least one button
    const buttons = dialogOptions.buttons || [{ text: 'OK' }];
    
    // Add default onPress to close the dialog if not provided
    const buttonsWithDefaults = buttons.map(button => ({
      ...button,
      onPress: button.onPress || (() => setVisible(false)),
    }));

    setOptions({
      ...dialogOptions,
      buttons: buttonsWithDefaults,
      showCloseButton: dialogOptions.showCloseButton !== undefined ? dialogOptions.showCloseButton : true,
    });
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
  };

  return {
    visible,
    options,
    showDialog,
    hideDialog,
  };
};
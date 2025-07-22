import React, {useCallback, useContext, useEffect} from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {Icon, useBottomSheet, useUIKitTheme, createStyleSheet} from '@sendbird/uikit-react-native-foundation';
import { useChannelInputItems } from '@sendbird/uikit-react-native/src/hooks/useChannelInputItems';
import { FileType } from '@sendbird/uikit-react-native/src/platform/types';
import {GroupChannelContexts} from '@sendbird/uikit-react-native';

interface CustomAttachmentsButtonProps {
  disabled: boolean;
  sendFileMessage: (file: FileType) => void;
}

const CustomAttachmentsButton = ({ disabled, sendFileMessage }: CustomAttachmentsButtonProps) => {
  const navigation = useNavigation<any>();
  const { openSheet } = useBottomSheet();
  const { colors } = useUIKitTheme();
  const {channel} = useContext(GroupChannelContexts.Fragment);

  // Get default attachment items from Sendbird's hook
  const defaultAttachmentItems = useChannelInputItems(channel, sendFileMessage);

  useEffect(() => {
    const iconAssets = Icon.Assets as any;
    if (!iconAssets['poll-create']) {
      iconAssets['poll-create'] = require('../assets/icons/icon-poll-create.png');
    }
  }, []);


  const handlePress = useCallback(() => {
    const pollItem = {
      icon: 'poll-create' as any,
      title: 'Create a Poll',
      onPress: () => {
        navigation.navigate('PollCreate', { channelUrl: channel.url });
      },
    };

    // Combine poll item with default attachment items
    const sheetItems = [pollItem, ...defaultAttachmentItems];
    openSheet({ sheetItems });
  }, [navigation, openSheet, channel.url, defaultAttachmentItems]);

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled}>
      <Icon
        color={disabled ? colors.ui.input.default.disabled.highlight : colors.ui.input.default.active.highlight}
        icon={'add'}
        size={24}
        containerStyle={styles.container}
      />
    </TouchableOpacity>
  );
};

const styles = createStyleSheet({
  container: {
    marginEnd: 8,
    padding: 4,
  },
});

export default CustomAttachmentsButton;

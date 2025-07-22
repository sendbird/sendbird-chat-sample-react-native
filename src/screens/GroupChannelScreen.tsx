import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  useSendbirdChat,
  createGroupChannelFragment,
} from '@sendbird/uikit-react-native';
import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { Logger } from "@sendbird/uikit-utils";
import { CustomChannelInput } from '../components';

const GroupChannelScreen = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();

  Logger.log('GroupChannelScreen', params);
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  // Create GroupChannelFragment with custom Input
  const GroupChannelFragment = createGroupChannelFragment({
    Input: CustomChannelInput,
  });

  return (
    <GroupChannelFragment
      channel={channel}
      onChannelDeleted={() => {
        // Navigate to GroupChannelList function.
        navigation.navigate('GroupChannelList');
      }}
      onPressHeaderLeft={() => {
        // Go back to the previous screen.
        navigation.goBack();
      }}
      onPressHeaderRight={() => {
        // Navigate to GroupChannelSettings function.
        navigation.navigate('GroupChannelSettings', { channelUrl: params.channelUrl });
      }}
    />
  );
};

export default GroupChannelScreen;

import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {createGroupChannelListFragment} from '@sendbird/uikit-react-native';

const GroupChannelListFragment = createGroupChannelListFragment();
const GroupChannelListScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <GroupChannelListFragment
      onPressCreateChannel={(channelType) => {
        // Navigate to GroupChannelCreate function.
        navigation.navigate('GroupChannelCreate', { channelType });
      }}
      onPressChannel={(channel) => {
        // Navigate to GroupChannel function.
        navigation.navigate('GroupChannel', { channelUrl: channel.url });
      }}
    />
  );
};

export default GroupChannelListScreen;

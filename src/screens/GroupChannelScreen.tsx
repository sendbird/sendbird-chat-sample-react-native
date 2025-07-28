import React, {useCallback} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSendbirdChat, createGroupChannelFragment} from '@sendbird/uikit-react-native';
import {useGroupChannel} from '@sendbird/uikit-chat-hooks';
import {Logger} from '@sendbird/uikit-utils';
import {CustomChannelInput} from '../components';
import {PollMessage} from '../components/polls/PollMessage';
import GroupChannelMessageRenderer from '@sendbird/uikit-react-native/src/components/GroupChannelMessageRenderer';
import {Poll} from '@sendbird/chat/poll';
import type {GroupChannelProps} from '@sendbird/uikit-react-native/src/domain/groupChannel/types';

const GroupChannelScreen = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<any>();

  Logger.log('GroupChannelScreen', params);
  const {sdk} = useSendbirdChat();
  const {channel} = useGroupChannel(sdk, params.channelUrl);

  const renderMessageWithPoll: GroupChannelProps['MessageList']['renderMessage'] = useCallback(
    props => {
      const {message} = props;
      const poll: Poll = message.poll;
      if (poll) {
        return (
          <PollMessage
            message={message}
            poll={poll}
            onVote={() => {
              navigation.navigate('Vote', {
                pollMessage: message,
                poll: poll,
              });
            }}
            onViewResults={() => {
              navigation.navigate('PollResult', {
                pollMessage: message,
                poll: poll,
              });
            }}
            onClosePress={() => {
              // Handle close poll action
              if (poll && channel) {
                channel.closePoll(poll.id);
              }
            }}
          />
        );
      }

      return <GroupChannelMessageRenderer {...props} />;
    },
    [navigation, channel],
  );

  if (!channel) return null;

  // Create GroupChannelFragment with custom Input and renderMessage
  const GroupChannelFragment = createGroupChannelFragment({
    Input: CustomChannelInput,
  });

  return (
    <GroupChannelFragment
      channel={channel}
      renderMessage={renderMessageWithPoll}
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
        navigation.navigate('GroupChannelSettings', {channelUrl: params.channelUrl});
      }}
    />
  );
};

export default GroupChannelScreen;

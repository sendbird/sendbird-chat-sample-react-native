import {BaseMessage} from '@sendbird/chat/message';
import {Icon, LoadingSpinner, Text, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import {GroupChannel, GroupChannelHandler} from '@sendbird/chat/groupChannel';
import React, {useEffect, useId, useState} from 'react';
import {useRootContext} from '../contexts/RootContext';
import {StyleSheet, View} from 'react-native';

type Props = {
  channel: GroupChannel;
  message: BaseMessage;
};

const SendingStatus = ({channel, message}: Props) => {
  const {colors} = useUIKitTheme();
  const {sdk} = useRootContext();
  const handlerId = useId();

  const [unreadMemberCount, setUnreadMemberCount] = useState(() => channel.getUnreadMemberCount(message));

  useEffect(() => {
    const handler = new GroupChannelHandler({
      onUnreadMemberStatusUpdated: eventChannel => {
        if (eventChannel.url === channel.url && unreadMemberCount !== 0) {
          setUnreadMemberCount(channel.getUnreadMemberCount(message));
        }
      },
    });

    sdk.groupChannel.addGroupChannelHandler(handlerId, handler);
    return () => {
      sdk.groupChannel.removeGroupChannelHandler(handlerId);
    };
  }, [unreadMemberCount]);

  const withUnreadCount = (element: React.JSX.Element) => {
    return (
      <View style={styles.unreadCountContainer}>
        {element}
        <Text style={[styles.unreadCount, {color: colors.onBackground03}]}>{`(${unreadMemberCount})`}</Text>
      </View>
    );
  };

  if (message.isUserMessage() || message.isFileMessage() || message.isMultipleFilesMessage()) {
    if (message.sendingStatus === 'failed') {
      return <Icon icon={'error'} size={16} color={colors.error} />;
    }

    if (message.sendingStatus === 'pending') {
      return <LoadingSpinner size={16} color={colors.primary} />;
    }

    if (message.sendingStatus === 'succeeded') {
      if (channel.getUnreadMemberCount(message) > 0) {
        return withUnreadCount(<Icon icon={'done'} size={16} color={colors.onBackground03} />);
      } else {
        return <Icon icon={'done'} size={16} color={colors.secondary} />;
      }
    }
  }

  return null;
};

const styles = StyleSheet.create({
  unreadCountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    fontSize: 10,
  },
});

export default SendingStatus;

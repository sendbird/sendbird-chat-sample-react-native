import {UserMessage} from '@sendbird/chat/message';
import {StyleSheet, View} from 'react-native';
import {LoadingSpinner, Text, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import React from 'react';
import {isMyMessage} from '@sendbird/uikit-utils';
import {useRootContext} from '../contexts/RootContext';
import dayjs from 'dayjs';

type Props = {
  message: UserMessage;
};

const UserMessageView = (props: Props) => {
  const {sdk} = useRootContext();
  if (isMyMessage(props.message, sdk.currentUser.userId)) {
    return <OutgoingUserMessage {...props} />;
  } else {
    return <IncomingUserMessage {...props} />;
  }
};

const OutgoingUserMessage = ({message}: Props) => {
  const {colors} = useUIKitTheme();
  return (
    <View style={{flexDirection: 'row'}}>
      <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
        <View>{message.sendingStatus === 'pending' && <LoadingSpinner size={14} style={{marginRight: 4}} />}</View>
        <Text caption4 color={colors.onBackground03} style={{marginRight: 4}}>
          {dayjs(message.createdAt).format('HH:mm')}
        </Text>
      </View>
      <View style={[styles.container, {backgroundColor: colors.primary}]}>
        <Text color={colors.onBackgroundReverse01}>{message.message}</Text>
      </View>
    </View>
  );
};

const IncomingUserMessage = ({message}: Props) => {
  const {colors} = useUIKitTheme();
  return (
    <View style={{flexDirection: 'row'}}>
      <View style={[styles.container, {backgroundColor: colors.onBackground04}]}>
        <Text color={colors.onBackground01}>{message.message}</Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
        <Text caption4 color={colors.onBackground03} style={{marginLeft: 4}}>
          {dayjs(message.createdAt).format('HH:mm')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default UserMessageView;

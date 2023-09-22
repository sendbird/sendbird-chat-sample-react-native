import {UserMessage} from '@sendbird/chat/message';
import {Linking} from 'react-native';
import {GroupChannelMessage} from '@sendbird/uikit-react-native-foundation';
import React from 'react';
import {GroupChannel} from '@sendbird/chat/groupChannel';
import {isMyMessage} from '@sendbird/uikit-utils';
import {useRootContext} from '../contexts/RootContext';
import SendingStatus from './SendingStatus';

type Props = {
  channel: GroupChannel;
  message: UserMessage;
};

const UserMessageView = ({message, channel}: Props) => {
  const {sdk} = useRootContext();

  const props = {
    variant: isMyMessage(message, sdk.currentUser?.userId) ? 'outgoing' : 'incoming',
    message: message,
    channel: channel,
    groupedWithNext: false,
    groupedWithPrev: false,
    onPressURL: (url: string) => (url.startsWith('http://') ? Linking.openURL(url) : Linking.openURL(`https://${url}`)),
    sendingStatus: isMyMessage(message, sdk.currentUser?.userId) ? <SendingStatus channel={channel} message={message} /> : null,
  } as const;

  if (message.ogMetaData) {
    return <GroupChannelMessage.OpenGraphUser {...props} />;
  } else {
    return <GroupChannelMessage.User {...props} />;
  }
};

export default UserMessageView;

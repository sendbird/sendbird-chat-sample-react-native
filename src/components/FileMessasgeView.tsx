import {FileMessage} from '@sendbird/chat/message';
import {getFileType, isMyMessage} from '@sendbird/uikit-utils';
import React from 'react';
import {GroupChannel} from '@sendbird/chat/groupChannel';
import {GroupChannelMessage} from '@sendbird/uikit-react-native-foundation';
import {useRootContext} from '../contexts/RootContext';
import SendingStatus from './SendingStatus';

type Props = {
  channel: GroupChannel;
  message: FileMessage;
};

const FileMessageView = ({message, channel}: Props) => {
  const {sdk} = useRootContext();

  const props = {
    variant: isMyMessage(message, sdk.currentUser?.userId) ? 'outgoing' : 'incoming',
    message: message,
    channel: channel,
    groupedWithNext: false,
    groupedWithPrev: false,
    sendingStatus: isMyMessage(message, sdk.currentUser?.userId) ? <SendingStatus channel={channel} message={message} /> : null,
  } as const;

  if (getFileType(message.type) === 'image') {
    return <GroupChannelMessage.ImageFile {...props} />;
  } else {
    return <GroupChannelMessage.File {...props} />;
  }
};

export default FileMessageView;

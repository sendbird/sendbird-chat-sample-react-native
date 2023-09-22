import {AdminMessage} from '@sendbird/chat/message';
import {GroupChannelMessage} from '@sendbird/uikit-react-native-foundation';
import React from 'react';
import {GroupChannel} from '@sendbird/chat/groupChannel';

type Props = {
  channel: GroupChannel;
  message: AdminMessage;
};

const AdminMessageView = ({message, channel}: Props) => {
  return <GroupChannelMessage.Admin channel={channel} message={message} groupedWithPrev={false} groupedWithNext={false} />;
};

export default AdminMessageView;

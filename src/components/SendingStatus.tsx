import {BaseMessage} from '@sendbird/chat/message';
import {Icon, LoadingSpinner, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import {GroupChannel, GroupChannelHandler} from '@sendbird/chat/groupChannel';
import {useEffect, useId} from 'react';
import {useRootContext} from '../contexts/RootContext';
import {useForceUpdate} from '@sendbird/uikit-utils';

type Props = {
  channel: GroupChannel;
  message: BaseMessage;
};

const SendingStatus = ({channel, message}: Props) => {
  const {colors} = useUIKitTheme();
  const id = useId();
  const {sdk} = useRootContext();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    sdk.groupChannel.addGroupChannelHandler(
      id,
      new GroupChannelHandler({
        onUnreadMemberStatusUpdated(eventChannel) {
          if (eventChannel.url === channel.url) {
            forceUpdate();
          }
        },
      }),
    );
    return () => {
      sdk.groupChannel.removeGroupChannelHandler(id);
    };
  }, []);

  if (message.isUserMessage() || message.isFileMessage() || message.isMultipleFilesMessage()) {
    if (message.sendingStatus === 'failed') {
      return <Icon icon={'error'} size={16} color={colors.error} />;
    }
    if (message.sendingStatus === 'pending') {
      return <LoadingSpinner size={16} color={colors.primary} />;
    }
    if (message.sendingStatus === 'succeeded') {
      if (channel.getUnreadMemberCount(message) > 0) {
        return <Icon icon={'done'} size={16} color={colors.onBackground03} />;
      } else {
        return <Icon icon={'done'} size={16} color={colors.secondary} />;
      }
    }
  }

  return null;
};

export default SendingStatus;

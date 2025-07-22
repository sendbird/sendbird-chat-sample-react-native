import React from 'react';
import {GroupChannelInput, useLocalization} from '@sendbird/uikit-react-native';
import CustomAttachmentsButton from './CustomAttachmentsButton';
import {GroupChannelProps} from '@sendbird/uikit-react-native/src/domain/groupChannel/types.ts';
import {FileType} from '@sendbird/uikit-react-native/src/platform/types';
import {useToast} from '@sendbird/uikit-react-native-foundation';

const CustomChannelInput = (props: GroupChannelProps['Input']) => {
  const {STRINGS} = useLocalization();
  const toast = useToast();
  const onFailureToSend = (error: Error) => {
    toast.show(STRINGS.TOAST.SEND_MSG_ERROR, 'error');
    console.error(error);
  };
  const sendFileMessage = (file: FileType) => {
    props
      ?.onPressSendFileMessage({
        file,
      })
      .catch(onFailureToSend);
  };

  return (
    <GroupChannelInput
      {...props}
      AttachmentsButton={() => <CustomAttachmentsButton disabled={props.inputDisabled ?? false} sendFileMessage={sendFileMessage} />}
    />
  );
};

export default CustomChannelInput;

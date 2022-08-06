import {AdminMessage} from '@sendbird/chat/message';
import {View} from 'react-native';
import {Text} from '@sendbird/uikit-react-native-foundation';
import React from 'react';

type Props = {
  message: AdminMessage;
};

const AdminMessageView = ({message}: Props) => {
  return (
    <View style={{maxWidth: 200, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12}}>
      <Text caption4>{message.message}</Text>
    </View>
  );
};

export default AdminMessageView;

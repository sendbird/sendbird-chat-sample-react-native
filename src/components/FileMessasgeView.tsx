import {FileMessage} from '@sendbird/chat/message';
import {Image, Linking, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, LoadingSpinner, Text, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import {getFileType, isMyMessage} from '@sendbird/uikit-utils';
import React from 'react';
import dayjs from 'dayjs';
import {useRootContext} from '../contexts/RootContext';

type Props = {
  message: FileMessage;
};

const FileMessageView = (props: Props) => {
  const Component = {
    image: ImageFileMessageView,
    video: DefaultFileMessageView,
    audio: DefaultFileMessageView,
    file: DefaultFileMessageView,
  }[getFileType(props.message.type)];

  return <Component {...props} />;
};

const ImageFileMessageView = (props: Props) => {
  const {colors} = useUIKitTheme();
  const {renderIncoming, renderOutgoing} = useTimestampView(props.message);
  return (
    <View style={{flexDirection: 'row'}}>
      {renderOutgoing()}
      <Image
        resizeMethod={'resize'}
        resizeMode={'cover'}
        source={{uri: props.message.url || props.message.messageParams.file.uri}}
        style={[styles.imageFileView, {backgroundColor: colors.onBackground04}]}
      />
      {renderIncoming()}
    </View>
  );
};

const DefaultFileMessageView = (props: Props) => {
  const {colors} = useUIKitTheme();
  const {renderIncoming, renderOutgoing, myMessage} = useTimestampView(props.message);

  return (
    <TouchableOpacity onPress={() => Linking.openURL(props.message.url).catch()} style={{flexDirection: 'row'}}>
      {renderOutgoing()}
      <View style={[styles.defaultFileView, {backgroundColor: myMessage ? colors.primary : colors.onBackground04}]}>
        <Icon
          icon={'file-document'}
          size={20}
          containerStyle={{marginRight: 8}}
          color={myMessage ? colors.onBackgroundReverse01 : colors.primary}
        />
        <Text numberOfLines={1} color={myMessage ? colors.onBackgroundReverse01 : colors.onBackground01} style={{flexShrink: 1}}>
          {props.message.name}
        </Text>
      </View>
      {renderIncoming()}
    </TouchableOpacity>
  );
};

const useTimestampView = (message: FileMessage) => {
  const {sdk} = useRootContext();
  const {colors} = useUIKitTheme();
  const myMessage = isMyMessage(message, sdk.currentUser.userId);

  return {
    renderOutgoing() {
      if (!myMessage) return null;
      return (
        <View style={styles.stampView}>
          <View>{message.sendingStatus === 'pending' && <LoadingSpinner size={14} style={{marginRight: 4}} />}</View>
          <Text caption4 color={colors.onBackground03} style={{marginRight: 4}}>
            {dayjs(message.createdAt).format('HH:mm')}
          </Text>
        </View>
      );
    },
    renderIncoming() {
      if (myMessage) return null;
      return (
        <View style={styles.stampView}>
          <Text caption4 color={colors.onBackground03} style={{marginLeft: 4}}>
            {dayjs(message.createdAt).format('HH:mm')}
          </Text>
        </View>
      );
    },
    myMessage,
  };
};

const styles = StyleSheet.create({
  imageFileView: {
    width: 200,
    height: 120,
    borderRadius: 12,
  },
  defaultFileView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    maxWidth: 200,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stampView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});

export default FileMessageView;

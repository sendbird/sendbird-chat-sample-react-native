import {ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useRootContext} from '../contexts/RootContext';
import {GroupChannel, MessageCollection, MessageCollectionInitPolicy} from '@sendbird/chat/groupChannel';
import {BaseMessage} from '@sendbird/chat/message';
import AdminMessageView from '../components/AdminMessageView';
import FileMessageView from '../components/FileMessasgeView';
import UserMessageView from '../components/UserMessageView';
import {Icon, TextInput, useBottomSheet} from '@sendbird/uikit-react-native-foundation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHeaderHeight} from '@react-navigation/elements';
import * as ImagePicker from 'react-native-image-picker';
import {CONNECTION_STATE_HEIGHT} from '../components/ConnectionStateView';
import {isSendableMessage} from '../libs/utils';
import {Routes, useAppNavigation} from '../libs/navigation';
import {CollectionEventSource} from '@sendbird/chat';
import {logger} from '../libs/logger';

const useHeaderRightButtons = (channel?: GroupChannel) => {
  const {navigation} = useAppNavigation();

  useLayoutEffect(() => {
    if (channel) {
      navigation.setOptions({
        headerRight: () => {
          return (
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity onPress={() => navigation.navigate(Routes.GroupChannelInvite, {channelUrl: channel.url})}>
                <Icon icon={'members'} size={20} />
              </TouchableOpacity>
              <View style={{width: 8}} />
              <TouchableOpacity
                onPress={() => {
                  channel
                    ?.leave()
                    .then(() => {
                      logger.log('leave channel, go back');
                      navigation.goBack();
                    })
                    .catch(() => {
                      logger.log('leave channel failure');
                    });
                }}>
                <Icon icon={'leave'} size={20} />
              </TouchableOpacity>
            </View>
          );
        },
      });
    }
  }, [channel]);
};

const GroupChannelScreen = () => {
  const {sdk} = useRootContext();
  const {navigation, params} = useAppNavigation();

  const [state, setState] = useState<{channel: GroupChannel; collection: MessageCollection}>();
  const [messages, setMessages] = useState<{pending: BaseMessage[]; failed: BaseMessage[]; succeeded: BaseMessage[]}>({
    pending: [],
    failed: [],
    succeeded: [],
  });

  useHeaderRightButtons(state?.channel);

  // pending -> failed
  const upsertFailedMessages = (failed: BaseMessage[]) => {
    const failedMessages = failed.filter(isSendableMessage);

    setMessages(({...draft}) => {
      failedMessages.forEach(message => {
        const pendingIdx = draft.pending.findIndex(it => isSendableMessage(it) && it.reqId === message.reqId);
        // remove from pending list
        if (pendingIdx > -1) draft.pending.splice(pendingIdx, 1);
      });

      // push to failed list
      draft.failed.push(...failed);

      return draft;
    });
  };

  // pending
  // failed -> pending
  const upsertPendingMessages = (pending: BaseMessage[]) => {
    const pendingMessages = pending.filter(isSendableMessage);

    setMessages(({...draft}) => {
      pendingMessages.forEach(message => {
        const failedIdx = draft.failed.findIndex(it => isSendableMessage(it) && it.reqId === message.reqId);
        // remove from failed list
        if (failedIdx > -1) draft.failed.splice(failedIdx, 1);
      });

      // push to pending list
      draft.pending.unshift(...pending);

      return draft;
    });
  };

  const updateSucceededMessages = (succeeded: BaseMessage[]) => {
    const succeededMessages = succeeded.filter(isSendableMessage);

    setMessages(({...draft}) => {
      succeededMessages.forEach(message => {
        const pendingIdx = draft.pending.findIndex(it => isSendableMessage(it) && it.reqId === message.reqId);
        // remove from pending list
        if (pendingIdx > -1) draft.pending.splice(pendingIdx, 1);
      });

      succeeded.forEach(message => {
        const idx = draft.succeeded.findIndex(
          it => it.messageId === message.messageId || (isSendableMessage(it) && isSendableMessage(message) && it.reqId === message.reqId),
        );

        // succeeded -> succeeded
        if (idx > -1) draft.succeeded[idx] = message;
        // pending -> succeeded
        else draft.succeeded.unshift(message);
      });

      return draft;
    });
  };

  // succeeded
  const addSucceededMessages = (succeeded: BaseMessage[], direction: 'prev' | 'next') => {
    setMessages(({...draft}) => {
      succeeded.forEach(message => {
        const idx = draft.succeeded.findIndex(
          it => it.messageId === message.messageId || (isSendableMessage(it) && isSendableMessage(message) && it.reqId === message.reqId),
        );
        if (idx > -1) draft.succeeded[idx] = message;
        else direction === 'prev' ? draft.succeeded.push(message) : draft.succeeded.unshift(message);
      });
      return draft;
    });
  };

  const deleteMessages = (messages: BaseMessage[]) => {
    setMessages(({...draft}) => {
      messages.forEach(message => {
        draft.pending = draft.pending.filter(it => isSendableMessage(it) && isSendableMessage(message) && it.reqId === message.reqId);
        draft.failed = draft.failed.filter(it => isSendableMessage(it) && isSendableMessage(message) && it.reqId === message.reqId);
        draft.succeeded = draft.succeeded.filter(
          it => it.messageId !== message.messageId || (isSendableMessage(it) && isSendableMessage(message) && it.reqId === message.reqId),
        );
      });
      return draft;
    });
  };

  const initializeCollection = async (channelUrl: string) => {
    try {
      const channel = await sdk.groupChannel.getChannel(channelUrl);
      const collection = channel.createMessageCollection();

      collection.setMessageCollectionHandler({
        onChannelDeleted() {
          navigation.goBack();
        },
        onChannelUpdated(_, channel) {
          setState(prev => (prev ? {...prev, channel} : prev));
        },
        onMessagesUpdated(context, __, messages) {
          if (context.source === CollectionEventSource.EVENT_MESSAGE_SENT_PENDING) {
            upsertPendingMessages(messages);
          } else if (context.source === CollectionEventSource.EVENT_MESSAGE_SENT_FAILED) {
            upsertFailedMessages(messages);
          } else {
            updateSucceededMessages(messages);
          }
        },
        onMessagesAdded(context, __, messages) {
          if (context.source === CollectionEventSource.EVENT_MESSAGE_SENT_PENDING) {
            upsertPendingMessages(messages);
          } else {
            addSucceededMessages(messages, 'next');

            if ([CollectionEventSource.SYNC_MESSAGE_FILL, CollectionEventSource.EVENT_MESSAGE_RECEIVED].includes(context.source)) {
              channel.markAsRead();
            }
          }
        },
        onMessagesDeleted(_, __, ___, messages) {
          deleteMessages(messages);
        },
        onHugeGapDetected() {
          // reset
          setMessages({pending: [], failed: [], succeeded: []});
          initializeCollection(channelUrl);
        },
      });
      collection
        .initialize(MessageCollectionInitPolicy.CACHE_AND_REPLACE_BY_API)
        .onCacheResult((err, messages) => {
          if (messages?.length && messages.length > 0) {
            addSucceededMessages(messages, 'prev');
          }
        })
        .onApiResult((err, messages) => {
          if (messages?.length && messages.length > 0) {
            addSucceededMessages(messages, 'prev');
          }
        });

      upsertPendingMessages(collection.pendingMessages);
      upsertFailedMessages(collection.failedMessages);
      setState({channel, collection});
      channel.markAsRead();
    } catch {
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (params?.channelUrl) {
      initializeCollection(params.channelUrl);
    } else {
      navigation.goBack();
    }
  }, [params?.channelUrl]);

  useEffect(() => {
    return () => {
      if (state?.collection) {
        state.collection.dispose();
      }
    };
  }, [state?.collection]);

  if (!state) {
    return <ActivityIndicator style={StyleSheet.absoluteFill} size={'large'} />;
  }

  return (
    <>
      <FlatList
        inverted
        data={[...messages.failed, ...messages.pending, ...messages.succeeded]}
        contentContainerStyle={{padding: 12}}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
        keyExtractor={item => (isSendableMessage(item) ? item.reqId : String(item.messageId))}
        onStartReached={async () => {
          if (state?.collection.hasNext) {
            const nextMessages = await state?.collection.loadNext();
            addSucceededMessages(nextMessages, 'next');
          }
        }}
        onEndReached={async () => {
          if (state?.collection.hasPrevious) {
            const prevMessages = await state?.collection.loadPrevious();
            addSucceededMessages(prevMessages, 'prev');
          }
        }}
        renderItem={({item}) => (
          <View style={{flex: 1}}>
            {item.isAdminMessage() && <AdminMessageView channel={state.channel} message={item} />}
            {item.isFileMessage() && <FileMessageView channel={state.channel} message={item} />}
            {item.isUserMessage() && <UserMessageView channel={state.channel} message={item} />}
          </View>
        )}
      />
      <SendInput channel={state?.channel} />
    </>
  );
};

const SendInput = ({channel}: {channel: GroupChannel}) => {
  const height = useHeaderHeight();
  const {bottom} = useSafeAreaInsets();
  const {openSheet} = useBottomSheet();

  const [text, setText] = useState('');

  const openAttachmentsSheet = async () => {
    openSheet({
      sheetItems: [
        {
          title: 'Open camera',
          icon: 'camera',
          onPress: async () => {
            const result = await ImagePicker.launchCamera({mediaType: 'mixed'});
            if (result.didCancel || result.errorCode === 'camera_unavailable') return;

            const asset = result.assets?.[0];
            if (asset) {
              const fileObject = {uri: asset.uri, name: asset.fileName, type: asset.type};
              channel.sendFileMessage({file: fileObject});
            }
          },
        },
        {
          title: 'Open gallery',
          icon: 'photo',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibrary({selectionLimit: 1, mediaType: 'mixed'});
            if (result.didCancel) return;

            const asset = result.assets?.[0];
            if (asset) {
              const fileObject = {uri: asset.uri, name: asset.fileName, type: asset.type};
              channel.sendFileMessage({file: fileObject});
            }
          },
        },
      ],
    });
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={-bottom + height + CONNECTION_STATE_HEIGHT}
      behavior={Platform.select({
        ios: 'padding' as const,
        default: undefined,
      })}>
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={openAttachmentsSheet} style={{marginRight: 8}}>
          <Icon icon={'add'} size={20} />
        </TouchableOpacity>
        <TextInput multiline placeholder={'Enter message'} value={text} onChangeText={value => setText(() => value)} style={styles.input} />
        {text.length > 0 && (
          <TouchableOpacity
            style={{marginLeft: 8}}
            onPress={() => {
              setText(() => '');
              channel.sendUserMessage({message: text});
            }}>
            <Icon icon={'send'} size={20} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{height: bottom}} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    maxHeight: 80,
    borderRadius: 4,
  },
});

export default GroupChannelScreen;

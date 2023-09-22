import {ActivityIndicator, FlatList, Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useId, useLayoutEffect, useState} from 'react';
import {useRootContext} from '../contexts/RootContext';
import {GroupChannel, GroupChannelHandler, MessageCollection, MessageCollectionInitPolicy} from '@sendbird/chat/groupChannel';
import {BaseMessage} from '@sendbird/chat/message';
import AdminMessageView from '../components/AdminMessageView';
import FileMessageView from '../components/FileMessasgeView';
import UserMessageView from '../components/UserMessageView';
import {Icon} from '@sendbird/uikit-react-native-foundation';
import {isSendableMessage} from '../libs/utils';
import {Routes, useAppNavigation} from '../libs/navigation';
import {CollectionEventSource} from '@sendbird/chat';
import {logger} from '../libs/logger';
import SendInput, {INPUT_MAX_HEIGHT} from '../components/SendInput';

const GroupChannelScreen = () => {
  const handlerId = useId();
  const {sdk} = useRootContext();
  const {navigation, params} = useAppNavigation();

  const [state, setState] = useState<{channel: GroupChannel; collection: MessageCollection}>();

  const [messages, setMessages] = useState<{pending: BaseMessage[]; failed: BaseMessage[]; succeeded: BaseMessage[]}>({
    pending: [],
    failed: [],
    succeeded: [],
  });

  useHeaderButtons(state?.channel);

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
        draft.pending = draft.pending.filter(it => isSendableMessage(it) && isSendableMessage(message) && it.reqId !== message.reqId);
        draft.failed = draft.failed.filter(it => isSendableMessage(it) && isSendableMessage(message) && it.reqId !== message.reqId);
        draft.succeeded = draft.succeeded.filter(
          it => it.messageId !== message.messageId || (isSendableMessage(it) && isSendableMessage(message) && it.reqId !== message.reqId),
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
        onChannelDeleted: () => {
          logger.info('channel deleted, go back');
          navigation.goBack();
        },
        onChannelUpdated: (_, channel) => {
          setState(prev => (prev ? {...prev, channel} : prev));
        },
        onMessagesUpdated: (context, __, messages) => {
          if (context.source === CollectionEventSource.EVENT_MESSAGE_SENT_PENDING) {
            upsertPendingMessages(messages);
          } else if (context.source === CollectionEventSource.EVENT_MESSAGE_SENT_FAILED) {
            upsertFailedMessages(messages);
          } else {
            updateSucceededMessages(messages);
          }
        },
        onMessagesAdded: (context, __, messages) => {
          if (context.source === CollectionEventSource.EVENT_MESSAGE_SENT_PENDING) {
            upsertPendingMessages(messages);
          } else {
            addSucceededMessages(messages, 'next');

            if ([CollectionEventSource.SYNC_MESSAGE_FILL, CollectionEventSource.EVENT_MESSAGE_RECEIVED].includes(context.source)) {
              channel.markAsRead();
            }
          }
        },
        onMessagesDeleted: (_, __, ___, messages) => {
          deleteMessages(messages);
        },
        onHugeGapDetected: () => {
          // reset
          setMessages({pending: [], failed: [], succeeded: []});
          initializeCollection(channelUrl);
        },
      });
      collection
        .initialize(MessageCollectionInitPolicy.CACHE_AND_REPLACE_BY_API)
        .onCacheResult((err, messages) => {
          if (messages?.length && messages.length > 0) {
            logger.log('GroupChannelScreen:', 'onCacheResult', messages.length);
            addSucceededMessages(messages, 'prev');
          }
          setState({channel, collection});
        })
        .onApiResult((err, messages) => {
          if (messages?.length && messages.length > 0) {
            logger.log('GroupChannelScreen:', 'onApiResult', messages.length);
            addSucceededMessages(messages, 'prev');
          }
          setState({channel, collection});
        });

      upsertPendingMessages(collection.pendingMessages);
      upsertFailedMessages(collection.failedMessages);
      channel.markAsRead();
    } catch {
      navigation.goBack();
    }
  };

  // Handle initialize collection
  useEffect(() => {
    if (params?.channelUrl) {
      initializeCollection(params.channelUrl);
    } else {
      navigation.goBack();
    }
  }, [params?.channelUrl]);

  // Handle dispose
  useEffect(() => {
    return () => {
      state?.collection.dispose();
    };
  }, [state?.collection]);

  // Handle banned and left
  useEffect(() => {
    const handler = new GroupChannelHandler({
      onUserBanned: (eventChannel, user) => {
        if (eventChannel.url === state?.channel.url && user.userId === sdk.currentUser?.userId) {
          logger.info('banned, go back');
          navigation.goBack();
        }
      },
      onUserLeft: (eventChannel, user) => {
        if (eventChannel.url === state?.channel.url && user.userId === sdk.currentUser?.userId) {
          logger.info('leave channel from another device, go back');
          navigation.goBack();
        }
      },
    });

    sdk.groupChannel.addGroupChannelHandler(handlerId, handler);
    return () => {
      sdk.groupChannel.removeGroupChannelHandler(handlerId);
    };
  }, []);

  // Render ActivityIndicator while loading collection
  if (!state) return <ActivityIndicator style={StyleSheet.absoluteFill} size={'large'} />;

  const keyExtractor = (item: BaseMessage) => (isSendableMessage(item) ? item.reqId : String(item.messageId));
  const onStartReached = async () => {
    if (state.collection.hasNext) {
      const nextMessages = await state.collection.loadNext();
      logger.info('onStartReached', nextMessages.length);
      addSucceededMessages(nextMessages, 'next');
    }
  };
  const onEndReached = async () => {
    if (state.collection.hasPrevious) {
      const prevMessages = await state.collection.loadPrevious();
      logger.info('onEndReached', prevMessages.length);
      addSucceededMessages(prevMessages, 'prev');
    }
  };
  const renderItem = ({item}: {item: BaseMessage}) => (
    <View style={styles.item}>
      {item.isAdminMessage() && <AdminMessageView channel={state.channel} message={item} />}
      {item.isFileMessage() && <FileMessageView channel={state.channel} message={item} />}
      {item.isUserMessage() && <UserMessageView channel={state.channel} message={item} />}
    </View>
  );

  return (
    <>
      <FlatList
        inverted
        data={[...messages.failed, ...messages.pending, ...messages.succeeded]}
        contentContainerStyle={styles.container}
        ItemSeparatorComponent={ItemSeparator}
        keyExtractor={keyExtractor}
        onStartReached={onStartReached}
        onEndReached={onEndReached}
        renderItem={renderItem}
        maintainVisibleContentPosition={{
          minIndexForVisible: 1,
          autoscrollToTopThreshold: Platform.select({android: 20 + INPUT_MAX_HEIGHT, default: 20}),
        }}
      />
      <SendInput channel={state.channel} />
    </>
  );
};

const ItemSeparator = () => <View style={styles.separator} />;
const useHeaderButtons = (channel?: GroupChannel) => {
  const {navigation} = useAppNavigation();

  useLayoutEffect(() => {
    if (channel) {
      const onPressInvite = () => navigation.navigate(Routes.GroupChannelInvite, {channelUrl: channel.url});
      const onPressLeave = async () => {
        try {
          await channel.leave();
          logger.info('leave channel, go back');
          navigation.goBack();
        } catch {
          logger.info('leave channel failure');
        }
      };

      navigation.setOptions({
        headerRight: () => {
          return (
            <View style={styles.headerButtonContainer}>
              <TouchableOpacity onPress={onPressInvite}>
                <Icon icon={'members'} size={20} />
              </TouchableOpacity>
              <View style={styles.headerButtonSeparator} />
              <TouchableOpacity onPress={onPressLeave}>
                <Icon icon={'leave'} size={20} />
              </TouchableOpacity>
            </View>
          );
        },
      });
    }
  }, [channel]);
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  separator: {
    height: 12,
  },
  item: {
    flex: 1,
  },
  headerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonSeparator: {
    width: 8,
  },
});

export default GroupChannelScreen;

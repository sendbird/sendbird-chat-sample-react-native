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
import {useForceUpdate} from '@sendbird/uikit-utils';

const GroupChannelScreen = () => {
  const handlerId = useId();
  const {sdk} = useRootContext();
  const {navigation, params} = useAppNavigation();
  const rerender = useForceUpdate();
  const [state, setState] = useState<{channel: GroupChannel; collection: MessageCollection}>();

  useHeaderButtons(state?.channel);

  const initializeCollection = async (channelUrl: string) => {
    try {
      const channel = await sdk.groupChannel.getChannel(channelUrl);
      const collection = channel.createMessageCollection();

      // Because the collection managing the message list, it supports events related to messages in that channel.
      // Therefore, you don't need to use GroupChannelHandler for message events.
      // You can determine why a specific event occurred through `context.source`.
      collection.setMessageCollectionHandler({
        onChannelDeleted: () => {
          // Notifies when the channel has been deleted.
          logger.info('channel deleted, go back');
          navigation.goBack();
        },
        onChannelUpdated: (_, channel) => {
          // Notifies when the channel has been updated.
          setState(prev => (prev ? {...prev, channel} : prev));
        },
        onMessagesUpdated: (context, channel, messages) => {
          // Notifies when a message, including updates to messages you sent, has been updated.

          // Because the collection has a list of messages, just re-render without any additional processing.
          rerender();
        },
        onMessagesAdded: (context, channel, messages) => {
          // Notifies when a new message has been added.

          // Because the collection has a list of messages, just re-render without any additional processing.
          rerender();

          // You can additionally call `markAsRead()` here.
          if ([CollectionEventSource.SYNC_MESSAGE_FILL, CollectionEventSource.EVENT_MESSAGE_RECEIVED].includes(context.source)) {
            channel.markAsRead();
          }
        },
        onMessagesDeleted: (context, channel, messageIds_deprecated, messages) => {
          // Notifies when a message has been deleted. (messageIds is deprecated, please use messages)

          // Because the collection has a list of messages, just re-render without any additional processing.
          rerender();
        },
        onHugeGapDetected: () => {
          // https://docs.sendbird.com/docs/chat/sdk/v4/javascript/local-caching/using-message-collection/message-collection#2-gap-3-huge-gap
          // This informs you when there is a significant difference between the cached message list of a channel and the actual message list.

          // It is recommended to create a new collection instance.
          initializeCollection(channelUrl);
        },
      });
      collection
        .initialize(MessageCollectionInitPolicy.CACHE_AND_REPLACE_BY_API)
        .onCacheResult((err, messages) => {
          if (messages?.length && messages.length > 0) {
            logger.log('GroupChannelScreen:', 'onCacheResult', messages.length);

            rerender();
          }
          setState({channel, collection});
        })
        .onApiResult((err, messages) => {
          if (messages?.length && messages.length > 0) {
            logger.log('GroupChannelScreen:', 'onApiResult', messages.length);

            rerender();
          }
          setState({channel, collection});
        });

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
  //   Just as you remove event listeners when the component is unmounted,
  //   You should call `collection.dispose` to stop the collection from performing background-related actions and event listening.
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

  const keyExtractor = (item: BaseMessage) => (isSendableMessage(item) && item.reqId ? item.reqId : String(item.messageId));
  const onStartReached = async () => {
    if (state.collection.hasNext) {
      const nextMessages = await state.collection.loadNext();
      logger.info('onStartReached', nextMessages.length);
      rerender();
    }
  };
  const onEndReached = async () => {
    if (state.collection.hasPrevious) {
      const prevMessages = await state.collection.loadPrevious();
      logger.info('onEndReached', prevMessages.length);
      rerender();
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
        data={[
          ...state.collection.failedMessages.reverse(),
          ...state.collection.pendingMessages.reverse(),
          ...state.collection.succeededMessages.reverse(),
        ]}
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

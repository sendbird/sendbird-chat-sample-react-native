import {ActivityIndicator, FlatList, Pressable, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getGroupChannelLastMessage, getGroupChannelTitle, useForceUpdate} from '@sendbird/uikit-utils';
import {useRootContext} from '../contexts/RootContext';
import {GroupChannelPreview, Icon, Placeholder} from '@sendbird/uikit-react-native-foundation';
import dayjs from 'dayjs';
import {GroupChannel, GroupChannelCollection, GroupChannelListOrder} from '@sendbird/chat/groupChannel';
import {Routes, useAppNavigation} from '../libs/navigation';
import {logger} from '../libs/logger';

const GroupChannelListScreen = () => {
  const {sdk} = useRootContext();
  const {navigation} = useAppNavigation<Routes.GroupChannelList>();

  const forceUpdate = useForceUpdate();
  const [collection, setCollection] = useState<GroupChannelCollection>();

  const keyExtractor = (item: GroupChannel) => item.url;
  const renderItem = ({item}: {item: GroupChannel}) => {
    return (
      <Pressable onPress={() => navigation.navigate(Routes.GroupChannel, {channelUrl: item.url})}>
        <GroupChannelPreview
          title={getGroupChannelTitle(sdk.currentUser!.userId, item)}
          badgeCount={item.unreadMessageCount}
          body={getGroupChannelLastMessage(item)}
          bodyIcon={item.lastMessage?.isFileMessage() ? 'file-document' : undefined}
          coverUrl={item.coverUrl || 'https://static.sendbird.com/sample/cover/cover_11.jpg'}
          titleCaption={dayjs(item.createdAt).format('YYYY-MM-DD')}
          frozen={item.isFrozen}
          notificationOff={item.myPushTriggerOption === 'off'}
        />
      </Pressable>
    );
  };
  const onLoadMoreChannel = async () => {
    if (collection?.hasMore) {
      await collection.loadMore();
      forceUpdate();
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={() => navigation.navigate(Routes.GroupChannelCreate)}>
            <Icon icon={'create'} />
          </TouchableOpacity>
        );
      },
    });
  }, []);

  useEffect(() => {
    const collection = sdk.groupChannel.createGroupChannelCollection({
      order: GroupChannelListOrder.LATEST_LAST_MESSAGE,
      limit: 10,
    });

    collection.setGroupChannelCollectionHandler({
      onChannelsAdded() {
        logger.info('GroupChannelListScreen:', 'onChannelsAdded');
        forceUpdate();
      },
      onChannelsDeleted() {
        logger.info('GroupChannelListScreen:', 'onChannelsDeleted');
        forceUpdate();
      },
      onChannelsUpdated() {
        logger.info('GroupChannelListScreen:', 'onChannelsUpdated');
        forceUpdate();
      },
    });

    setCollection(collection);
    collection.loadMore().then(forceUpdate);

    return () => {
      collection.dispose();
    };
  }, []);

  if (!collection) return <ActivityIndicator style={StyleSheet.absoluteFill} />;
  return (
    <FlatList
      data={collection.channels}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={onLoadMoreChannel}
      contentContainerStyle={{flexGrow: 1}}
      ListEmptyComponent={
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Placeholder icon={'channels'} message={'No channels'} />
        </View>
      }
    />
  );
};

export default GroupChannelListScreen;

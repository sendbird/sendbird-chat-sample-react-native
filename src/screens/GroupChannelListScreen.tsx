import {FlatList, Pressable, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {getGroupChannelLastMessage, getGroupChannelTitle, useAsyncEffect, useForceUpdate} from '@sendbird/uikit-utils';
import {useRootContext} from '../contexts/RootContext';
import {GroupChannelPreview, Icon} from '@sendbird/uikit-react-native-foundation';
import dayjs from 'dayjs';
import {GroupChannelListOrder} from '@sendbird/chat/groupChannel';
import {useNavigation} from '@react-navigation/native';

const GroupChannelListScreen = () => {
  const {sdk} = useRootContext();

  const navigation = useNavigation();
  const forceUpdate = useForceUpdate();
  const [collection] = useState(() => {
    return sdk.groupChannel.createGroupChannelCollection({
      order: GroupChannelListOrder.LATEST_LAST_MESSAGE,
      limit: 10,
    });
  });

  useAsyncEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={() => navigation.navigate('GroupChannelCreate')}>
            <Icon icon={'create'} />
          </TouchableOpacity>
        );
      },
    });

    collection.setGroupChannelCollectionHandler({
      onChannelsAdded() {
        forceUpdate();
      },
      onChannelsDeleted() {
        forceUpdate();
      },
      onChannelsUpdated() {
        forceUpdate();
      },
    });

    collection.loadMore().then(forceUpdate);
    return () => collection.dispose();
  }, []);

  return (
    <FlatList
      data={collection.channels}
      keyExtractor={item => item.url}
      renderItem={({item}) => (
        <Pressable onPress={() => navigation.navigate('GroupChannel', {channel: item})}>
          <GroupChannelPreview
            title={getGroupChannelTitle(sdk.currentUser.userId, item)}
            badgeCount={item.unreadMessageCount}
            body={getGroupChannelLastMessage(item)}
            bodyIcon={item.lastMessage?.isFileMessage() ? 'file-document' : undefined}
            coverUrl={item.coverUrl || 'https://static.sendbird.com/sample/cover/cover_11.jpg'}
            titleCaption={dayjs(item.createdAt).format('YYYY-MM-DD')}
            frozen={item.isFrozen}
            notificationOff={item.myPushTriggerOption === 'off'}
          />
        </Pressable>
      )}
      onEndReached={async () => {
        if (collection.hasMore) collection.loadMore().then(forceUpdate);
      }}
    />
  );
};

export default GroupChannelListScreen;

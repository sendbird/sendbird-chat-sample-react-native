import {ActivityIndicator, FlatList, Image, Platform, Pressable, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {getGroupChannelLastMessage, getGroupChannelTitle, useForceUpdate} from '@sendbird/uikit-utils';
import {useRootContext} from '../contexts/RootContext';
import {GroupChannelPreview, Icon, Placeholder, Text, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import dayjs from 'dayjs';
import {GroupChannel, GroupChannelCollection, GroupChannelListOrder} from '@sendbird/chat/groupChannel';
import {Routes, useAppNavigation} from '../libs/navigation';
import {logger} from '../libs/logger';
import {authHandler} from '../libs/auth';

const GroupChannelListScreen = () => {
  const {sdk} = useRootContext();
  const {navigation} = useAppNavigation<Routes.GroupChannelList>();

  const rerender = useForceUpdate();
  const [collection, setCollection] = useState<GroupChannelCollection>();

  useHeaderButtons();

  useEffect(() => {
    const collection = sdk.groupChannel.createGroupChannelCollection({
      order: GroupChannelListOrder.LATEST_LAST_MESSAGE,
      limit: 10,
    });

    const logAndUpdate = (type: string) => {
      logger.info('GroupChannelListScreen:', type);
      rerender();
    };

    // Because the collection has a list of channels, just re-render without any additional processing.
    collection.setGroupChannelCollectionHandler({
      onChannelsAdded: () => logAndUpdate('onChannelsAdded'),
      onChannelsUpdated: () => logAndUpdate('onChannelsUpdated'),
      onChannelsDeleted: () => logAndUpdate('onChannelsRemoved'),
    });

    setCollection(collection);
    collection.loadMore().then(rerender);

    return () => {
      collection.dispose();
    };
  }, []);

  if (!collection) return <ActivityIndicator style={StyleSheet.absoluteFill} />;

  const keyExtractor = (item: GroupChannel) => item.url;
  const renderItem = ({item}: {item: GroupChannel}) => {
    const onPressChannel = () => navigation.navigate(Routes.GroupChannel, {channelUrl: item.url});
    return (
      <Pressable onPress={onPressChannel}>
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
      rerender();
    }
  };
  const listEmptyComponent = (
    <View style={styles.listEmptyComponent}>
      <Placeholder icon={'channels'} message={'No channels'} />
    </View>
  );
  return (
    <FlatList
      data={collection.channels}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={onLoadMoreChannel}
      contentContainerStyle={styles.container}
      ListEmptyComponent={listEmptyComponent}
    />
  );
};

const useHeaderButtons = () => {
  const {colors} = useUIKitTheme();
  const {sdk, setUser} = useRootContext();
  const {navigation} = useAppNavigation<Routes.GroupChannelList>();

  useLayoutEffect(() => {
    const onPressDisconnect = async () => {
      logger.log('try disconnect');

      try {
        if (Platform.OS === 'android') {
          await sdk.unregisterFCMPushTokenAllForCurrentUser();
          logger.log('fcm token unregistered');
        }
        if (Platform.OS === 'ios') {
          await sdk.unregisterAPNSPushTokenAllForCurrentUser();
          logger.log('apns token unregistered');
        }
      } catch {
        //noop
      }

      try {
        await sdk.disconnect();
      } finally {
        logger.log('disconnected');
        authHandler.clearUser();
        setUser(null);
      }
    };

    const onPressCreateChannel = () => navigation.navigate(Routes.GroupChannelCreate);

    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Image
            resizeMode={'contain'}
            style={styles.headerTitleIcon}
            source={require('../assets/logo-icon-white.png')}
            tintColor={colors.primary}
          />
          <Text style={styles.headerTitle}>{'Channels'}</Text>
        </View>
      ),
      headerLeft: () => {
        return (
          <TouchableOpacity onPress={onPressDisconnect}>
            <Icon icon={'leave'} containerStyle={styles.leaveIcon} />
          </TouchableOpacity>
        );
      },
      headerRight: () => {
        return (
          <TouchableOpacity onPress={onPressCreateChannel}>
            <Icon icon={'create'} />
          </TouchableOpacity>
        );
      },
    });
  }, []);
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  listEmptyComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveIcon: {
    transform: [{rotate: '180deg'}],
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleIcon: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GroupChannelListScreen;

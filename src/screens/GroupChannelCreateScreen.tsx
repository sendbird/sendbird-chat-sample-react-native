import {FlatList, TouchableOpacity} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useRootContext} from '../contexts/RootContext';
import {Text, useAlert} from '@sendbird/uikit-react-native-foundation';
import {User} from '@sendbird/chat';
import {Routes, useAppNavigation} from '../libs/navigation';
import {logger} from '../libs/logger';
import UserCell from '../components/UserCell';

const GroupChannelCreateScreen = () => {
  const {sdk} = useRootContext();
  const {navigation} = useAppNavigation();

  const {alert} = useAlert();

  const [query] = useState(() => sdk.createApplicationUserListQuery());
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const onCreateChannel = async () => {
    logger.log('GroupChannelCreateScreen:', `create channel with ${selectedUsers.length} users`);
    if (selectedUsers.length > 0) {
      const channel = await sdk.groupChannel.createChannel({
        invitedUserIds: selectedUsers.map(it => it.userId),
        operatorUserIds: [sdk.currentUser!.userId],
      });

      navigation.replace(Routes.GroupChannel, {channelUrl: channel.url});
    } else {
      alert({
        title: 'No users selected',
        message: 'Please select at least one user to create a channel.',
      });
    }
  };

  const keyExtractor = useCallback((item: User) => item.userId, []);

  const onPressUserCell = useCallback((user: User) => {
    setSelectedUsers(([...draft]) => {
      const index = draft.indexOf(user);
      if (index > -1) {
        draft.splice(index, 1);
      } else {
        draft.push(user);
      }
      return draft;
    });
  }, []);

  const renderItem = useCallback(
    ({item}: {item: User}) => {
      return (
        <UserCell
          onPress={onPressUserCell}
          user={item}
          selected={selectedUsers.indexOf(item) > -1}
          me={item.userId === sdk.currentUser?.userId}
        />
      );
    },
    [selectedUsers],
  );

  const onLoadMoreUsers = useCallback(async () => {
    if (query.hasNext) {
      const fetchedUsers = await query.next();
      setUsers(prev => [...prev, ...fetchedUsers]);
    }
  }, [query]);

  useEffect(() => {
    const initialFetch = async () => {
      if (query.hasNext) {
        const initialUsers = await query.next();
        setUsers(initialUsers);
      }
    };

    initialFetch();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={onCreateChannel}>
            <Text button>{'Create'}</Text>
          </TouchableOpacity>
        );
      },
    });
  }, [selectedUsers.length]);

  return <FlatList data={users} keyExtractor={keyExtractor} renderItem={renderItem} onEndReached={onLoadMoreUsers} />;
};

export default GroupChannelCreateScreen;

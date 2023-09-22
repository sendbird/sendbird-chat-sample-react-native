import {FlatList, TouchableOpacity} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useRootContext} from '../contexts/RootContext';
import {Text, useAlert} from '@sendbird/uikit-react-native-foundation';
import {User} from '@sendbird/chat';
import {Routes, useAppNavigation} from '../libs/navigation';
import {logger} from '../libs/logger';
import UserCell from '../components/UserCell';

const GroupChannelCreateScreen = () => {
  const {sdk} = useRootContext();
  const [query] = useState(() => sdk.createApplicationUserListQuery());
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  useHeaderButtons(selectedUsers);

  useEffect(() => {
    const initialFetch = async () => {
      if (query.hasNext) {
        const initialUsers = await query.next();
        setUsers(initialUsers);
      }
    };

    initialFetch();
  }, []);

  const keyExtractor = (item: User) => item.userId;
  const onPressUserCell = (user: User) => {
    setSelectedUsers(([...draft]) => {
      const index = draft.indexOf(user);
      if (index > -1) {
        draft.splice(index, 1);
      } else {
        draft.push(user);
      }
      return draft;
    });
  };
  const renderItem = ({item}: {item: User}) => {
    return (
      <UserCell
        onPress={onPressUserCell}
        user={item}
        selected={selectedUsers.indexOf(item) > -1}
        me={item.userId === sdk.currentUser?.userId}
      />
    );
  };
  const onLoadMoreUsers = async () => {
    if (query.hasNext) {
      const fetchedUsers = await query.next();
      setUsers(prev => [...prev, ...fetchedUsers]);
    }
  };

  return <FlatList data={users} keyExtractor={keyExtractor} renderItem={renderItem} onEndReached={onLoadMoreUsers} />;
};

const useHeaderButtons = (selectedUsers: User[]) => {
  const {sdk} = useRootContext();
  const {navigation} = useAppNavigation();
  const {alert} = useAlert();

  useLayoutEffect(() => {
    const onPressCreateChannel = async () => {
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

    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={onPressCreateChannel}>
            <Text button>{'Create'}</Text>
          </TouchableOpacity>
        );
      },
    });
  }, [selectedUsers.length]);
};

export default GroupChannelCreateScreen;

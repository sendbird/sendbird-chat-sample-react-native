import {FlatList, Pressable, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {useAsyncEffect, useFreshCallback} from '@sendbird/uikit-utils';
import {useRootContext} from '../contexts/RootContext';
import {Avatar, Icon, Text} from '@sendbird/uikit-react-native-foundation';
import {useNavigation} from '@react-navigation/native';
import {User} from '@sendbird/chat';

const GroupChannelCreateScreen = () => {
  const {sdk} = useRootContext();

  const navigation = useNavigation();
  const [query] = useState(() => sdk.createApplicationUserListQuery());

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const onCreateChannel = useFreshCallback(async () => {
    if (selectedUsers.length > 0) {
      const channel = await sdk.groupChannel.createChannel({
        invitedUserIds: selectedUsers.map(u => u.userId),
        operatorUserIds: [sdk.currentUser.userId],
      });
      // @ts-ignore
      navigation.replace('GroupChannel', {channel});
    }
  });

  useAsyncEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={onCreateChannel}>
            <Text button>{'Create'}</Text>
          </TouchableOpacity>
        );
      },
    });

    if (query.hasNext) query.next().then(setUsers);
  }, []);

  return (
    <FlatList
      data={users}
      keyExtractor={item => item.userId}
      renderItem={({item}) => {
        const itemIdx = selectedUsers.indexOf(item);
        const isMe = item.userId === sdk.currentUser.userId;
        return (
          <Pressable
            disabled={isMe}
            onPress={() => {
              if (itemIdx > -1) {
                setSelectedUsers(([...draft]) => {
                  draft.splice(itemIdx, 1);
                  return draft;
                });
              } else {
                setSelectedUsers(prev => [...prev, item]);
              }
            }}
            style={{flexDirection: 'row', alignItems: 'center', padding: 8}}>
            <View style={{marginRight: 12}}>
              <Avatar uri={item.profileUrl} />
              {(itemIdx > -1 || isMe) && (
                <Icon
                  icon={'done'}
                  color={'white'}
                  containerStyle={[StyleSheet.absoluteFill, {borderRadius: 99, backgroundColor: 'rgba(0,0,0,0.7)'}]}
                />
              )}
            </View>
            <View>
              <Text body2 numberOfLines={1} style={{marginBottom: 4}}>{`Nickname: ${item.nickname || '(No name)'}`}</Text>
              <Text caption2 numberOfLines={1}>{`User ID: ${item.userId}`}</Text>
            </View>
          </Pressable>
        );
      }}
      onEndReached={() => {
        if (query.hasNext) query.next().then(u => setUsers(prev => [...prev, ...u]));
      }}
    />
  );
};

export default GroupChannelCreateScreen;

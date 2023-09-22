import {User} from '@sendbird/chat';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Avatar, Icon, Text} from '@sendbird/uikit-react-native-foundation';

type Props = {
  user: User;
  selected: boolean;
  me: boolean;
  onPress: (user: User) => void;
};

const UserCell = ({user, selected, me, onPress}: Props) => {
  return (
    <Pressable disabled={me} onPress={() => onPress(user)} style={{flexDirection: 'row', alignItems: 'center', padding: 8}}>
      <View style={{marginRight: 12}}>
        <Avatar uri={user.profileUrl} />
        {(selected || me) && (
          <Icon
            icon={'done'}
            color={'white'}
            containerStyle={[StyleSheet.absoluteFill, {borderRadius: 99, backgroundColor: 'rgba(0,0,0,0.7)'}]}
          />
        )}
      </View>
      <View>
        <Text body2 numberOfLines={1} style={{marginBottom: 4}}>{`Nickname: ${user.nickname || '(No name)'}`}</Text>
        <Text caption2 numberOfLines={1}>{`User ID: ${user.userId}`}</Text>
      </View>
    </Pressable>
  );
};

export default React.memo(UserCell);

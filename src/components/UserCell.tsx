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
    <Pressable disabled={me} onPress={() => onPress(user)} style={styles.container}>
      <View style={styles.profile}>
        <Avatar uri={user.profileUrl} />
        {(selected || me) && <Icon icon={'done'} color={'white'} containerStyle={styles.doneIcon} />}
      </View>
      <View>
        <Text body2 numberOfLines={1} style={styles.nickname}>{`Nickname: ${user.nickname || '(No name)'}`}</Text>
        <Text caption2 numberOfLines={1}>{`User ID: ${user.userId}`}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  profile: {
    marginRight: 12,
  },
  doneIcon: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  nickname: {
    marginBottom: 4,
  },
});

export default React.memo(UserCell);

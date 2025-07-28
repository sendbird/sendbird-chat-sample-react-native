import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';

import {useConnection} from '@sendbird/uikit-react-native';
import {Button, Text, TextInput, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';

const SignInScreen = () => {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const {connect} = useConnection();
  const {colors} = useUIKitTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={styles.title}>{'Sendbird RN-UIKit sample'}</Text>
      <TextInput
        placeholder={'User ID'}
        value={userId}
        onChangeText={setUserId}
        style={[styles.input, {backgroundColor: colors.onBackground04, marginBottom: 12}]}
      />
      <TextInput
        placeholder={'Nickname'}
        value={nickname}
        onChangeText={setNickname}
        style={[styles.input, {backgroundColor: colors.onBackground04}]}
      />
      <Button
        style={styles.btn}
        variant={'contained'}
        onPress={async () => {
          if (userId) {
            await connect(userId, {nickname});
          }
        }}>
        {'Sign in'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 34,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
  },
  input: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 32,
    paddingTop: 16,
    paddingBottom: 16,
  },
});

export default SignInScreen;

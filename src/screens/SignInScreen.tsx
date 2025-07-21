import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useConnection } from '@sendbird/uikit-react-native';

const SignInScreen = () => {
  const { connect } = useConnection();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Pressable
        style={{
          width: 120,
          height: 30,
          backgroundColor: '#742DDD',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        // TODO: Use the ID of a user you've created on the dashboard.
        // If there isn't one, specify a unique ID so that a new user can be created with the value.
        onPress={() => connect('test_id')}
      >
        <Text>{'Sign in'}</Text>
      </Pressable>
    </View>
  );
};

export default SignInScreen;

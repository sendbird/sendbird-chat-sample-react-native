import {useRootContext} from '../contexts/RootContext';
import {Platform, ScrollView} from 'react-native';
import {Button, Text, TextInput, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import React, {useState} from 'react';
import {isCacheRestrictedError} from '../libs/utils';
import {logger} from '../libs/logger';

const ConnectScreen = () => {
  const {sdk, setUser} = useRootContext();
  const {colors} = useUIKitTheme();

  const [isConnecting, setIsConnecting] = useState(false);
  const [state, setState] = useState({
    id: 'ReactNative-' + Platform.OS,
    accessToken: '',
  });

  const onPressConnect = async () => {
    logger.log('try connect');
    try {
      setIsConnecting(true);
      const user = await sdk.connect(state.id);
      setUser(user);
    } catch (e) {
      if (sdk.isCacheEnabled && sdk.currentUser) {
        if (isCacheRestrictedError(e)) {
          logger.log('connect failure and getting cache restricted error, clear cache');
          sdk.clearCachedData();
        } else {
          logger.log('connect failure, connect with offline mode');
          setUser(sdk.currentUser);
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{padding: 24}}>
      <Text caption3 color={colors.onBackground02}>
        {'User ID'}
      </Text>
      <TextInput
        placeholder={'Required'}
        value={state.id}
        onChangeText={id => setState(prev => ({...prev, id}))}
        style={{marginBottom: 12}}
      />
      <Text caption3 color={colors.onBackground02}>
        {'Access token'}
      </Text>
      <TextInput
        placeholder={'Optional'}
        value={state.accessToken}
        onChangeText={accessToken => setState(prev => ({...prev, accessToken}))}
        style={{marginBottom: 12}}
      />
      <Button onPress={onPressConnect} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect'}
      </Button>
    </ScrollView>
  );
};

export default ConnectScreen;

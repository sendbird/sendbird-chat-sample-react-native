import {useRootContext} from '../contexts/RootContext';
import {Text, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import {useForceUpdate} from '@sendbird/uikit-utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useEffect} from 'react';
import {ConnectionHandler} from '@sendbird/chat';
import {AppState, View} from 'react-native';

export const CONNECTION_STATE_HEIGHT = 24;

const ConnectionStateView = () => {
  const {sdk} = useRootContext();

  const {colors} = useUIKitTheme();
  const forceUpdate = useForceUpdate();
  const {top} = useSafeAreaInsets();

  useEffect(() => {
    const KEY = 'root';
    const handler = new ConnectionHandler();
    handler.onConnected = () => forceUpdate();
    handler.onDisconnected = () => forceUpdate();
    handler.onReconnectFailed = () => forceUpdate();
    handler.onReconnectStarted = () => forceUpdate();
    handler.onReconnectSucceeded = () => forceUpdate();
    sdk.addConnectionHandler(KEY, handler);
    return () => sdk.removeConnectionHandler(KEY);
  }, [sdk]);

  useEffect(() => {
    const subscribe = AppState.addEventListener('change', state => {
      if (sdk.currentUser) {
        if (state === 'active') sdk.setForegroundState();
        if (state === 'background') sdk.setBackgroundState();
      }
    });

    return () => subscribe.remove();
  }, [sdk]);

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: CONNECTION_STATE_HEIGHT + top,
        paddingTop: top,
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
      }}>
      <Text caption3 color={colors.onBackgroundReverse01}>
        {`Connection state: ${sdk.connectionState}`}
      </Text>
    </View>
  );
};
export default ConnectionStateView;

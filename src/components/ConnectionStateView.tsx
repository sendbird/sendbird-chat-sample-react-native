import {useRootContext} from '../contexts/RootContext';
import {Text, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import {useForceUpdate} from '@sendbird/uikit-utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useEffect} from 'react';
import {ConnectionHandler} from '@sendbird/chat';
import {AppState, View} from 'react-native';
import {logger} from '../libs/logger';

export const CONNECTION_STATE_HEIGHT = 24;

const ConnectionStateView = () => {
  const forceUpdate = useForceUpdate();
  const {sdk} = useRootContext();
  const {colors} = useUIKitTheme();
  const {top} = useSafeAreaInsets();

  const logAndUpdate = (type: string) => {
    logger.info('ConnectionStateView:', type);
    forceUpdate();
  };

  useEffect(() => {
    const KEY = 'root';
    const handler = new ConnectionHandler();
    handler.onConnected = () => logAndUpdate('onConnected');
    handler.onDisconnected = () => logAndUpdate('onDisconnected');
    handler.onReconnectFailed = () => logAndUpdate('onReconnectFailed');
    handler.onReconnectStarted = () => logAndUpdate('onReconnectStarted');
    handler.onReconnectSucceeded = () => logAndUpdate('onReconnectSucceeded');
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

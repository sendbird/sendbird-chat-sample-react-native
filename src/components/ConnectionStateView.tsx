import {useRootContext} from '../contexts/RootContext';
import {Text, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import {useForceUpdate} from '@sendbird/uikit-utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useEffect, useId} from 'react';
import {ConnectionHandler} from '@sendbird/chat';
import {StyleSheet, View} from 'react-native';
import {logger} from '../libs/logger';

export const CONNECTION_STATE_HEIGHT = 24;

const ConnectionStateView = () => {
  const {sdk} = useRootContext();
  const {colors} = useUIKitTheme();
  const {top} = useSafeAreaInsets();

  const rerender = useForceUpdate();
  const handlerId = useId();

  useEffect(() => {
    const logAndUpdate = (type: string) => {
      logger.info('ConnectionStateView:', type);
      rerender();
    };

    const handler = new ConnectionHandler({
      onConnected: () => logAndUpdate('onConnected'),
      onDisconnected: () => logAndUpdate('onDisconnected'),
      onReconnectFailed: () => logAndUpdate('onReconnectFailed'),
      onReconnectStarted: () => logAndUpdate('onReconnectStarted'),
      onReconnectSucceeded: () => logAndUpdate('onReconnectSucceeded'),
    });

    sdk.addConnectionHandler(handlerId, handler);
    return () => {
      sdk.removeConnectionHandler(handlerId);
    };
  }, [sdk]);

  return (
    <View style={[styles.container, {height: CONNECTION_STATE_HEIGHT + top, paddingTop: top, backgroundColor: colors.primary}]}>
      <Text caption3 color={colors.onBackgroundReverse01}>
        {`Connection state: ${sdk.connectionState}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});

export default ConnectionStateView;

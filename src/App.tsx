import React, {useEffect} from 'react';
import {
  DarkUIKitTheme,
  DialogProvider,
  LightUIKitTheme,
  Text,
  ToastProvider,
  UIKitThemeProvider,
  useUIKitTheme,
} from '@sendbird/uikit-react-native-foundation';
import {AppState, useColorScheme, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import GroupChannelListScreen from './screens/GroupChannelListScreen';
import {RootContextProvider, useRootContext} from './contexts/RootContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectScreen from './screens/ConnectScreen';
import {useForceUpdate} from '@sendbird/uikit-utils';
import {ConnectionHandler} from '@sendbird/chat';

const APP_ID = '9DA1B1F4-0BE6-4DA8-82C5-2E81DAB56F23';

const App = () => {
  const scheme = useColorScheme();

  return (
    <RootContextProvider appId={APP_ID} localCacheStorage={AsyncStorage}>
      <SafeAreaProvider>
        <UIKitThemeProvider
          theme={scheme === 'dark' ? DarkUIKitTheme : LightUIKitTheme}>
          <DialogProvider>
            <ToastProvider>
              <ConnectionState />
              <Navigations scheme={scheme} />
            </ToastProvider>
          </DialogProvider>
        </UIKitThemeProvider>
      </SafeAreaProvider>
    </RootContextProvider>
  );
};

const Stack = createNativeStackNavigator();

const ConnectionState = () => {
  const {sdk} = useRootContext();

  const {colors} = useUIKitTheme();
  const forceUpdate = useForceUpdate();

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
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}>
      <Text caption3 color={colors.onBackgroundReverse01}>
        {`Connection state: ${sdk.connectionState}`}
      </Text>
    </View>
  );
};
const Navigations = ({scheme}: {scheme?: 'light' | 'dark' | null}) => {
  const {user} = useRootContext();

  const theme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...theme,
        colors: {
          ...theme.colors,
          background: scheme === 'dark' ? '#222' : '#fff',
        },
      }}>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name={'Connect'} component={ConnectScreen} />
        ) : (
          <Stack.Group>
            <Stack.Screen
              name={'GroupChannelList'}
              component={GroupChannelListScreen}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

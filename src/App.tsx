import React, {useEffect} from 'react';
import {DarkUIKitTheme, DialogProvider, LightUIKitTheme, ToastProvider, UIKitThemeProvider} from '@sendbird/uikit-react-native-foundation';
import {useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
import GroupChannelListScreen from './screens/GroupChannelListScreen';
import {RootContextProvider, useRootContext} from './contexts/RootContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectScreen from './screens/ConnectScreen';
import GroupChannelScreen from './screens/GroupChannelScreen';
import ConnectionStateView from './components/ConnectionStateView';
import GroupChannelCreateScreen from './screens/GroupChannelCreateScreen';
import {navigationRef, Routes} from './libs/navigation';
import {LogLevel} from '@sendbird/chat';
import GroupChannelInviteScreen from './screens/GroupChannelInviteScreen';
import {notificationHandler} from './libs/notifications';
import {permissionHandler} from './libs/permissions';

const Stack = createNativeStackNavigator();
const APP_ID = '9DA1B1F4-0BE6-4DA8-82C5-2E81DAB56F23';

notificationHandler.startOnBackground();
const Navigations = ({scheme}: {scheme?: 'light' | 'dark' | null}) => {
  const {user} = useRootContext();
  const theme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  useEffect(() => {
    let unsubscribe = () => {
      /* noop */
    };

    permissionHandler.requestPermissions().then(({notification}) => {
      if (notification) {
        notificationHandler.startOnAppOpened();
        unsubscribe = notificationHandler.startOnForeground();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        ...theme,
        colors: {
          ...theme.colors,
          background: scheme === 'dark' ? '#222' : '#fff',
        },
      }}>
      <Stack.Navigator screenOptions={{headerBackTitleVisible: false}}>
        {!user ? (
          <Stack.Screen name={'Connect'} component={ConnectScreen} />
        ) : (
          <Stack.Group>
            <Stack.Screen name={Routes.GroupChannelList} component={GroupChannelListScreen} />
            <Stack.Screen name={Routes.GroupChannelCreate} component={GroupChannelCreateScreen} />
            <Stack.Screen name={Routes.GroupChannel} component={GroupChannelScreen} />
            <Stack.Screen name={Routes.GroupChannelInvite} component={GroupChannelInviteScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  const scheme = useColorScheme();

  return (
    <RootContextProvider appId={APP_ID} localCacheStorage={AsyncStorage} logLevel={LogLevel.WARN}>
      <SafeAreaProvider>
        <UIKitThemeProvider theme={scheme === 'dark' ? DarkUIKitTheme : LightUIKitTheme}>
          <DialogProvider>
            <ToastProvider>
              <ConnectionStateView />
              <Navigations scheme={scheme} />
            </ToastProvider>
          </DialogProvider>
        </UIKitThemeProvider>
      </SafeAreaProvider>
    </RootContextProvider>
  );
};

export default App;

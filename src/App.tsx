import React from 'react';
import {DarkUIKitTheme, DialogProvider, LightUIKitTheme, ToastProvider, UIKitThemeProvider} from '@sendbird/uikit-react-native-foundation';
import {LogBox, useColorScheme} from 'react-native';
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

const APP_ID = '9DA1B1F4-0BE6-4DA8-82C5-2E81DAB56F23';

const App = () => {
  const scheme = useColorScheme();

  return (
    <RootContextProvider appId={APP_ID} localCacheStorage={AsyncStorage}>
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

const Stack = createNativeStackNavigator();
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
            <Stack.Screen name={'GroupChannelList'} component={GroupChannelListScreen} />
            <Stack.Screen name={'GroupChannelCreate'} component={GroupChannelCreateScreen} />
            <Stack.Screen name={'GroupChannel'} component={GroupChannelScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

export default App;

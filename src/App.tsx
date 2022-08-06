import React from 'react';
import {
  DarkUIKitTheme,
  DialogProvider,
  LightUIKitTheme,
  ToastProvider,
  UIKitThemeProvider,
} from '@sendbird/uikit-react-native-foundation';
import {useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import GroupChannelListScreen from './screens/GroupChannelListScreen';
import {RootContextProvider, useRootContext} from './contexts/RootContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectScreen from './screens/ConnectScreen';

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
              <Navigations />
            </ToastProvider>
          </DialogProvider>
        </UIKitThemeProvider>
      </SafeAreaProvider>
    </RootContextProvider>
  );
};

const Stack = createNativeStackNavigator();

const Navigations = () => {
  const {user} = useRootContext();
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: 'white',
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

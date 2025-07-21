import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MMKV} from 'react-native-mmkv';

import {
  SendbirdUIKitContainer,
  useSendbirdChat,
} from '@sendbird/uikit-react-native';

import {platformServices} from './factory';
import {
  GroupChannelCreateScreen,
  GroupChannelListScreen,
  GroupChannelScreen,
  SignInScreen,
} from './screens';
import {Logger} from '@sendbird/uikit-utils';
import {LogLevel} from '@sendbird/chat';

const mmkv = new MMKV();

const RootStack = createNativeStackNavigator();
const Navigation = () => {
  const {sdk, currentUser} = useSendbirdChat();

  sdk.logLevel = LogLevel.VERBOSE;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {!currentUser ? (
          <RootStack.Screen name={'SignIn'} component={SignInScreen} />
        ) : (
          <>
            <RootStack.Screen
              name={'GroupChannelList'}
              component={GroupChannelListScreen}
            />
            <RootStack.Screen
              name={'GroupChannelCreate'}
              component={GroupChannelCreateScreen}
            />
            <RootStack.Screen
              name={'GroupChannel'}
              component={GroupChannelScreen}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  Logger.setLogLevel('debug'); // Set log level to DEBUG for detailed logs
  return (
    <SendbirdUIKitContainer
      appId={'A41EC43B-87A9-40CF-92C5-E178DD0477B1'} // Replace with your Sendbird application ID
      chatOptions={{
        localCacheStorage: mmkv,
        enableAutoPushTokenRegistration: false,
      }}
      platformServices={platformServices}>
      <Navigation />
    </SendbirdUIKitContainer>
  );
}

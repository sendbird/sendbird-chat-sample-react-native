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
  PollCreateScreen,
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
            <RootStack.Screen
              name={'PollCreate'}
              component={PollCreateScreen}
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
      appId={'FEA2129A-EA73-4EB9-9E0B-EC738E7EB768'} // Replace with your Sendbird application ID
      chatOptions={{
        localCacheStorage: mmkv,
        enableAutoPushTokenRegistration: false,
      }}
      platformServices={platformServices}>
      <Navigation />
    </SendbirdUIKitContainer>
  );
}

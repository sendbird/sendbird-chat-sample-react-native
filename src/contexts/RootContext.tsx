import React, {createContext, useContext, useEffect, useState} from 'react';
import SendbirdChat, {LogLevel, User} from '@sendbird/chat';
import {AsyncStorageStatic} from '@react-native-async-storage/async-storage/lib/typescript/types';
import {GroupChannelModule} from '@sendbird/chat/groupChannel';
import {OpenChannelModule} from '@sendbird/chat/openChannel';
import {ModuleNamespaces} from '@sendbird/chat/lib/__definition';
import {logger} from '../libs/logger';
import {initializeSDK, translateToSampleLogLevel} from '../libs/utils';
import {permissionHandler} from '../libs/permissions';
import {notificationHandler} from '../libs/notifications';
import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';

export interface RootContextData {
  sdk: SendbirdChat & ModuleNamespaces<[GroupChannelModule, OpenChannelModule]>;
  user: User | null;
  setUser: (user: User | null) => void;
}

type Props = React.PropsWithChildren<{
  appId: string;
  logLevel?: LogLevel;
  localCacheStorage?: AsyncStorageStatic;
}>;

export const RootContext = createContext<RootContextData | null>(null);
export const RootContextProvider = ({children, appId, logLevel, localCacheStorage}: Props) => {
  const [user, setUser] = useState<RootContextData['user']>(null);
  const [sdk, setSDK] = useState(() => initializeSDK(appId, logLevel, localCacheStorage));

  if (sdk.appId !== appId) {
    logger.log('RootContext:', 'application id has been changed.');
    sdk.disconnect();
    setSDK(initializeSDK(appId, logLevel, localCacheStorage));
    setUser(null);
  }

  if (sdk.logLevel !== logLevel && logLevel) {
    logger.log('RootContext:', 'log level has been changed.');
    sdk.logLevel = logLevel;
  }

  logger.setLogLevel(translateToSampleLogLevel(sdk.logLevel));

  useEffect(() => {
    if (!user) return;

    permissionHandler.requestPermissions().then(async ({notification}) => {
      if (!notification) return;

      if (Platform.OS === 'android') {
        const token = await messaging().getToken();
        if (token) {
          await sdk.registerFCMPushTokenForCurrentUser(token);
          logger.log('fcm token registered', token);
        }
      }

      if (Platform.OS === 'ios') {
        const token = await messaging().getAPNSToken();
        if (token) {
          await sdk.registerAPNSPushTokenForCurrentUser(token);
          logger.log('apns token registered', token);
        }
      }
    });
  }, [user]);

  rootContextRef.current = {sdk, user, setUser};
  return <RootContext.Provider value={rootContextRef.current}>{children}</RootContext.Provider>;
};

export const rootContextRef = (function () {
  let current: RootContextData | null = null;
  return {
    get current() {
      if (current === null) throw Error('Please setup RootContext');
      return current;
    },
    set current(value: RootContextData | null) {
      current = value;
    },
    isReady() {
      return current !== null;
    },
  };
})();
export const useRootContext = () => {
  const context = useContext(RootContext);
  if (!context) throw new Error('Not provided RootContext');
  return context;
};

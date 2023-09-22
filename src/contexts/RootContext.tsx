import React, {createContext, useContext, useEffect, useState} from 'react';
import SendbirdChat, {LogLevel, User} from '@sendbird/chat';
import {GroupChannelModule} from '@sendbird/chat/groupChannel';
import {OpenChannelModule} from '@sendbird/chat/openChannel';
import {ModuleNamespaces} from '@sendbird/chat/lib/__definition';
import {logger} from '../libs/logger';
import {translateToSampleLogLevel} from '../libs/utils';
import {AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RootContextData {
  sdk: SendbirdChat & ModuleNamespaces<[GroupChannelModule, OpenChannelModule]>;
  user: User | null;
  setUser: (user: User | null) => void;
}

type Props = React.PropsWithChildren<{
  appId: string;
  logLevel?: LogLevel;
}>;

export const RootContext = createContext<RootContextData | null>(null);
export const RootContextProvider = ({children, appId, logLevel}: Props) => {
  const [user, setUser] = useState<RootContextData['user']>(null);
  const [sdk] = useState(() => {
    return SendbirdChat.init({
      appId,
      logLevel,
      modules: [new GroupChannelModule(), new OpenChannelModule()],
      useAsyncStorageStore: AsyncStorage,
      localCacheEnabled: true,
    });
  });

  if (sdk.logLevel !== logLevel && logLevel) {
    logger.log('RootContext:', 'log level has been changed.');
    sdk.logLevel = logLevel;
  }

  logger.setLogLevel(translateToSampleLogLevel(sdk.logLevel));

  useEffect(() => {
    const subscribe = AppState.addEventListener('change', state => {
      if (sdk.currentUser) {
        if (state === 'active') sdk.setForegroundState();
        if (state === 'background') sdk.setBackgroundState();
      }
    });

    return () => subscribe.remove();
  }, [sdk]);

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

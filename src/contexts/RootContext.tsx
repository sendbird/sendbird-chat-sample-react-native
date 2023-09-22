import React, {createContext, useContext, useState} from 'react';
import SendbirdChat, {LogLevel, User} from '@sendbird/chat';
import {AsyncStorageStatic} from '@react-native-async-storage/async-storage/lib/typescript/types';
import {GroupChannelModule} from '@sendbird/chat/groupChannel';
import {OpenChannelModule} from '@sendbird/chat/openChannel';
import {ModuleNamespaces} from '@sendbird/chat/lib/__definition';
import {logger} from '../libs/logger';
import {initializeSDK, translateToSampleLogLevel} from '../libs/utils';

interface Root {
  sdk: SendbirdChat & ModuleNamespaces<[GroupChannelModule, OpenChannelModule]>;
  user: User | null;
  setUser: (user: User | null) => void;
}

type Props = React.PropsWithChildren<{
  appId: string;
  logLevel?: LogLevel;
  localCacheStorage?: AsyncStorageStatic;
}>;

export const RootContext = createContext<Root | null>(null);

export const RootContextProvider = ({children, appId, logLevel, localCacheStorage}: Props) => {
  const [user, setUser] = useState<Root['user']>(null);
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

  return <RootContext.Provider value={{sdk, user, setUser}}>{children}</RootContext.Provider>;
};

export const useRootContext = () => {
  const context = useContext(RootContext);
  if (!context) throw new Error('Not provided RootContext');
  return context;
};

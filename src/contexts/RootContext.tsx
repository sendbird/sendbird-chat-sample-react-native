import React, {createContext, useContext, useEffect, useState} from 'react';
import SendbirdChat, {LogLevel, User} from '@sendbird/chat';
import {AsyncStorageStatic} from '@react-native-async-storage/async-storage/lib/typescript/types';
import {GroupChannelModule} from '@sendbird/chat/groupChannel';
import {OpenChannelModule} from '@sendbird/chat/openChannel';
import {ModuleNamespaces} from '@sendbird/chat/lib/__definition';

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

export const RootContextProvider = ({
  children,
  appId,
  logLevel,
  localCacheStorage,
}: Props) => {
  const initSDK = () => {
    return SendbirdChat.init({
      appId,
      logLevel,
      modules: [new GroupChannelModule(), new OpenChannelModule()],
      useAsyncStorageStore: localCacheStorage,
      localCacheEnabled: Boolean(localCacheStorage),
    });
  };

  const [sdk, setSdk] = useState(initSDK);
  const [user, setUser] = useState<Root['user']>(null);

  useEffect(() => {
    if (sdk.appId !== appId) {
      setSdk(initSDK);
      setUser(null);
    }

    if (logLevel) sdk.logLevel = logLevel;
  }, [appId, logLevel]);

  return (
    <RootContext.Provider value={{sdk, user, setUser}}>
      {children}
    </RootContext.Provider>
  );
};

export const useRootContext = () => {
  const context = useContext(RootContext);
  if (!context) throw new Error('Not provided RootContext');
  return context;
};

import SendbirdChat, {LogLevel, SendbirdError} from '@sendbird/chat';
import {AsyncStorageStatic} from '@react-native-async-storage/async-storage/lib/typescript/types';
import {GroupChannelModule} from '@sendbird/chat/groupChannel';
import {OpenChannelModule} from '@sendbird/chat/openChannel';
import {LayoutAnimation} from 'react-native';
import {BaseMessage, FileMessage, MultipleFilesMessage, UserMessage} from '@sendbird/chat/message';

const cacheRestrictCodes = [400300, 400301, 400302, 400310];
export function isCacheRestrictedError(error: unknown) {
  return error instanceof SendbirdError && cacheRestrictCodes.some(code => error.code === code);
}

export function initializeSDK(appId: string, logLevel?: LogLevel, storage?: AsyncStorageStatic) {
  return SendbirdChat.init({
    appId,
    logLevel,
    modules: [new GroupChannelModule(), new OpenChannelModule()],
    useAsyncStorageStore: storage,
    localCacheEnabled: Boolean(storage),
    newInstance: true,
  });
}

export function isSendableMessage(msg: BaseMessage): msg is UserMessage | FileMessage | MultipleFilesMessage {
  return msg.isUserMessage() || msg.isFileMessage() || msg.isMultipleFilesMessage();
}

export function translateToSampleLogLevel(logLevel?: LogLevel) {
  return (
    {
      [LogLevel.VERBOSE]: 'debug',
      [LogLevel.DEBUG]: 'debug',
      [LogLevel.INFO]: 'info',
      [LogLevel.ERROR]: 'error',
      [LogLevel.WARN]: 'warn',
      [LogLevel.NONE]: 'none',
    } as const
  )[logLevel ?? LogLevel.DEBUG];
}

export function setNextLayoutAnimation() {
  LayoutAnimation.configureNext({
    ...LayoutAnimation.Presets.easeInEaseOut,
    duration: 250,
  });
}

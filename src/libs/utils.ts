import {LogLevel, SendbirdError} from '@sendbird/chat';
import {LayoutAnimation} from 'react-native';
import {BaseMessage, FileMessage, MultipleFilesMessage, UserMessage} from '@sendbird/chat/message';

const cacheRestrictCodes = [400300, 400301, 400302, 400310];
export function isCacheRestrictedError(error: unknown) {
  return error instanceof SendbirdError && cacheRestrictCodes.some(code => error.code === code);
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

export function runWithRetry(fn: () => boolean, opts?: {interval?: number; retry?: number}) {
  const options = {
    retry: opts?.retry ?? 8,
    interval: opts?.interval ?? 500,
  };
  const context = {
    tries: 0,
    timer: undefined as undefined | NodeJS.Timeout,
  };

  context.timer = setInterval(() => {
    if (context.tries > options.retry) {
      clearInterval(context.timer);
    }

    const succeeded = fn();
    if (succeeded) {
      clearInterval(context.timer);
    } else {
      context.tries++;
    }
  }, options.interval);
}

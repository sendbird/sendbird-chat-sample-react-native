import {Logger} from '@sendbird/uikit-utils';
import {LogBox, Platform} from 'react-native';

const logger = Logger.create('info');
logger.setTitle(`ChatSample(${Platform.OS}) -`);
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

export {logger};

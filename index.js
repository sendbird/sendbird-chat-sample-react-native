/**
 * @format
 */

import {AppRegistry, Platform, UIManager} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {notificationHandler} from './src/libs/notifications';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

notificationHandler.startOnBackground();
AppRegistry.registerComponent(appName, () => App);

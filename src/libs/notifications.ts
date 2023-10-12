import Notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

import {isSendbirdNotification, parseSendbirdNotification, SendbirdDataPayload} from '@sendbird/uikit-utils';

import {navigationRef, Routes} from './navigation';
import {rootContextRef} from '../contexts/RootContext';
import {runWithRetry} from './utils';
import {ConnectionState} from '@sendbird/chat';

type Unsubscribe = () => void;
type NotificationHandler = (payload: SendbirdDataPayload) => void;
type NotificationHandlers = {
  onAppOpened: NotificationHandler;
  onForeground: NotificationHandler;
  onBackground: NotificationHandler;
};

const ANDROID_NOTIFICATION_CHANNEL_ID = 'default';

class NotificationOpenHandler {
  constructor(public handlers: NotificationHandlers) {
    Notifee.createChannel({
      id: ANDROID_NOTIFICATION_CHANNEL_ID,
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }

  /**
   * It handles the initial notifications. (When the app is launched by tapping the notification)
   * */
  public startOnAppOpened() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.getInitialNotification().then(async notification => {
        const data = notification?.getData();
        if (data?.userInteraction === 1 && isSendbirdNotification(data)) {
          const payload = parseSendbirdNotification(data);
          this.handlers.onAppOpened(payload);
        }
      });
    }

    /**
     * In Android, data-only messages received through Firebase in the background are parsed, and then displayed as local notifications using Notifee.
     * They are also processed through the Notifee background handler, so there is no separate handling of initial notifications.
     * */
    if (Platform.OS === 'android') {
      // NOOP
    }
  }

  /**
   * It handles the pressed notifications while in foreground.
   * */
  public startOnForeground(): Unsubscribe {
    const unsubscribes: Unsubscribe[] = [];

    if (Platform.OS === 'ios') {
      PushNotificationIOS.addEventListener('localNotification', async notification => {
        const data = notification.getData();
        if (data.userInteraction === 1 && isSendbirdNotification(data)) {
          const payload = parseSendbirdNotification(data);
          this.handlers.onForeground(payload);
        }
      });
      unsubscribes.push(() => PushNotificationIOS.removeEventListener('localNotification'));
    }

    if (Platform.OS === 'android') {
      unsubscribes.push(
        Notifee.onForegroundEvent(async ({type, detail}) => {
          // @ts-ignore
          if (type === EventType.PRESS && detail.notification && isSendbirdNotification(detail.notification.data)) {
            const payload = parseSendbirdNotification(detail.notification.data);
            this.handlers.onForeground(payload);
          }
        }),
      );
    }

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * It handles the received, pressed notifications while in background.
   * */
  public startOnBackground() {
    /**
     * Sendbird does not supports "silent notification(data-only message)"
     * Notifications including alerts received in the background, automatically display as notification popups
     *
     * If you want to customize notification data before displaying, please refer below link.
     * @link https://developer.apple.com/documentation/usernotifications/modifying_content_in_newly_delivered_notifications
     *
     * To enable mutable-content, go to the Settings > Chat > Push notification > Push notification credentials on your [dashboard](https://dashboard.sendbird.com/application-id/settings/push-notifications)
     * */
    if (Platform.OS === 'ios') {
      // NOOP
    }

    if (Platform.OS === 'android') {
      Notifee.onBackgroundEvent(async ({type, detail}) => {
        // @ts-ignore
        if (type === EventType.PRESS && detail.notification && isSendbirdNotification(detail.notification.data)) {
          const payload = parseSendbirdNotification(detail.notification.data);
          this.handlers.onBackground(payload);
        }
      });

      /**
       * Display data-only message
       *
       * In Android, "data-only message" received through Firebase in the background are parsed, and then displayed as local notifications using Notifee.
       * They are also processed through the Notifee background handler, so there is no separate handling of initial notifications.
       * */
      messaging().setBackgroundMessageHandler(async (message: FirebaseMessagingTypes.RemoteMessage) => {
        if (isSendbirdNotification(message.data)) {
          const sendbird = parseSendbirdNotification(message.data);
          await Notifee.displayNotification({
            id: String(sendbird.message_id),
            title: `${sendbird.channel.name || sendbird.sender?.name || 'Message received'}`,
            body: sendbird.message,
            data: message.data,
            android: {
              channelId: ANDROID_NOTIFICATION_CHANNEL_ID,
              importance: 4,
              largeIcon: sendbird.sender?.profile_url || sendbird.channel.channel_url,
              circularLargeIcon: true,
              pressAction: {id: 'default'},
              showTimestamp: true,
              timestamp: sendbird.created_at,
            },
          });
        }
      });
    }
  }
}

export const notificationHandler = new NotificationOpenHandler({
  /**
   * Handle the case where the notification popup is tapped while in the "quit state"
   * */
  onAppOpened: async payload => {
    navigateToChannel(payload);
  },
  /**
   * Handle the case where the notification popup is tapped while in the "foreground"
   * */
  onForeground: async payload => {
    navigateToChannel(payload);
  },
  /**
   * Handle the case where the notification popup is tapped while in the "background"
   * */
  onBackground: async payload => {
    navigateToChannel(payload);
  },
});

const navigateToChannel = (payload: SendbirdDataPayload) => {
  runWithRetry(() => {
    if (navigationRef.isReady() && rootContextRef.isReady() && rootContextRef.current?.sdk.connectionState === ConnectionState.OPEN) {
      navigationRef.navigate(Routes.GroupChannel, {channelUrl: payload.channel.channel_url});
      return true;
    }

    return false;
  });
};

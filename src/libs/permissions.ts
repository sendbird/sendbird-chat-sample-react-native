import {PERMISSIONS, Permission, requestMultiple, requestNotifications} from 'react-native-permissions';
import {Platform} from 'react-native';
import {logger} from './logger';

class PermissionHandler {
  get basicPermissions() {
    const permissions: Permission[] = [];

    if (Platform.OS === 'android') {
      permissions.push(PERMISSIONS.ANDROID.CAMERA);

      if (Platform.Version > 32) {
        permissions.push(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO, PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
      } else if (Platform.Version > 28) {
        permissions.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      } else {
        permissions.push(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      }
    }

    if (Platform.OS === 'ios') {
      permissions.push(PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.PHOTO_LIBRARY);
    }

    return permissions;
  }

  async requestPermissions() {
    const results = await requestMultiple(this.basicPermissions);
    logger.log(`basic permission results:\n${JSON.stringify(results, null, 2)}`);

    const result = await requestNotifications([]);
    logger.log(`notification permission result:\n${JSON.stringify(result, null, 2)}`);

    return {
      notification: result.status === 'granted' || result.status === 'limited',
      others: Object.values(results).every(it => it === 'granted' || it === 'limited'),
    };
  }
}

export const permissionHandler = new PermissionHandler();

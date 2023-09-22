import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoredUser {
  userId: string;
  nickname: string;
}

const KEY = 'sample@user';

class AuthHandler {
  storeUser(user: StoredUser) {
    return AsyncStorage.setItem(KEY, JSON.stringify(user));
  }

  clearUser() {
    return AsyncStorage.removeItem(KEY);
  }

  getStoredUser() {
    return AsyncStorage.getItem(KEY).then(response => {
      if (response) {
        return JSON.parse(response) as StoredUser;
      } else {
        return null;
      }
    });
  }
}

export const authHandler = new AuthHandler();

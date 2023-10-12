import {useRootContext} from '../contexts/RootContext';
import {ActivityIndicator, Image, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Button, Text, TextInput, useUIKitTheme} from '@sendbird/uikit-react-native-foundation';
import React, {useEffect, useState} from 'react';
import {isCacheRestrictedError} from '../libs/utils';
import {logger} from '../libs/logger';
import {authHandler} from '../libs/auth';
import {permissionHandler} from '../libs/permissions';
import messaging from '@react-native-firebase/messaging';

const ConnectScreen = () => {
  const {sdk, setUser} = useRootContext();
  const {colors} = useUIKitTheme();

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [state, setState] = useState({
    id: 'ReactNative-' + Platform.OS,
    nickname: 'ReactNative-' + Platform.OS,
    accessToken: '',
  });

  // Connect manually with the given user information
  const onPressConnect = async () => {
    await connect(state.id, state.nickname, state.accessToken);
  };

  // Connect automatically if there is a stored user
  useEffect(() => {
    authHandler.getStoredUser().then(user => {
      if (user) {
        connect(user.userId, user.nickname);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const connect = async (userId: string, nickname: string, token?: string) => {
    logger.log('try connect');
    try {
      setConnecting(true);
      const user = await sdk.connect(userId, token);
      setUser(user);
      logger.log('connected');

      const postConnect: Array<PromiseLike<void>> = [];
      postConnect.push(authHandler.storeUser(user));
      postConnect.push(sdk.updateCurrentUserInfo({nickname}).then(setUser));
      postConnect.push(
        permissionHandler.requestPermissions().then(async ({notification}) => {
          if (notification) {
            if (Platform.OS === 'android') {
              const token = await messaging()
                .getToken()
                .catch(err => {
                  logger.error('messaging().getToken() failed', err);
                  return null;
                });
              if (token) {
                await sdk.registerFCMPushTokenForCurrentUser(token);
                logger.log('fcm token registered', token);
              } else {
                logger.warn('Cannot get fcm token, please check your `android/app/google-services.json`');
              }
            }
            if (Platform.OS === 'ios') {
              const token = await messaging()
                .getAPNSToken()
                .catch(err => {
                  logger.error('messaging().getAPNSToken() failed', err);
                  return null;
                });
              if (token) {
                await sdk.registerAPNSPushTokenForCurrentUser(token);
                logger.log('apns token registered', token);
              } else {
                logger.warn('Cannot get apns token, please check your `ios/GoogleService-Info.plist`');
              }
            }
          }
        }),
      );
      Promise.allSettled(postConnect);
    } catch (e) {
      if (sdk.isCacheEnabled && sdk.currentUser) {
        if (isCacheRestrictedError(e)) {
          logger.log('connect failure and getting cache restricted error, clear cache');
          sdk.clearCachedData();
        } else {
          setUser(sdk.currentUser);
          logger.log('connected with offline mode');
        }
      }
    } finally {
      setConnecting(false);
    }
  };

  if (loading) return <ActivityIndicator style={StyleSheet.absoluteFill} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode={'contain'} />
        <Text style={styles.subtitle}>Powered by React Native</Text>
      </View>

      <Text caption3 color={colors.onBackground02}>
        {'User ID'}
      </Text>
      <TextInput placeholder={'Required'} value={state.id} onChangeText={id => setState(prev => ({...prev, id}))} style={styles.input} />
      <Text caption3 color={colors.onBackground02}>
        {'Nickname'}
      </Text>
      <TextInput
        placeholder={'Optional'}
        value={state.nickname}
        onChangeText={nickname => setState(prev => ({...prev, nickname}))}
        style={styles.input}
      />
      <Text caption3 color={colors.onBackground02}>
        {'Access token'}
      </Text>
      <TextInput
        placeholder={'Optional'}
        value={state.accessToken}
        onChangeText={accessToken => setState(prev => ({...prev, accessToken}))}
        style={styles.input}
      />
      <Button onPress={onPressConnect} disabled={connecting}>
        {connecting ? 'Connecting...' : 'Connect'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  logo: {
    width: 220,
    height: 50,
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
    marginVertical: 4,
  },
  input: {
    marginBottom: 12,
  },
});

export default ConnectScreen;

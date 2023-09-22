# Sendbird React Native Hook + Local caching sample

Sendbird React Native sample using [Sendbird SDK](https://github.com/sendbird/sendbird-chat-sdk-javascript).

## Prerequisite

- [Node](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com//) or [NPM](https://www.npmjs.com/)
- [Cocoapods](https://cocoapods.org/)
- [XCode](https://developer.apple.com/xcode)
- [XCode Command Line Tools](https://reactnative.dev/docs/environment-setup#xcode)
- [Android Studio](https://developer.android.com/studio/) (+Android SDK/Google API)

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Run the sample

1. Install required packages
```bash
yarn install
```

2. (iOS only) Pod install

```bash
cd ios
pod install
pod update
```


3. Start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
yarn start
```

4. Start your Application

```bash
#For Android
yarn android

#For iOS
yarn ios
```

## Troubleshooting

1. General
    - After each of these you might want to rebuild the project and run*
    - You can run `yarn clean` from root directory, this might help to solve some issues and clean old builds
    - Sometimes it is advised to delete yarn.lock, but we do not recommend it for compatibility issues, do it at your own risk
    - Make sure you have prerequisite software installed before your run this app, they can be found here: https://reactnative.dev/docs/environment-setup
    - Sometimes deleting node_modules folder and reinstalling the dependencies again helps
2. iOS
    - Clean the build Cmd+Shift+K, also just rebuilding without cleaning the build can work sometimes
    - Do `pod update` and then `pod install` in the ios/ folder
    - Delete the ios/build folder
    - It is better not to change any build phases, rules, settings in XCode, as it may cause further issues
    - It is better to not update packages in package.json, or ios/Pods, or Android packages versions
        - Or do it very carefully
    - If you have an issue/error try to Google that and follow the instructions
3. Android
    - If you run on real device, check if everything installed and especially Android studio
    - Check if your device is visible by `adb devices`, sometimes it may not work or have lags. In this case call: `adb kill-server` and `adb start-server`
    - You might build the project using `npx react-native run-android`, but if it fails you might need to run it with Android studio
    - If you can't load bundle from 8081 port, run `adb reverse tcp:8081 tcp:8081` and restart app.

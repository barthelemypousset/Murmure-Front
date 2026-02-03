import { registerRootComponent } from 'expo';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

import App from './App';

const AppWrapper = () => {
  return (
    <View style={styles.container}>
      <View style={styles.appContainer}>
        <App />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222', // This will be the color of the letterbox
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    ...(Platform.OS === 'web'
      ? {
          flex: 'none', // Disable flex behavior for the web container
          width: 375, //IphoneSE-W
          height: 812, //IphoneSE-H
        }
      : {}),
  },
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(AppWrapper);

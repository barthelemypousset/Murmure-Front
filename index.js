import { registerRootComponent } from 'expo';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { DimensionsContext } from './contexts/DimensionsContext';

import App from './App';

const webDimension = { width: 375, height: 812 };

const AppContainer = () => {
  // Get the real window dimensions
  const { width, height } = useWindowDimensions();

  // Determine the dimensions for our app.
  // On web, it's our fixed size. On native, it's the real screen size.
  const appDimensions = Platform.select({
    web: webDimension,
    default: { width, height },
  });

  return (
    // This outer View handles the centering and background color
    <View style={styles.container}>
      {/* This inner View is the visual "phone" container */}
      <View style={styles.appContainer}>
        {/* We provide our calculated dimensions to all children of App */}
        <DimensionsContext.Provider value={appDimensions}>
          <App />
        </DimensionsContext.Provider>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    backgroundColor: 'white',
    // On native, it should fill the screen
    width: '100%',
    height: '100%',
    // On web, it uses the fixed dimensions
    ...(Platform.OS === 'web'
      ? {
          width: webDimension.width,
          height: webDimension.height,
          overflow: 'hidden', // Prevents content from spilling out
        }
      : {}),
  },
});

registerRootComponent(AppContainer);

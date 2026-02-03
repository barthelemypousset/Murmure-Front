import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';

const PulsingButton = ({ onPress, color, style, buttonScale = 1 }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();
  }, [animation]);

  const scaleAnim = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const opacityAnim = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const rippleColor = color || '#FF5722';

  return (
    <View
      style={[
        styles.buttonWrapper,
        style,
        {
          width: 70 * buttonScale,
          height: 70 * buttonScale,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.pulseRing,
          {
            backgroundColor: rippleColor,
            width: 70 * buttonScale,
            height: 70 * buttonScale,
            borderRadius: 35 * buttonScale,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.buttonCenter,
          {
            backgroundColor: 'transparent',
            width: 80 * buttonScale,
            height: 80 * buttonScale,
            borderRadius: 80 * buttonScale,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    buttonWrapper: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      },
    
      pulseRing: {
        position: 'absolute',
      },
    
      buttonCenter: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // Ombre pour Android
      },
});

export default PulsingButton;

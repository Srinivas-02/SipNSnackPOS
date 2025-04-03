import React, { useEffect } from 'react';
import { StyleSheet, View, Animated, Easing, useWindowDimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../common/NavigationStack';

const Logo = require('../assets/Logo.png');

const LogoSplash = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animations
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);
  const translateYAnim = new Animated.Value(0);

  useEffect(() => {
    // Initial pause before animation starts
    const initialDelay = 300;

    // Sequence of animations
    Animated.sequence([
      // Wait for initial delay
      Animated.delay(initialDelay),

      // First phase: Scale up and fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // Second phase: Small bounce effect
      Animated.spring(translateYAnim, {
        toValue: -20,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),

      // Third phase: Settle back
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to Login screen after animation
    const navigationTimeout = setTimeout(() => {
      navigation.replace('Login');
    }, 2800); // Increased duration to accommodate new animations

    return () => clearTimeout(navigationTimeout);
  });

  const logoSize = Math.min(screenWidth * 0.4, screenHeight * 0.4);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={Logo}
        style={[
          styles.logo,
          {
            width: logoSize,
            height: logoSize,
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Add background color for smoother transition
  },
  logo: {
    aspectRatio: 1,
  },
});

export default LogoSplash;

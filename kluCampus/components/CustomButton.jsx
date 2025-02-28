import { StyleSheet, TouchableWithoutFeedback, useWindowDimensions, Image } from 'react-native';
import React from 'react';
import Animated, { interpolateColor, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const CustomButton = ({ handlePress, buttonVal, isLastScreen }) => {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  const animatedColor = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      buttonVal.value,
      [0, SCREEN_HEIGHT, 2 * SCREEN_HEIGHT],
      ['#bfe8f2', '#bfe8f2', '#bfe8f2', '#bfe8f2']
    );

    return {
      backgroundColor: backgroundColor,
    };
  });

  const buttonAnimationStyle = useAnimatedStyle(() => {
    return {
      width: isLastScreen ? withSpring(180) : withSpring(90),
      height: isLastScreen ? withSpring(70) : withSpring(90),
    };
  });

  const arrowAnimationStyle = useAnimatedStyle(() => {
    return {
      width: 40,
      height: 40,
      opacity: isLastScreen ? withTiming(0) : withTiming(1),
      transform: [
        {
          translateX: isLastScreen ? withTiming(100) : withTiming(0),
        },
      ],
    };
  });

  const textAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: isLastScreen ? withTiming(1) : withTiming(0),
      transform: [
        {
          translateX: isLastScreen ? withTiming(0) : withTiming(-100),
        },
      ],
    };
  });

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={[styles.container, animatedColor, buttonAnimationStyle]}>
        {isLastScreen ? (
          <Animated.Text style={[styles.textButton, textAnimationStyle]}>
            Giriş Sayfası
          </Animated.Text>
        ) : (
          <Animated.Image
            source={require('../assets/images/ArrowIcon (1).png')}
            style={arrowAnimationStyle}
            tintColor="black"
          />
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110,
    zIndex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButton: { color: 'black', fontSize: 17, position: 'absolute' },
});

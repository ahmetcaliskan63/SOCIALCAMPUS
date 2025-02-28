  import { StyleSheet, useWindowDimensions } from 'react-native';
  import React from 'react';
  import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
  } from 'react-native-reanimated';

  const Dot = ({ index, buttonVal }) => {
    const { height: SCREEN_HEIGHT } = useWindowDimensions();

    const animatedDotStyle = useAnimatedStyle(() => {
      const widthAnimation = interpolate(
        buttonVal.value,
        [
          (index - 1) * SCREEN_HEIGHT,
          index * SCREEN_HEIGHT,
          (index + 1) * SCREEN_HEIGHT,
        ],
        [10, 30, 10],
        Extrapolation.CLAMP,
      );

      const opacityAnimation = interpolate(
        buttonVal.value,
        [
          (index - 1) * SCREEN_HEIGHT,
          index * SCREEN_HEIGHT,
          (index + 1) * SCREEN_HEIGHT,
        ],
        [0.5, 1, 0.5],
        Extrapolation.CLAMP,
      );
      return {
        width: widthAnimation,
        opacity: opacityAnimation,
      };
    });

    const animatedColor = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        buttonVal.value,
        [0, SCREEN_HEIGHT, 2 * SCREEN_HEIGHT],
        ['#bfe8f2', '#bfe8f2', '#bfe8f2'],
      );

      return {
        backgroundColor: backgroundColor,
      };
    });

    return (
      <Animated.View style={[styles.dots, animatedDotStyle, animatedColor]} />
    );
  };

  export default Dot;

  const styles = StyleSheet.create({
    dots: {
      height: 8,
      marginHorizontal: 5,
      borderRadius: 4,
    },
  });

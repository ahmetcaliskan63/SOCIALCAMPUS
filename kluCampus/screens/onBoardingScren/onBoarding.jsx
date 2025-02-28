import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Pagination from '../../components/Pagination';
import data from '../../data/data';

const OnboardingScreen = ({ onDone }) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animateTransition = (direction) => {
    const duration = Platform.OS === 'ios' ? 500 : 400;
    
    translateX.value = withTiming(direction * -width, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    opacity.value = withTiming(0, {
      duration: duration * 0.75,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    setTimeout(() => {
      setCurrentIndex((prev) => prev + direction);
      translateX.value = direction * width;
      opacity.value = 0;
      
      translateX.value = withSpring(0, {
        damping: Platform.OS === 'ios' ? 20 : 15,
        stiffness: Platform.OS === 'ios' ? 90 : 80,
        mass: 1,
      });
      
      opacity.value = withTiming(1, {
        duration: duration * 0.5,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, duration * 0.75);
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      animateTransition(1);
    } else {
      onDone();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      animateTransition(-1);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
    backfaceVisibility: 'hidden',
  }));

  const currentItem = data[currentIndex] || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a2a6c', '#2a3a7c', '#3a4a8c']}
        style={styles.container}
      >
        <Animated.View 
          style={[animatedStyle, styles.animatedContent]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={currentItem?.image}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <BlurView intensity={30} tint="dark" style={styles.contentContainer}>
            <Text style={styles.title}>{currentItem?.title}</Text>
            <Text style={styles.text}>{currentItem?.text}</Text>
          </BlurView>
        </Animated.View>

        <View style={styles.bottomContainer}>
          <Pagination 
            data={data} 
            currentIndex={currentIndex} 
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleBack}
              disabled={currentIndex === 0}
              style={[
                styles.button,
                styles.backButton,
                currentIndex === 0 && styles.disabledButton,
              ]}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={currentIndex === 0 ? 'rgba(255,255,255,0.2)' : '#fff'} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleNext} 
              style={[
                styles.button, 
                styles.nextButton,
                currentIndex === data.length - 1 && styles.startButton
              ]}
            >
              {currentIndex === data.length - 1 ? (
                <Text style={styles.buttonText}>Başla</Text>
              ) : (
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a2a6c',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  animatedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxHeight: '50%',
    paddingVertical: 20,
  },
  image: {
    width: '80%',
    height: '80%',
    maxWidth: 300,
    maxHeight: 300,
  },
  contentContainer: {
    width: '100%',
    padding: 25,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 28 : 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  text: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 24 : 22,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    letterSpacing: 0.3,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    backgroundColor: '#4ECDC4',
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.4,
  },
  startButton: {
    width: 160,
    borderRadius: 15,
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
  disabledButton: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  },
});

export default OnboardingScreen;
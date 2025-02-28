import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import Kulup from "./screens/Kulup/Kulup";
import Mesaj from "./screens/Mesaj/Mesaj";
import Profil from "./screens/Profil/Profil";
import Satis from "./screens/Satis/Satis";
import YemekListesi from "./screens/YemekListesi/YemekListesi";

const Tab = createBottomTabNavigator();

const CustomIcon = ({ name, color, size, isFocused }) => {
  const animatedStyles = useAnimatedStyle(() => {
    const scale = withTiming(isFocused ? 1.2 : 1, { duration: 200 });
    const backgroundColor = interpolateColor(
      scale,
      [1, 1.2],
      ["rgba(255, 255, 255, 0)", "rgba(78, 205, 196, 0.2)"]
    );

    return {
      transform: [{ scale }],
      backgroundColor,
    };
  });

  return (
    <Animated.View style={[styles.iconContainer, animatedStyles]}>
      <LinearGradient
        colors={isFocused ? ["#4ECDC4", "#4ECDC4"] : ["#8E8E93", "#A9A9A9"]}
        style={styles.iconBackground}
      >
        <Icon
          name={name}
          color={isFocused ? "#FFFFFF" : "#F0F0F0"}
          size={size}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.8)", "rgba(0,0,0,0.7)"]}
        style={styles.tabBar}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const animatedStyles = useAnimatedStyle(() => {
            return {
              transform: [
                {
                  translateY: withTiming(isFocused ? -20 : 0, {
                    duration: 200,
                  }),
                },
              ],
            };
          });

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Animated.View style={[styles.tabItemContent, animatedStyles]}>
                <CustomIcon
                  name={
                    options.tabBarIcon({
                      focused: isFocused,
                      color: "",
                      size: 24,
                    }).props.name
                  }
                  color={isFocused ? "#4ECDC4" : "#8E8E93"}
                  size={24}
                  isFocused={isFocused}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

export default function Navigator() {
  return (
    <Tab.Navigator
      initialRouteName="YemekListesi"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 160 : 60,
          backgroundColor: Platform.OS === "ios" ? "#000" : "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          zIndex: 9999,
          paddingTop: Platform.OS === "ios" ? 25 : 5,
          paddingBottom: Platform.OS === "ios" ? 35 : 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={
              Platform.OS === "ios"
                ? ["#000", "#000", "#000"]
                : ["rgba(0,0,0,0.9)", "rgba(0,0,0,0.8)", "rgba(0,0,0,0.7)"]
            }
            style={{
              flex: 1,
              height: Platform.OS === "ios" ? 160 : "100%",
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Satis"
        component={Satis}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="sale" color={color} size={size} />
          ),
          tabBarLabel: null,
        }}
      />
      <Tab.Screen
        name="Kulup"
        component={Kulup}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" color={color} size={size} />
          ),
          tabBarLabel: null,
        }}
      />
      <Tab.Screen
        name="YemekListesi"
        component={YemekListesi}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Icon name="food-fork-drink" size={size} color={color} />
          ),
          tabBarLabel: null,
        }}
      />
      <Tab.Screen
        name="Mesaj"
        component={Mesaj}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Icon size={size} color={color} name="message" />
          ),
          tabBarLabel: null,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={Profil}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Icon size={size} color={color} name="account" />
          ),
          tabBarLabel: null,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === "ios" ? "#000" : "transparent",
    zIndex: 99999,
    elevation: Platform.OS === "android" ? 0 : 24,
    height: Platform.OS === "ios" ? 160 : 60,
  },
  tabBar: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 160 : 60,
    paddingBottom: Platform.OS === "ios" ? 35 : 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    paddingTop: Platform.OS === "ios" ? 25 : 5,
  },
  tabItemContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: Platform.OS === "ios" ? 55 : 15,
    zIndex: 1000,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  iconBackground: {
    borderRadius: 12,
    padding: 6,
  },
});

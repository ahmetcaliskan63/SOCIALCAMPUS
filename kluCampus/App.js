import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navigator from "./Navigator";
import OnboardingScreens from "./screens/onBoardingScren/onBoarding";
import LoginScreen from "./screens/LoginScreen/LoginScren";
import { Alert } from "react-native";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const [hasLaunched, userLoggedIn] = await Promise.all([
        AsyncStorage.getItem("hasLaunched"),
        AsyncStorage.getItem("userLoggedIn"),
      ]);

      if (hasLaunched === "true") {
        setShowOnboarding(false);
      }

      if (userLoggedIn === "true") {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error checking first time:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem("hasLaunched", "true");
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const handleLogin = async () => {
    console.log("handleLogin çağrıldı - başlangıç");
    try {
      // Önce state'i güncelle
      await new Promise((resolve) => {
        setIsLoggedIn(true);
        resolve();
      });

      console.log("Login durumu güncellendi - isLoggedIn:", true);
    } catch (error) {
      console.error("Login hatası:", error);
      setIsLoggedIn(false);
      Alert.alert("Hata", "Giriş yapılırken bir hata oluştu");
    }
    console.log("handleLogin tamamlandı");
  };

  const clearOldCache = async () => {
    try {
      const lastCleanup = await AsyncStorage.getItem("last_cache_cleanup");
      const now = Date.now();

      // Cache temizliğini 3 günde bir yap (24 saatten 72 saate çıkarıldı)
      if (!lastCleanup || now - parseInt(lastCleanup) > 72 * 60 * 60 * 1000) {
        await AsyncStorage.setItem("last_cache_cleanup", now.toString());
        // Eski cache'leri temizle
        const keys = ["cached_meals", "cached_messages", "cached_books"];
        for (const key of keys) {
          const lastUpdate = await AsyncStorage.getItem(`${key}_last_update`);
          // 3 günden eski cache'leri temizle
          if (lastUpdate && now - parseInt(lastUpdate) > 72 * 60 * 60 * 1000) {
            await AsyncStorage.removeItem(key);
            await AsyncStorage.removeItem(`${key}_last_update`);
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning cache:", error);
    }
  };

  useEffect(() => {
    clearOldCache();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {showOnboarding ? (
        <OnboardingScreens onDone={handleDone} />
      ) : !isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Navigator />
      )}
    </NavigationContainer>
  );
}

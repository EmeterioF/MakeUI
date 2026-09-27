import { useCallback, useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AnimatedSplash from "@/components/splash/AnimatedSplash";

void SplashScreen.preventAutoHideAsync().catch(() => {});

// Failsafe: never trap the user behind the splash, even if the
// intro animation errors before reporting completion.
const SPLASH_FAILSAFE_MS = 8000;

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const doneRef = useRef(false);

  const handleSplashDone = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      await SplashScreen.hideAsync();
    } catch {
      // Native splash may already be hidden; never block app entry.
    } finally {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void handleSplashDone();
    }, SPLASH_FAILSAFE_MS);
    return () => clearTimeout(id);
  }, [handleSplashDone]);

  return(
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar hidden={true} />
          <Stack screenOptions={{ headerShown: false,  }}/>
          {showSplash && <AnimatedSplash onDone={handleSplashDone} />}
        </SafeAreaView>
      </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

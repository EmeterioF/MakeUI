import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AnimatedSplash from "@/components/splash/AnimatedSplash";

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashDone = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch {
      // Native splash may already be hidden; never block app entry.
    } finally {
      setShowSplash(false);
    }
  }, []);

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

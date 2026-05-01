import { Stack } from "expo-router";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return(
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar hidden={true} />
          <Stack screenOptions={{ headerShown: false,  }}/>
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

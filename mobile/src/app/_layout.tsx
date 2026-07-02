import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="create-course" />
        <Stack.Screen name="admin-login" />
        <Stack.Screen name="parent-dashboard" />
        <Stack.Screen name="admin-dashboard" />
      </Stack>
    </ThemeProvider>
  );
}

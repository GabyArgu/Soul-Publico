// app/_layout.tsx
import { Stack } from "expo-router";
import { RootSiblingParent } from "react-native-root-siblings";

export default function Layout() {
  return (
    <RootSiblingParent>
      <Stack initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" />
        <Stack.Screen name="(auth)/LoginScreen" />
        <Stack.Screen name="(auth)/Crear" />
      </Stack>
    </RootSiblingParent>
  );
}
import { Stack } from "expo-router";
import { RootSiblingParent } from "react-native-root-siblings";
import { UserCreationProvider } from "./context/UserCreationContext";

export default function Layout() {
  return (
    <RootSiblingParent>
      <UserCreationProvider>
        <Stack
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: "fade", 
          }}
        >
          <Stack.Screen name="Splash" />
          <Stack.Screen name="(auth)/LoginScreen" />
          <Stack.Screen name="(auth)/Crear" />
        </Stack>
      </UserCreationProvider>
    </RootSiblingParent>
  );
}

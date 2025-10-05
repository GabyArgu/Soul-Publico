import { Stack } from "expo-router";
import { RootSiblingParent } from "react-native-root-siblings";
import { PaperProvider, configureFonts, MD3LightTheme } from "react-native-paper";
import { UserCreationProvider } from "./context/UserCreationContext";

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2666DE',
    secondary: '#F9DC50',
    error: '#E53935',
    background: '#F2F6FC',
  },
  fonts: configureFonts({
    config: { fontFamily: 'Inter-Regular' },
  }),
};

export default function Layout() {
  return (
    <RootSiblingParent>
      <PaperProvider theme={customTheme}>
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
            <Stack.Screen name="(auth)/Crear2" />
            <Stack.Screen name="(auth)/Crear3" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </UserCreationProvider>
      </PaperProvider>
    </RootSiblingParent>
  );
}

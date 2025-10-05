import { Stack } from "expo-router";
import { configureFonts, MD3LightTheme, PaperProvider } from "react-native-paper";
import { RootSiblingParent } from "react-native-root-siblings";
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
            initialRouteName="index"
            screenOptions={{
              headerShown: false,
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" />
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

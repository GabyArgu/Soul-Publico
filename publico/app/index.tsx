// app/index.tsx
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef } from "react";
import { Animated, AppState, ImageBackground, StyleSheet, View } from "react-native";

export default function index() {
    const router = useRouter();
    const fade1 = useRef(new Animated.Value(1)).current;
    const fade2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Detectar cierre/app en background → eliminar sesión
        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "inactive" || state === "background") {
                SecureStore.deleteItemAsync("userToken");
            }
        });

        const checkLogin = async () => {
            const token = await SecureStore.getItemAsync("userToken");

            Animated.sequence([
                Animated.delay(1200),
                Animated.parallel([
                    Animated.timing(fade1, { toValue: 0, duration: 600, useNativeDriver: true }),
                    Animated.timing(fade2, { toValue: 1, duration: 600, useNativeDriver: true }),
                ]),
                Animated.delay(1200),
                Animated.timing(fade2, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]).start(() => {
                if (token) {
                    router.replace("/(tabs)");
                } else {
                    router.replace("/(auth)/LoginScreen");
                }
            });
        };

        checkLogin();
        return () => subscription.remove();
    }, []);

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../assets/images/fondo.png")}
                style={styles.background}
                resizeMode="cover"
            />

            <Animated.View style={[styles.background, { position: "absolute", opacity: fade1 }]}>
                <ImageBackground
                    source={require("../assets/images/splash1.png")}
                    style={styles.background}
                    resizeMode="cover"
                />
            </Animated.View>

            <Animated.View style={[styles.background, { position: "absolute", opacity: fade2 }]}>
                <ImageBackground
                    source={require("../assets/images/splash2.png")}
                    style={styles.background}
                    resizeMode="cover"
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { flex: 1, width: "100%", height: "100%" },
});

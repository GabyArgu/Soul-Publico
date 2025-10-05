// app/SplashH.tsx
import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ImageBackground } from "react-native";
import { useRouter } from "expo-router";

export default function Splash4() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start(() => {
                router.replace("/(auth)/LoginScreen"); 
            });
        }, 2000); // 2 segundos visible

        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <ImageBackground
                source={require("../assets/images/splash3.png")} 
                style={styles.background}
                resizeMode="cover"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
});

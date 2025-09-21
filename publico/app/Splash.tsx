import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ImageBackground } from "react-native";
import { useRouter } from "expo-router";

export default function Splash() {
    const router = useRouter();
    const fadeSplash1 = useRef(new Animated.Value(1)).current;
    const fadeSplash2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Mantener Splash 1 visible un momento
        const timeout1 = setTimeout(() => {
            //Crossfade: Splash 1 se difumina mientras Splash 2 aparece
            Animated.parallel([
                Animated.timing(fadeSplash1, {
                    toValue: 0,
                    duration: 600, 
                    useNativeDriver: true,
                }),
                Animated.timing(fadeSplash2, {
                    toValue: 1,
                    duration: 600, 
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Mantener Splash 2 un momento antes de difuminar todo
                const timeout2 = setTimeout(() => {
                    Animated.timing(fadeSplash2, {
                        toValue: 0,
                        duration: 600, 
                        useNativeDriver: true,
                    }).start(() => {
                        router.replace("/(auth)/LoginScreen"); 
                    });
                }, 1200);

                return () => clearTimeout(timeout2);
            });
        }, 1200);

        return () => clearTimeout(timeout1);
    }, []);

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../assets/images/fondo.png")}
                style={styles.background}
                resizeMode="cover"
            />

            <Animated.View style={[styles.background, { position: "absolute", opacity: fadeSplash1 }]}>
                <ImageBackground
                    source={require("../assets/images/splash1.png")}
                    style={styles.background}
                    resizeMode="cover"
                />
            </Animated.View>

            <Animated.View style={[styles.background, { position: "absolute", opacity: fadeSplash2 }]}>
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

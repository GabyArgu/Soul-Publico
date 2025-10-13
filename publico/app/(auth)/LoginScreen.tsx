import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { AppState, ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from "react-native-root-toast";

export default function Login() {
    const router = useRouter();
    const [carnet, setCarnet] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Nuevo estado para mostrar/ocultar contraseña
    const API_URL = "https://c545b1fef4d5.ngrok-free.app/api/auth";

    // Detectar cierre de app / background → eliminar sesión
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "inactive" || state === "background") {
                SecureStore.deleteItemAsync("userData");
            }
        });
        return () => subscription.remove();
    }, []);

    const validarCarnet = (text: string) => {
        if (/^[A-Za-z]{0,2}[0-9]{0,6}$/.test(text)) {
            setCarnet(text.toUpperCase());
        }
    };

    // Función para alternar entre mostrar y ocultar contraseña
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const showToast = (message: string, success: boolean = false) => {
        Toast.show(message, {
            duration: 3000,
            position: Toast.positions.TOP,
            shadow: true,
            animation: true,
            hideOnPress: true,
            backgroundColor: success ? "#4CAF50" : "#E53935",
            textColor: "#fff",
            opacity: 0.95,
            containerStyle: { borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, marginTop: 60, alignSelf: "center" },
            textStyle: { fontFamily: "Inter-Medium", fontSize: 14 },
        });
    };

    const handleLogin = async () => {
        if (!carnet || !password) {
            showToast("⚠️ Completa carnet y contraseña");
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/login`, { carnet, password });
            showToast("¡Login exitoso!", true);

            const fullName = res.data.user.nombreCompleto;
            const genero = res.data.user.genero || "O";
            const userCarnet = res.data.user.carnet;
            const id = res.data.user.id;
            const email = res.data.user.email;
            const urlCv = res.data.user.urlCv;

            console.log("Datos del usuario:", fullName, genero, userCarnet, id, email, urlCv);

            // Guardar en SecureStore para mantener sesión segura
            await SecureStore.setItemAsync('userData', JSON.stringify({
                carnet: userCarnet,
                nombreCompleto: fullName,
                genero: genero,
                id: id,
                email: email,
                urlCv: urlCv

            }));

            // Lógica de displayName
            const nameParts = fullName.split(" ");
            const displayName = nameParts.length >= 3 ? `${nameParts[0]} ${nameParts[2]}` : nameParts[0];

            // Navegar a Tabs
            router.replace({
                pathname: "/(tabs)",
                params: {
                    nombreUsuario: displayName,
                    generoUsuario: genero,
                }
            });

        } catch (err: any) {
            console.error("Error login:", err.response?.data || err.message || err);
            showToast("❌ Carnet o contraseña incorrectos");
        }
    };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={Platform.select({ ios: 0, android: 20 })}
            enableOnAndroid={true}
        >
            <ImageBackground source={require('../../assets/images/fondo-l.png')} style={styles.background} resizeMode="cover">
                <View style={styles.container}>
                    <View style={styles.formContainer}>
                        <TextInput
                            style={[styles.input, styles.inputCarnet]}
                            placeholder="Ingresa tu carnet"
                            placeholderTextColor="#666"
                            value={carnet}
                            onChangeText={validarCarnet}
                            keyboardType="default"
                        />
                        
                        {/* Input de contraseña con icono de ojito */}
                        <View style={[styles.input, styles.inputPassword, styles.passwordContainer]}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Ingresa tu contraseña"
                                placeholderTextColor="#666"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity 
                                onPress={toggleShowPassword} 
                                style={styles.eyeIcon}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye" : "eye-off"} 
                                    size={22} 
                                    color="#1942BF" 
                                />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                            <Text style={styles.loginButtonText}>Ingresar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/(auth)/Crear')}>
                            <Text style={styles.registerButtonText}>Registrarme</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    background: { flex: 1, width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    container: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 45 },
    formContainer: { width: 300, borderRadius: 15, padding: 8, backgroundColor: 'transparent' },
    input: { 
        backgroundColor: '#EFF1F8', 
        borderRadius: 12, 
        padding: 15, 
        marginBottom: 20, 
        fontSize: 16, 
        fontFamily: 'Inter-Bold',
        fontWeight: "bold" 
    },
    inputCarnet: { 
        borderLeftWidth: 15, 
        borderLeftColor: '#F9DC50' 
    },
    inputPassword: { 
        borderLeftWidth: 15, 
        borderLeftColor: '#2666DE', 
        color: 'black',
        paddingRight: 50, // Espacio para el icono
    },
    // Nuevos estilos para el contenedor de contraseña
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        fontWeight: "bold",
        color: 'black',
        paddingRight: 10,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        padding: 4,
    },
    loginButton: { 
        backgroundColor: '#2666DE', 
        borderRadius: 25, 
        paddingVertical: 16, 
        alignItems: 'center', 
        marginBottom: 12 
    },
    loginButtonText: { 
        color: 'white', 
        fontSize: 16, 
        fontFamily: 'Inter-Bold',
        fontWeight: "bold" 
    },
    registerButton: { 
        padding: 12, 
        alignItems: 'center' 
    },
    registerButtonText: { 
        color: '#1942BF', 
        fontSize: 16, 
        fontFamily: 'Inter-Bold',
        fontWeight: "bold"
    },
});
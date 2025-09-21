// app/(auth)/LoginScreen.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Login() {
    const router = useRouter();
    const [carnet, setCarnet] = useState("");
    const [password, setPassword] = useState("");

    const validarCarnet = (text: string) => {
        if (/^[A-Z]{0,2}[0-9]{0,6}$/.test(text)) {
            setCarnet(text);
        }
    };
    
    return (
        <ImageBackground
            source={require('../../assets/images/fondo-l.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <View style={styles.formContainer}>

                    {/* Carnet */}
                    <TextInput
                        style={[styles.input, styles.inputCarnet]}
                        placeholder="Ingresa tu carnet"
                        placeholderTextColor="#666"
                        value={carnet}
                        onChangeText={validarCarnet}
                        keyboardType="numeric"
                    />

                    {/* Contraseña */}
                    <TextInput
                        style={[styles.input, styles.inputPassword]}
                        placeholder="Ingresa tu contraseña"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {/* Olvidaste contraseña */}
                    <TouchableOpacity>
                        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    {/* Botón Ingresar */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/(tabs)')}
                    >
                        <Text style={styles.loginButtonText}>Ingresar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push('/(auth)/Crear')}
                    >
                        <Text style={styles.registerButtonText}>Registrarme</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 45,
    },
    formContainer: {
        width: '85%',
        borderRadius: 15,
        padding: 8,
        elevation: 0,
        shadowColor: 'transparent',
        backgroundColor: 'transparent',
    },

    /** INPUTS **/
    input: {
        backgroundColor: '#EFF1F8',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
    inputCarnet: {
        borderLeftWidth: 15,
        borderLeftColor: '#F9DC50',
    },
    inputPassword: {
        borderLeftWidth: 15,
        borderLeftColor: '#2666DE',
    },

    /** OLVIDASTE CONTRASEÑA **/
    forgotPassword: {
        textAlign: 'right',
        color: '#1942BF',
        marginBottom: 20,
        fontFamily: 'Inter-Bold',
    },

    separator: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 15,
    },

    /** BOTÓN INGRESAR **/
    loginButton: {
        backgroundColor: '#2666DE',
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },

    /** BOTÓN REGISTRAR **/
    registerButton: {
        padding: 12,
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#1942BF',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
});

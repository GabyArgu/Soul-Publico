// app/(auth)/Crear2.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";

export default function Crear2() {
    const router = useRouter();

    // Estados
    const [carrera, setCarrera] = useState("");
    const [unidades, setUnidades] = useState("");
    const [idioma, setIdioma] = useState("");
    const [nivel, setNivel] = useState("");
    const [habilidadesTecnicas, setHabilidadesTecnicas] = useState("");
    const [habilidadesBlandas, setHabilidadesBlandas] = useState("");

    // Validaciones
    const validarUnidades = (text: string) => {
        if (/^\d{0,2}$/.test(text)) {
            setUnidades(text);
        }
    };

    const formularioValido = () => {
        return (
            carrera &&
            unidades &&
            idioma &&
            nivel &&
            habilidadesTecnicas &&
            habilidadesBlandas
        );
    };

    // Toast personalizado
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
            containerStyle: {
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 10,
                marginTop: 60,
                alignSelf: "center",
            },
            textStyle: {
                fontFamily: "Inter-Medium",
                fontSize: 14,
            },
        });
    };

    const handleSubmit = () => {
        if (!formularioValido()) {
            showToast("⚠️ Completa todos los campos ");
            return;
        }
        router.push("/(auth)/Crear3");
    };

    return (
        <ImageBackground
            source={require("../../assets/images/fondo-c.png")}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Datos Académicos</Text>

                    {/* Carrera */}
                    <View style={styles.inputContainer}>
                        <Picker
                            selectedValue={carrera}
                            onValueChange={(value) => setCarrera(value)}
                            style={styles.picker}
                            dropdownIconColor="#213A8E"
                        >
                            <Picker.Item label="Selecciona tu carrera" value="" />
                            <Picker.Item label="Ingeniería" value="Ingenieria" />
                            <Picker.Item label="Arquitectura" value="Arquitectura" />
                        </Picker>
                    </View>

                    {/* Unidades valorativas */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="UV'S ganadas"
                            placeholderTextColor="#666"
                            value={unidades}
                            onChangeText={validarUnidades}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Idioma de dominio */}
                    <View style={styles.inputContainer}>
                        <Picker
                            selectedValue={idioma}
                            onValueChange={(value) => setIdioma(value)}
                            style={styles.picker}
                            dropdownIconColor="#213A8E"
                        >
                            <Picker.Item label="Idioma que dominas" value="" />
                            <Picker.Item label="Inglés" value="Ingles" />
                            <Picker.Item label="Francés" value="Frances" />
                            <Picker.Item label="Otro" value="Otro" />
                        </Picker>
                    </View>

                    {/* Nivel de dominio */}
                    <View style={styles.inputContainer}>
                        <Picker
                            selectedValue={nivel}
                            onValueChange={(value) => setNivel(value)}
                            style={styles.picker}
                            dropdownIconColor="#213A8E"
                        >
                            <Picker.Item label="Nivel de dominio" value="" />
                            <Picker.Item label="Básico" value="Basico" />
                            <Picker.Item label="Intermedio" value="Intermedio" />
                            <Picker.Item label="Avanzado" value="Avanzado" />
                        </Picker>
                    </View>

                    {/* Habilidades técnicas */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Habilidades técnicas"
                            placeholderTextColor="#666"
                            value={habilidadesTecnicas}
                            onChangeText={setHabilidadesTecnicas}
                        />
                    </View>

                    {/* Habilidades blandas */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Habilidades blandas"
                            placeholderTextColor="#666"
                            value={habilidadesBlandas}
                            onChangeText={setHabilidadesBlandas}
                        />
                    </View>

                    {/* Botones */}
                    <View style={styles.buttonsRow}>
                        <TouchableOpacity style={styles.buttonYellow} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonBlue} onPress={handleSubmit}>
                            <Ionicons name="arrow-forward" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 220,
    },
    formContainer: {
        width: "85%",
        borderRadius: 15,
        padding: 8,
        backgroundColor: "transparent",
    },
    title: {
        fontSize: 23,
        fontWeight: "bold",
        color: "#213A8E",
        marginBottom: 18,
        fontFamily: "Inter-Bold",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF1F8",
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 15,
        borderLeftWidth: 15,
        borderLeftColor: "#2666DE",
        height: 52,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Inter-Medium",
        color: "#000",
    },
    picker: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Inter-Medium",
        color: "#000",
        height: 52,
    },
    iconCalendar: {
        marginRight: 10,
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
    buttonYellow: {
        backgroundColor: "#2666DE",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonBlue: {
        backgroundColor: "#F9DC50",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
});
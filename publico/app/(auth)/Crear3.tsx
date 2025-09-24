import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import * as DocumentPicker from "expo-document-picker";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from "axios";

export default function Crear3() {
    const router = useRouter();
    const API_URL = "http://192.168.1.11:4000/api";

    // Estados
    const [transportarse, setTransportarse] = useState(false);
    const [horario, setHorario] = useState("");
    const [cv, setCv] = useState(""); // ruta del archivo
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [opcionesDisponibilidad, setOpcionesDisponibilidad] = useState<{ id: number; nombre: string }[]>([]);

    // Cargar datos de la API para la disponibilidad horaria
    useEffect(() => {
        axios.get(`${API_URL}/disponibilidad`)
            .then(res => setOpcionesDisponibilidad(res.data))
            .catch(err => {
                console.error("Error al obtener opciones de disponibilidad:", err);
                showToast("❌ Error al cargar opciones de horario");
            });
    }, []);

    // Función para seleccionar archivo
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({});

            if (!result.canceled) {
                // Accede al primer elemento del array de assets
                const selectedAsset = result.assets[0];
                setCv(selectedAsset.uri);
                showToast("📄 Archivo seleccionado: " + selectedAsset.name, true);
            } else {
                showToast("Selección de archivo cancelada", false);
            }
        } catch (error) {
            showToast("❌ Error al seleccionar archivo");
            console.error("Error al seleccionar documento:", error);
        }
    };

    // Toast
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
        // Validaciones individuales
        if (!horario) {
            showToast("⚠️ Por favor, selecciona tu disponibilidad horaria");
            return;
        }

        if (!cv) {
            showToast("⚠️ Por favor, sube tu CV");
            return;
        }

        if (!password) {
            showToast("⚠️ Por favor, escribe tu contraseña");
            return;
        }

        if (password.length < 6) {
            showToast("⚠️ La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (!confirmPassword) {
            showToast("⚠️ Por favor, confirma tu contraseña");
            return;
        }

        if (password !== confirmPassword) {
            showToast("⚠️ Las contraseñas no coinciden");
            return;
        }

        // Si todas las validaciones pasan
        showToast("✅ Usuario Creado", true);
        router.push("/SplashH");
    };

    return (
        <ImageBackground
            source={require("../../assets/images/fondo-c.png")}
            style={styles.background}
            resizeMode="cover"
        >
            <KeyboardAwareScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} extraScrollHeight={20} enableOnAndroid>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Información Extra</Text>

                    {/* Disponibilidad de transportarse */}
                    <View style={[styles.inputContainer, { justifyContent: "space-between" }]}>
                        <Text style={styles.input}>Puedes transportarte</Text>
                        <Switch
                            value={transportarse}
                            onValueChange={setTransportarse}
                            trackColor={{ false: "#ccc", true: "#2666DE" }}
                            thumbColor={transportarse ? "#fff" : "#fff"}
                        />
                    </View>

                    {/* Disponibilidad horaria */}
                    <View style={styles.inputContainer}>
                        <Picker
                            selectedValue={horario}
                            onValueChange={(value) => setHorario(value)}
                            style={styles.picker}
                            dropdownIconColor="#213A8E"
                        >
                            <Picker.Item label="Disponibilidad horaria" value="" />
                            {opcionesDisponibilidad.map(opcion => (
                                <Picker.Item key={opcion.id} label={opcion.nombre} value={opcion.nombre} />
                            ))}
                        </Picker>
                    </View>

                    {/* Subir CV */}
                    <TouchableOpacity style={styles.inputContainer} onPress={pickDocument}>
                        <Text style={[styles.input, { color: cv ? "#000" : "#666" }]}>
                            {cv ? "Archivo seleccionado" : "Sube tu CV"}
                        </Text>
                        <Ionicons name="cloud-upload-outline" size={22} color="#213A8E" style={styles.iconCalendar}/>
                    </TouchableOpacity>

                    {/* Apartado Seguridad */}
                    <Text style={[styles.title, { marginTop: 10 }]}>Seguridad</Text>

                    {/* Contraseña */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe tu contraseña"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* Confirmar contraseña */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirma tu contraseña"
                            placeholderTextColor="#666"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
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
            </KeyboardAwareScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    scrollContent: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 220,
        paddingBottom: 40,
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
        borderLeftColor: "#F9DC50",
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
    buttonBlue: {
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
});
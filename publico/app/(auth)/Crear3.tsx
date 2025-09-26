import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Switch } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Crear3() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const paso2Data = params.combinedData ? JSON.parse(params.combinedData as string) : {};

    const API_URL = "http://192.168.1.11:4000/api";

    // Estados
    const [transportarse, setTransportarse] = useState(false);
    const [horario, setHorario] = useState<number | "">("");
    const [cv, setCv] = useState<any>(null); // objeto completo del archivo
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [opcionesDisponibilidad, setOpcionesDisponibilidad] = useState<{ idDisponibilidad: number; nombre: string }[]>([]);

    useEffect(() => {
        axios.get(`${API_URL}/disponibilidad`)
            .then(res => setOpcionesDisponibilidad(res.data))
            .catch(() => showToast("❌ Error al cargar opciones de horario"));
    }, []);

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

    // Seleccionar archivo
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
            if (!result.canceled) {
                setCv(result.assets[0]); // guardamos todo el objeto
                showToast("📄 Archivo seleccionado: " + result.assets[0].name, true);
            }
        } catch (error) {
            console.error(error);
            showToast("❌ Error al seleccionar archivo");
        }
    };

    // Subir CV al servidor - VERSIÓN MEJORADA PARA DEBUG
    const uploadCv = async () => {
        if (!cv) throw new Error("No se seleccionó CV");

        console.log("📤 Intentando subir archivo:", cv.name, "URI:", cv.uri);

        const formData = new FormData();
        formData.append("cv", {
            uri: cv.uri,
            name: cv.name || "documento.pdf",
            type: "application/pdf",
        } as any);

        try {
            const res = await axios.post(`${API_URL}/cv`, formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                },
                timeout: 30000, // 30 segundos timeout
            });

            console.log("✅ Respuesta del servidor:", res.data);
            return res.data.url;
        } catch (error: any) {
            console.error("❌ Error en uploadCv:", error.response?.data || error.message);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!cv) return showToast("❌ Debes subir tu CV");
        if (password !== confirmPassword) return showToast("⚠️ Las contraseñas no coinciden");

        try {
            // 1️⃣ Subir CV
            const urlCv = await uploadCv();

            // 2️⃣ Combinar datos con pasos anteriores
            const combinedData = {
                ...paso2Data,
                transportarse,
                idHorario: Number(horario),
                password,
                urlCv,
            };

            console.log("Campos antes de enviar:", combinedData);

            // 3️⃣ Crear usuario en backend
            await axios.post(`${API_URL}/usuarios/crear`, combinedData);

            // Limpiar AsyncStorage si quieres
            await AsyncStorage.removeItem("crearPaso1");
            await AsyncStorage.removeItem("crearPaso2");

            router.push("/SplashH");
        } catch (error) {
            console.error("Error creando usuario:", error);
            showToast("❌ Error creando usuario");
        }
    };

    return (
        <ImageBackground source={require("../../assets/images/fondo-c.png")} style={styles.background} resizeMode="cover">
            <View style={styles.mainContainer}>
                <KeyboardAwareScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} extraHeight={120} enableOnAndroid>
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Información Extra</Text>

                        {/* Transportarse */}
                        <View style={[styles.inputContainer, { justifyContent: "space-between" }]}>
                            <Text style={styles.switchText}>Puedes transportarte</Text>
                            <Switch 
                                value={transportarse} 
                                onValueChange={setTransportarse} 
                                trackColor={{ false: "#ccc", true: "#2666DE" }} 
                                thumbColor="#fff" 
                            />
                        </View>

                        {/* ✅ HORARIO - MISMO DISEÑO CONSISTENTE */}
                        <View style={styles.inputContainer}>
                            <Picker 
                                selectedValue={horario} 
                                onValueChange={setHorario} 
                                style={styles.picker} 
                                dropdownIconColor="#213A8E"
                                mode="dropdown"
                            >
                                <Picker.Item label="Disponibilidad horaria" value="" />
                                {opcionesDisponibilidad.map(opcion => (
                                    <Picker.Item 
                                        key={opcion.idDisponibilidad} 
                                        label={opcion.nombre} 
                                        value={opcion.idDisponibilidad} 
                                    />
                                ))}
                            </Picker>
                        </View>

                        {/* Subir CV */}
                        <TouchableOpacity style={styles.inputContainer} onPress={pickDocument}>
                            <Text style={[styles.input, { color: cv ? "#000" : "#666" }]}>
                                {cv ? cv.name : "Sube tu CV"}
                            </Text>
                            <Ionicons name="cloud-upload-outline" size={22} color="#213A8E" />
                        </TouchableOpacity>

                        {/* Contraseña */}
                        <Text style={[styles.title, { marginTop: 10 }]}>Seguridad</Text>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                placeholder="Escribe tu contraseña" 
                                placeholderTextColor="#666" 
                                style={styles.input} 
                                value={password} 
                                onChangeText={setPassword} 
                                secureTextEntry 
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                placeholder="Confirma tu contraseña" 
                                placeholderTextColor="#666" 
                                style={styles.input} 
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
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: "100%", height: "100%" },
    mainContainer: { flex: 1, marginTop: 220 },
    scrollContent: { flex: 1 },
    scrollContainer: { alignItems: "center", paddingBottom: 40 },
    formContainer: { width: "85%", borderRadius: 15, padding: 8, backgroundColor: "transparent" },
    title: { fontSize: 23, fontWeight: "bold", color: "#213A8E", marginBottom: 18, fontFamily: "Inter-Bold" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF1F8", borderRadius: 12, paddingHorizontal: 10, marginBottom: 15, borderLeftWidth: 15, borderLeftColor: "#2666DE", height: 52 },
    input: { flex: 1, fontSize: 15, fontFamily: "Inter-Medium", color: "#000" },
    
    switchText: {
        fontSize: 15,
        fontFamily: "Inter-Medium",
        color: "#000",
        flex: 1,
    },
    
    // ✅ PICKER CON EL MISMO ESTILO CONSISTENTE
    picker: { 
        flex: 1, 
        fontSize: 15, 
        fontFamily: "Inter-Medium", 
        color: "#000", 
        height: 52,
        minHeight: 52,
        includeFontPadding: false,
        textAlignVertical: 'center',
        marginVertical: 0,
        paddingVertical: 0,
    },
    
    buttonsRow: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        marginTop: 15 
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
        elevation: 5 
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
        elevation: 5 
    },
});
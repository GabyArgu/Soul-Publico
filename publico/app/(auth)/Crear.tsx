import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from "react-native-root-toast";

export default function Crear() {
    const router = useRouter();
    const API_URL = "https://888f4c9ee1eb.ngrok-free.app/api";

    // Estados del formulario
    const [nombre, setNombre] = useState("");
    const [carnet, setCarnet] = useState("");
    const [genero, setGenero] = useState<"M" | "F" | "O" | "">(""); // ✅ NUEVO ESTADO
    const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");

    // Catálogos
    const [departamentos, setDepartamentos] = useState<{ idDepartamento: number, nombre: string }[]>([]);
    const [municipios, setMunicipios] = useState<{ idMunicipio: number, nombre: string }[]>([]);
    const [departamento, setDepartamento] = useState<number | "">("");
    const [municipio, setMunicipio] = useState<number | "">("");

    // Obtener departamentos y carreras al cargar
    useEffect(() => {
        axios.get(`${API_URL}/departamentos`)
            .then(res => setDepartamentos(res.data))
            .catch(err => console.error(err));
    }, []);

    // Actualizar municipios cuando cambia el departamento
    useEffect(() => {
        if (!departamento) { setMunicipios([]); setMunicipio(""); return; }
        axios.get(`${API_URL}/municipios/${departamento}`)
            .then(res => setMunicipios(res.data))
            .catch(err => console.error(err));
    }, [departamento]);

    // Validaciones individuales
    const validarNombre = (text: string) => { if (/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/.test(text)) setNombre(text); };
    const validarCarnet = (text: string) => { if (/^[A-Z]{0,2}[0-9]{0,6}$/.test(text)) setCarnet(text.toUpperCase()); };
    const validarTelefono = (text: string) => { if (/^\d{0,4}-?\d{0,4}$/.test(text)) setTelefono(text.length === 4 && !text.includes("-") ? text + "-" : text); };

    // Mostrar toast personalizado
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

    // Validar formulario con retroalimentación específica
    const handleSubmit = async () => {
        if (!nombre.trim()) { showToast("⚠️ El nombre es obligatorio"); return; }
        if (!/^[A-Z]{2}[0-9]{6}$/.test(carnet)) { showToast("⚠️ El carnet debe tener 2 letras y 6 números"); return; }
        if (!genero) { showToast("⚠️ Selecciona tu género"); return; } // ✅ NUEVA VALIDACIÓN
        if (!fechaNacimiento) { showToast("⚠️ Selecciona una fecha de nacimiento"); return; }
        if (fechaNacimiento >= new Date()) { showToast("⚠️ La fecha de nacimiento debe ser menor a hoy"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast("⚠️ Ingresa un correo válido"); return; }
        if (!departamento) { showToast("⚠️ Selecciona un departamento"); return; }
        if (!municipio) { showToast("⚠️ Selecciona un municipio"); return; }
        if (!/^\d{4}-\d{4}$/.test(telefono)) { showToast("⚠️ Ingresa un teléfono válido (XXXX-XXXX)"); return; }

        try {
            const paso1Data = {
                nombre,
                carnet,
                genero, // ✅ AÑADIR GÉNERO
                fechaNacimiento: fechaNacimiento.toISOString(),
                email,
                telefono,
                departamento: Number(departamento),
                municipio: Number(municipio)
            };

            await AsyncStorage.setItem("crearPaso1", JSON.stringify(paso1Data));

            console.log("Datos del paso 1 guardados:", paso1Data);
            showToast("✅ Paso 1 completado", true);

            router.push("/(auth)/Crear2");
        } catch (error) {
            console.error("Error guardando datos del paso 1:", error);
            showToast("❌ Error guardando datos");
        }
    };

    return (
        <ImageBackground source={require("../../assets/images/fondo-c.png")} style={styles.background} resizeMode="cover">
            <View style={styles.mainContainer}>
                <KeyboardAwareScrollView
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollContainer}
                    extraHeight={120}
                    enableOnAndroid={true}
                    keyboardOpeningTime={0}
                >
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Datos Personales</Text>

                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Nombre completo" 
                                placeholderTextColor="#666" 
                                value={nombre} 
                                onChangeText={validarNombre} 
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Carnet" 
                                placeholderTextColor="#666" 
                                value={carnet} 
                                onChangeText={validarCarnet} 
                            />
                        </View>

                        {/* ✅ PICKER DE GÉNERO - MISMO DISEÑO */}
                        <View style={styles.inputContainer}>
                            <Picker 
                                selectedValue={genero} 
                                onValueChange={(itemValue) => setGenero(itemValue)} 
                                style={styles.picker} 
                                dropdownIconColor="#213A8E"
                                mode="dropdown"
                            >
                                <Picker.Item label="Género" value="" />
                                <Picker.Item label="Masculino" value="M" />
                                <Picker.Item label="Femenino" value="F" />
                                <Picker.Item label="Otro" value="O" />
                            </Picker>
                        </View>

                        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
                            <Text style={[styles.input, { color: fechaNacimiento ? "#000" : "#666" }]}>
                                {fechaNacimiento ? fechaNacimiento.toLocaleDateString() : "Fecha de nacimiento"}
                            </Text>
                            <Ionicons name="calendar-outline" size={22} color="#213A8E" style={styles.iconCalendar} />
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={fechaNacimiento || new Date()}
                                mode="date"
                                display="calendar"
                                onChange={(event, selectedDate) => { setShowDatePicker(false); if (selectedDate) setFechaNacimiento(selectedDate); }}
                            />
                        )}

                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Correo electrónico" 
                                placeholderTextColor="#666" 
                                value={email} 
                                onChangeText={setEmail} 
                                keyboardType="email-address" 
                            />
                        </View>

                        {/* ✅ PICKER DEPARTAMENTO - MISMO DISEÑO */}
                        <View style={styles.inputContainer}>
                            <Picker 
                                selectedValue={departamento} 
                                onValueChange={(itemValue) => setDepartamento(itemValue)} 
                                style={styles.picker} 
                                dropdownIconColor="#213A8E"
                                mode="dropdown"
                            >
                                <Picker.Item label="Departamento" value="" />
                                {departamentos.map(dep => (
                                    <Picker.Item key={dep.idDepartamento} label={dep.nombre} value={dep.idDepartamento} />
                                ))}
                            </Picker>
                        </View>

                        {/* ✅ PICKER MUNICIPIO - MISMO DISEÑO */}
                        <View style={styles.inputContainer}>
                            <Picker 
                                selectedValue={municipio} 
                                onValueChange={(itemValue) => setMunicipio(itemValue)} 
                                style={styles.picker} 
                                dropdownIconColor="#213A8E"
                                mode="dropdown"
                            >
                                <Picker.Item label="Municipio" value="" />
                                {municipios.map(mun => (
                                    <Picker.Item key={mun.idMunicipio} label={mun.nombre} value={mun.idMunicipio} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Teléfono" 
                                placeholderTextColor="#666" 
                                value={telefono} 
                                onChangeText={validarTelefono} 
                                keyboardType="numeric" 
                            />
                        </View>

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
    formContainer: { 
        width: "85%", 
        borderRadius: 15, 
        padding: 8, 
        backgroundColor: "transparent" 
    },
    title: { fontSize: 23, fontWeight: "bold", color: "#213A8E", marginBottom: 18, fontFamily: "Inter-Bold"},
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF1F8", borderRadius: 12, paddingHorizontal: 10, marginBottom: 15, borderLeftWidth: 15, borderLeftColor: "#2666DE", height: 52 },
    input: { flex: 1, fontSize: 15, fontFamily: "Inter-Medium", color: "#000" ,fontWeight: "medium" },
    
    picker: { 
        flex: 1, 
        fontSize: 15, 
        fontFamily: "Inter-Medium",
        fontWeight: "medium", 
        color: "#000", 
        height: 52,
        minHeight: 52,
        includeFontPadding: false,
        textAlignVertical: 'center',
        marginVertical: 0,
        paddingVertical: 0,
    },
    
    iconCalendar: { 
        marginRight: 10 
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
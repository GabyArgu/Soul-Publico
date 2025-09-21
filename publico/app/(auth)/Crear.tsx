// app/(auth)/Crear.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons"; // Librería de íconos
import Toast from "react-native-root-toast"; // Librería para toast

export default function Crear() {
    const router = useRouter();

    // Estados
    const [nombre, setNombre] = useState("");
    const [carnet, setCarnet] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [email, setEmail] = useState("");
    const [departamento, setDepartamento] = useState("");
    const [municipio, setMunicipio] = useState("");
    const [telefono, setTelefono] = useState("");

    // Validaciones
    const validarNombre = (text: string) => {
        if (/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/.test(text)) {
            setNombre(text);
        }
    };

    const validarCarnet = (text: string) => {
        if (/^[A-Z]{0,2}[0-9]{0,6}$/.test(text)) {
            setCarnet(text);
        }
    };

    const validarTelefono = (text: string) => {
        if (/^\d{0,4}-?\d{0,4}$/.test(text)) {
            if (text.length === 4 && !text.includes("-")) {
                setTelefono(text + "-");
            } else {
                setTelefono(text);
            }
        }
    };

    const formularioValido = () => {
        return (
            nombre &&
            carnet &&
            fechaNacimiento &&
            email &&
            departamento &&
            municipio &&
            telefono &&
            /^[A-Z]{2}[0-9]{6}$/.test(carnet) &&
            fechaNacimiento < new Date() &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
            /^\d{4}-\d{4}$/.test(telefono)
        );
    };

    // Toast personalizado
    const showToast = (message: string, success: boolean = false) => {
        Toast.show(message, {
            duration: 3000, // 3 segundos
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
        router.push("/(auth)/Crear2");
    };

    return (
        <ImageBackground
            source={require("../../assets/images/fondo-c.png")}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Datos Personales</Text>

                    {/* Nombre */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre completo"
                            placeholderTextColor="#666"
                            value={nombre}
                            onChangeText={validarNombre}
                        />
                    </View>

                    {/* Carnet */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Carnet"
                            placeholderTextColor="#666"
                            value={carnet}
                            onChangeText={validarCarnet}
                        />
                    </View>

                    {/* Fecha de nacimiento */}
                    <TouchableOpacity
                        style={styles.inputContainer}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={[styles.input, { color: fechaNacimiento ? "#000" : "#666" }]}>
                            {fechaNacimiento
                                ? fechaNacimiento.toLocaleDateString()
                                : "Fecha de nacimiento"}
                        </Text>
                        <Ionicons name="calendar-outline" size={22} color="#213A8E" style={styles.iconCalendar} />
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={fechaNacimiento || new Date()}
                            mode="date"
                            display="calendar"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setFechaNacimiento(selectedDate);
                            }}
                        />
                    )}

                    {/* Correo */}
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

                    {/* Departamento */}
                    <View style={styles.inputContainer}>
                        <Picker
                            selectedValue={departamento}
                            onValueChange={(itemValue) => setDepartamento(itemValue)}
                            style={styles.picker}
                            dropdownIconColor="#213A8E"
                        >
                            <Picker.Item label="Departamento" value="" />
                            <Picker.Item label="San Salvador" value="San Salvador" />
                            <Picker.Item label="Soyapango" value="Soyapango" />
                        </Picker>
                    </View>

                    {/* Municipio */}
                    <View style={styles.inputContainer}>
                        <Picker
                            selectedValue={municipio}
                            onValueChange={(itemValue) => setMunicipio(itemValue)}
                            style={styles.picker}
                            dropdownIconColor="#213A8E"
                        >
                            <Picker.Item label="Municipio" value="" />
                            <Picker.Item label="Municipio 1" value="Municipio1" />
                            <Picker.Item label="Municipio 2" value="Municipio2" />
                        </Picker>
                    </View>

                    {/* Teléfono */}
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

                    {/* Botones */}
                    <View style={styles.buttonsRow}>
                        <TouchableOpacity style={styles.buttonYellow} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonBlue}
                            onPress={handleSubmit}
                        >
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

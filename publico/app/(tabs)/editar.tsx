// app/(main)/EditarPerfil.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-root-toast";
import * as DocumentPicker from "expo-document-picker";

export default function EditarPerfil() {
    const router = useRouter();

    // Estados
    const [nombre, setNombre] = useState("");
    const [carrera, setCarrera] = useState("");
    const [correo, setCorreo] = useState("");
    const [carnet, setCarnet] = useState("");
    const [cumple, setCumple] = useState<Date | null>(null);
    const [showCumple, setShowCumple] = useState(false);
    const [unidades, setUnidades] = useState("");
    const [telefono, setTelefono] = useState("");
    const [departamento, setDepartamento] = useState("");
    const [municipio, setMunicipio] = useState("");
    const [habilidadesBlandas, setHabilidadesBlandas] = useState("");
    const [habilidadesTecnicas, setHabilidadesTecnicas] = useState("");
    const [idioma, setIdioma] = useState("");
    const [nivel, setNivel] = useState("");
    const [transporte, setTransporte] = useState(false);
    const [disponibilidad, setDisponibilidad] = useState("");
    const [archivo, setArchivo] = useState("");

    // Validaciones
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
            carrera &&
            correo &&
            carnet &&
            cumple &&
            unidades &&
            /^\d{4}-\d{4}$/.test(telefono) &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) &&
            departamento &&
            municipio &&
            habilidadesBlandas &&
            habilidadesTecnicas &&
            idioma &&
            nivel &&
            disponibilidad
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
            showToast("⚠️ Completa todos los campos");
            return;
        }
        showToast("✅ Perfil actualizado", true);
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="#000"
                    onPress={() => router.back()}
                />
            </View>

            {/* Contenido */}
            <ScrollView style={styles.contentBackground} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Nombre */}
                <View style={[styles.inputContainer, { marginTop: 30 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        placeholderTextColor="#666"
                        value={nombre}
                        onChangeText={setNombre}
                        onBlur={() => { if (!nombre) showToast("⚠️ El nombre es obligatorio"); }}
                    />
                </View>

                {/* Carrera */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Carrera"
                        placeholderTextColor="#666"
                        value={carrera}
                        onChangeText={setCarrera}
                        onBlur={() => { if (!carrera) showToast("⚠️ La carrera es obligatoria"); }}
                    />
                </View>

                {/* Correo */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo"
                        placeholderTextColor="#666"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        onBlur={() => {
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) showToast("⚠️ Ingresa un correo válido");
                        }}
                    />
                </View>

                {/* Fila carnet y cumpleaños */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Carnet"
                            placeholderTextColor="#666"
                            value={carnet}
                            onChangeText={setCarnet}
                            onBlur={() => { if (!carnet) showToast("⚠️ El carnet es obligatorio"); }}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.inputContainer2, styles.half, { justifyContent: "space-between" }]}
                        onPress={() => setShowCumple(true)}
                    >
                        <Text style={[styles.input, { color: cumple ? "#000" : "#666" }]}>
                            {cumple ? cumple.toLocaleDateString() : "Cumple"}
                        </Text>
                        <Ionicons name="calendar-outline" size={22} color="#213A8E" style={styles.iconCalendar} />
                    </TouchableOpacity>
                    {showCumple && (
                        <DateTimePicker
                            value={cumple || new Date()}
                            mode="date"
                            display="calendar"
                            onChange={(event, selectedDate) => {
                                setShowCumple(false);
                                if (selectedDate) setCumple(selectedDate);
                            }}
                        />
                    )}
                </View>

                {/* Fila unidades y teléfono */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Unidades"
                            placeholderTextColor="#666"
                            value={unidades}
                            onChangeText={setUnidades}
                            keyboardType="numeric"
                            onBlur={() => { if (!unidades) showToast("⚠️ Las unidades son obligatorias"); }}
                        />
                    </View>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Teléfono"
                            placeholderTextColor="#666"
                            value={telefono}
                            onChangeText={validarTelefono}
                            keyboardType="numeric"
                            onBlur={() => { if (!/^\d{4}-\d{4}$/.test(telefono)) showToast("⚠️ El teléfono debe tener formato 0000-0000"); }}
                        />
                    </View>
                </View>

                {/* Departamento */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={departamento}
                        onValueChange={(v) => {
                            setDepartamento(v);
                            if (!v) showToast("⚠️ Selecciona un departamento");
                        }}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Departamento" value="" />
                        <Picker.Item label="San Salvador" value="San Salvador" />
                        <Picker.Item label="La Libertad" value="La Libertad" />
                    </Picker>
                </View>

                {/* Municipio */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={municipio}
                        onValueChange={(v) => {
                            setMunicipio(v);
                            if (!v) showToast("⚠️ Selecciona un municipio");
                        }}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Municipio" value="" />
                        <Picker.Item label="Municipio 1" value="Municipio1" />
                        <Picker.Item label="Municipio 2" value="Municipio2" />
                    </Picker>
                </View>

                {/* Habilidades blandas */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Habilidades blandas"
                        placeholderTextColor="#666"
                        value={habilidadesBlandas}
                        onChangeText={setHabilidadesBlandas}
                        onBlur={() => { if (!habilidadesBlandas) showToast("⚠️ Obligatorio"); }}
                    />
                </View>

                {/* Habilidades técnicas */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Habilidades técnicas"
                        placeholderTextColor="#666"
                        value={habilidadesTecnicas}
                        onChangeText={setHabilidadesTecnicas}
                        onBlur={() => { if (!habilidadesTecnicas) showToast("⚠️ Obligatorio"); }}
                    />
                </View>

                {/* Idioma */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={idioma}
                        onValueChange={(v) => { setIdioma(v); if (!v) showToast("⚠️ Selecciona un idioma"); }}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Idioma" value="" />
                        <Picker.Item label="Inglés" value="ingles" />
                        <Picker.Item label="Español" value="espanol" />
                    </Picker>
                </View>

                {/* Nivel */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={nivel}
                        onValueChange={(v) => { setNivel(v); if (!v) showToast("⚠️ Selecciona un nivel"); }}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Nivel" value="" />
                        <Picker.Item label="Básico" value="basico" />
                        <Picker.Item label="Intermedio" value="intermedio" />
                        <Picker.Item label="Avanzado" value="avanzado" />
                    </Picker>
                </View>

                {/* Transporte */}
                <View style={[styles.inputContainer, { justifyContent: "space-between" }]}>
                    <Text style={[styles.input, { color: transporte ? "#000" : "#666" }]}>Transporte</Text>
                    <Switch
                        value={transporte}
                        onValueChange={setTransporte}
                        trackColor={{ false: "#ccc", true: "#2666DE" }}
                        thumbColor={transporte ? "#fff" : "#fff"}
                    />
                </View>

                {/* Disponibilidad */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={disponibilidad}
                        onValueChange={(v) => { setDisponibilidad(v); if (!v) showToast("⚠️ Selecciona disponibilidad"); }}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Disponibilidad" value="" />
                        <Picker.Item label="Tiempo completo" value="full" />
                        <Picker.Item label="Medio tiempo" value="part" />
                    </Picker>
                </View>

                {/* Subir archivo */}
                <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={async () => {
                        try {
                            const result = await DocumentPicker.getDocumentAsync({});
                            if (!result.canceled) {
                                const selectedAsset = result.assets[0];
                                setArchivo(selectedAsset.uri);
                                showToast("📄 Archivo seleccionado: " + selectedAsset.name, true);
                            } else {
                                showToast("Selección de archivo cancelada");
                            }
                        } catch (error) {
                            console.error("Error al seleccionar documento:", error);
                            showToast("❌ Error al seleccionar archivo");
                        }
                    }}
                >
                    <Text style={[styles.input, { color: archivo ? "#000" : "#666" }]}>
                        {archivo ? "Archivo seleccionado" : "Subir archivo"}
                    </Text>
                    <Ionicons
                        name="cloud-upload-outline"
                        size={22}
                        color="#213A8E"
                        style={styles.iconCalendar}
                    />
                </TouchableOpacity>

                {/* Botón guardar */}
                <View style={{ alignItems: "flex-end", marginTop: 20 }}>
                    <TouchableOpacity style={styles.buttonYellow} onPress={handleSubmit}>
                        <Ionicons name="save-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom nav */}
            <View style={styles.bottomNav}>
                <Ionicons name="home-outline" size={28} color="#fff" onPress={() => router.push("/")} />
                <Ionicons name="star-outline" size={28} color="#fff" onPress={() => router.push("/(tabs)/guardados")} />
                <Ionicons name="file-tray-outline" size={28} color="#fff" onPress={() => router.push("/(tabs)/aplicaciones")} />
                <Ionicons name="notifications-outline" size={28} color="#fff" onPress={() => router.push("/(tabs)/notificaciones")} />
                <Ionicons name="person-outline" size={28} color="#fff" onPress={() => router.push("/(tabs)/cuenta")} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 91,
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        fontFamily: "MyriadPro-Bold",
    },
    contentBackground: {
        flex: 1,
        backgroundColor: "#F2F6FC",
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        gap: 10,
    },
    half: { flex: 1 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 10,
        borderLeftWidth: 15,
        borderLeftColor: "#2666DE",
        height: 55,
        marginBottom: 15,
        shadowColor: "#2666DE",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 8,
    },
    inputContainer2: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 10,
        borderLeftWidth: 15,
        borderLeftColor: "#2666DE",
        height: 55,
        shadowColor: "#2666DE",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Inter-Medium",
        color: "#000",
        height: 55,
        textAlignVertical: "center",
    },
    picker: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Inter-Medium",
        color: "#000",
        height: 55,
    },
    iconCalendar: { marginRight: 10 },
    buttonYellow: {
        backgroundColor: "#F9DC50",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#2666DE",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 30,
        paddingTop: 20,
    },
});

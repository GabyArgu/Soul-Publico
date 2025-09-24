
// app/(main)/AgregarProyecto.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-root-toast";

export default function AgregarProyecto() {
    const router = useRouter();

    // Estados
    const [nombreProyecto, setNombreProyecto] = useState("");
    const [especialidad, setEspecialidad] = useState("");
    const [institucion, setInstitucion] = useState("");
    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);
    const [showInicio, setShowInicio] = useState(false);
    const [showFin, setShowFin] = useState(false);
    const [contacto, setContacto] = useState("");
    const [telefono, setTelefono] = useState("");
    const [correo, setCorreo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [capacidad, setCapacidad] = useState("");
    const [horas, setHoras] = useState("");
    const [idioma, setIdioma] = useState("");
    const [nivelDominio, setNivelDominio] = useState("");
    const [habilidades, setHabilidades] = useState("");
    const [modalidad, setModalidad] = useState("");
    const [departamento, setDepartamento] = useState("");
    const [municipio, setMunicipio] = useState("");

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
            nombreProyecto &&
            especialidad &&
            institucion &&
            fechaInicio &&
            fechaFin &&
            fechaFin > fechaInicio &&
            contacto &&
            /^\d{4}-\d{4}$/.test(telefono) &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) &&
            descripcion &&
            capacidad &&
            horas &&
            idioma &&
            nivelDominio &&
            habilidades &&
            modalidad &&
            departamento &&
            municipio
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
        showToast("✅ Proyecto Creado", true);
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Agregar Proyecto</Text>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="#000"
                    onPress={() => router.back()}
                />
            </View>

            {/* Contenido */}
            <ScrollView style={styles.contentBackground} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Nombre del proyecto */}
                <View style={[styles.inputContainer, { marginTop: 30 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre del proyecto"
                        placeholderTextColor="#666"
                        value={nombreProyecto}
                        onChangeText={setNombreProyecto}
                        onBlur={() => {
                            if (!nombreProyecto) showToast("⚠️ El nombre del proyecto es obligatorio");
                        }}
                    />
                </View>

                {/* Especialidad */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={especialidad}
                        onValueChange={(v) => {
                            setEspecialidad(v);
                            if (!v) showToast("⚠️ Selecciona una especialidad");
                        }}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Selecciona la especialidad" value="" />
                        <Picker.Item label="Ingeniería" value="ingenieria" />
                        <Picker.Item label="Ciencias Sociales" value="sociales" />
                    </Picker>
                </View>

                {/* Institución */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de la institución"
                        placeholderTextColor="#666"
                        value={institucion}
                        onChangeText={setInstitucion}
                        onBlur={() => {
                            if (!institucion) showToast("⚠️ La institución es obligatoria");
                        }}
                    />
                </View>

                {/* Fechas */}
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.inputContainer2, styles.half]} onPress={() => setShowInicio(true)}>
                        <Text style={[styles.input, { color: fechaInicio ? "#000" : "#666" }]}>
                            {fechaInicio ? fechaInicio.toLocaleDateString() : "Inicio"}
                        </Text>
                        <Ionicons name="calendar-outline" size={22} color="#213A8E" style={styles.iconCalendar} />
                    </TouchableOpacity>
                    {showInicio && (
                        <DateTimePicker
                            value={fechaInicio || new Date()}
                            mode="date"
                            display="calendar"
                            onChange={(event, selectedDate) => {
                                setShowInicio(false);
                                if (selectedDate) setFechaInicio(selectedDate);
                            }}
                        />
                    )}
                    <TouchableOpacity
                        style={[styles.inputContainer2, styles.half, { opacity: fechaInicio ? 1 : 0.5 }]}
                        onPress={() => fechaInicio && setShowFin(true)}
                        disabled={!fechaInicio}
                    >
                        <Text style={[styles.input, { color: fechaFin ? "#000" : "#666" }]}>
                            {fechaFin ? fechaFin.toLocaleDateString() : "Fin"}
                        </Text>
                        <Ionicons name="calendar-outline" size={22} color="#213A8E" style={styles.iconCalendar} />
                    </TouchableOpacity>
                    {showFin && (
                        <DateTimePicker
                            value={fechaFin || new Date()}
                            mode="date"
                            display="calendar"
                            onChange={(event, selectedDate) => {
                                setShowFin(false);
                                if (selectedDate) setFechaFin(selectedDate);
                            }}
                        />
                    )}
                </View>

                {/* Contacto y Teléfono */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Contacto"
                            placeholderTextColor="#666"
                            value={contacto}
                            onChangeText={setContacto}
                            onBlur={() => {
                                if (!contacto) showToast("⚠️ El contacto es obligatorio");
                            }}
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
                            onBlur={() => {
                                if (!/^\d{4}-\d{4}$/.test(telefono)) showToast("⚠️ El teléfono debe tener formato 0000-0000");
                            }}
                        />
                    </View>
                </View>

                {/* Correo */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo de contacto"
                        placeholderTextColor="#666"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        onBlur={() => {
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) showToast("⚠️ Ingresa un correo válido");
                        }}
                    />
                </View>

                {/* Descripción */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { height: 80 }]}
                        placeholder="Descripción del proyecto"
                        placeholderTextColor="#666"
                        value={descripcion}
                        onChangeText={setDescripcion}
                        multiline
                        onBlur={() => {
                            if (!descripcion) showToast("⚠️ La descripción es obligatoria");
                        }}
                    />
                </View>

                {/* Capacidad y Horas */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Capacidad"
                            placeholderTextColor="#666"
                            value={capacidad}
                            onChangeText={setCapacidad}
                            keyboardType="numeric"
                            onBlur={() => {
                                if (!capacidad) showToast("⚠️ La capacidad es obligatoria");
                            }}
                        />
                    </View>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Horas"
                            placeholderTextColor="#666"
                            value={horas}
                            onChangeText={setHoras}
                            keyboardType="numeric"
                            onBlur={() => {
                                if (!horas) showToast("⚠️ Las horas son obligatorias");
                            }}
                        />
                    </View>
                </View>

                {/* Idioma */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={idioma}
                        onValueChange={(v) => {
                            setIdioma(v);
                            if (!v) showToast("⚠️ Selecciona un idioma");
                        }}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Idioma" value="" />
                        <Picker.Item label="Inglés" value="ingles" />
                        <Picker.Item label="Español" value="espanol" />
                    </Picker>
                </View>

                {/* Nivel dominio */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={nivelDominio}
                        onValueChange={(v) => {
                            setNivelDominio(v);
                            if (!v) showToast("⚠️ Selecciona un nivel de dominio");
                        }}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Nivel de dominio" value="" />
                        <Picker.Item label="Básico" value="basico" />
                        <Picker.Item label="Intermedio" value="intermedio" />
                        <Picker.Item label="Avanzado" value="avanzado" />
                    </Picker>
                </View>

                {/* Habilidades */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Habilidades requeridas"
                        placeholderTextColor="#666"
                        value={habilidades}
                        onChangeText={setHabilidades}
                        onBlur={() => {
                            if (!habilidades) showToast("⚠️ Las habilidades son obligatorias");
                        }}
                    />
                </View>

                {/* Modalidad */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={modalidad}
                        onValueChange={(v) => {
                            setModalidad(v);
                            if (!v) showToast("⚠️ Selecciona una modalidad");
                        }}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Selecciona la modalidad" value="" />
                        <Picker.Item label="Presencial" value="presencial" />
                        <Picker.Item label="Virtual" value="virtual" />
                        <Picker.Item label="Mixta" value="mixta" />
                    </Picker>
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

                {/* Botón guardar */}
                <View style={{ alignItems: "flex-end", marginTop: 20 }}>
                    <TouchableOpacity style={styles.buttonYellow} onPress={handleSubmit}>
                        <Ionicons name="save-outline" size={28} color="#fff" onPress={() => router.push("/")}/>
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

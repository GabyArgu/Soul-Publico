import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import axios from "axios";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface Habilidad { idHabilidad: number; nombre: string; tipo: string; }

export default function Crear2() {
    const router = useRouter();
    const API_URL = "http://192.168.1.11:4000/api";

    // Estados de selects
    const [carreras, setCarreras] = useState<{ idCarrera: number; nombre: string }[]>([]);
    const [idiomas, setIdiomas] = useState<{ id: number; nombre: string }[]>([]);
    const [niveles, setNiveles] = useState<{ id: number; nombre: string }[]>([]);
    const [carrera, setCarrera] = useState("");
    const [idioma, setIdioma] = useState("");
    const [nivel, setNivel] = useState("");
    const [unidades, setUnidades] = useState("");

    // Habilidades
    const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
    const [inputHabilidadTecnica, setInputHabilidadTecnica] = useState("");
    const [inputHabilidadBlanda, setInputHabilidadBlanda] = useState("");
    const [habilidadesTecnicas, setHabilidadesTecnicas] = useState<Habilidad[]>([]);
    const [habilidadesBlandas, setHabilidadesBlandas] = useState<Habilidad[]>([]);
    const [sugerenciasTecnicas, setSugerenciasTecnicas] = useState<Habilidad[]>([]);
    const [sugerenciasBlandas, setSugerenciasBlandas] = useState<Habilidad[]>([]);
    
    // Estados para la posición de las sugerencias
    const [layoutTecnicas, setLayoutTecnicas] = useState({ y: 0, width: 0 });
    const [layoutBlandas, setLayoutBlandas] = useState({ y: 0, width: 0 });

    // Cargar datos desde API
    useEffect(() => {
        axios.get(`${API_URL}/carreras`).then(res => setCarreras(res.data)).catch(console.error);
        axios.get(`${API_URL}/idiomas`).then(res => setIdiomas(res.data)).catch(console.error);
        axios.get(`${API_URL}/niveles`).then(res => setNiveles(res.data)).catch(console.error);
        axios.get(`${API_URL}/habilidades`).then(res => setHabilidades(res.data)).catch(console.error);
    }, []);

    // Filtrar habilidades mientras se escribe
    useEffect(() => {
        setSugerenciasTecnicas(
            habilidades.filter(h => h.tipo === "Técnica" &&
                h.nombre.toLowerCase().includes(inputHabilidadTecnica.toLowerCase()) &&
                !habilidadesTecnicas.some(ht => ht.idHabilidad === h.idHabilidad)
            )
        );
    }, [inputHabilidadTecnica, habilidadesTecnicas, habilidades]);

    useEffect(() => {
        setSugerenciasBlandas(
            habilidades.filter(h => h.tipo === "Blanda" &&
                h.nombre.toLowerCase().includes(inputHabilidadBlanda.toLowerCase()) &&
                !habilidadesBlandas.some(hb => hb.idHabilidad === h.idHabilidad)
            )
        );
    }, [inputHabilidadBlanda, habilidadesBlandas, habilidades]);

    const agregarHabilidad = (h: Habilidad, tipo: "Técnica" | "Blanda") => {
        if (tipo === "Técnica") { setHabilidadesTecnicas([...habilidadesTecnicas, h]); setInputHabilidadTecnica(""); }
        else { setHabilidadesBlandas([...habilidadesBlandas, h]); setInputHabilidadBlanda(""); }
    };

    const eliminarHabilidad = (id: number, tipo: "Técnica" | "Blanda") => {
        if (tipo === "Técnica") setHabilidadesTecnicas(habilidadesTecnicas.filter(h => h.idHabilidad !== id));
        else setHabilidadesBlandas(habilidadesBlandas.filter(h => h.idHabilidad !== id));
    };

    const validarUnidades = (text: string) => { if (/^\d{0,2}$/.test(text)) setUnidades(text); };

    const showToast = (message: string, success: boolean = false) => {
        Toast.show(message, {
            duration: 3000, position: Toast.positions.TOP, shadow: true, animation: true, hideOnPress: true,
            backgroundColor: success ? "#4CAF50" : "#E53935", textColor: "#fff", opacity: 0.95,
            containerStyle: { borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, marginTop: 60, alignSelf: "center" },
            textStyle: { fontFamily: "Inter-Medium", fontSize: 14 },
        });
    };

    const handleSubmit = () => {
        if (!carrera || !unidades || !idioma || !nivel || habilidadesTecnicas.length === 0 || habilidadesBlandas.length === 0) {
            showToast("⚠️ Completa todos los campos");
            return;
        }
        router.push("/(auth)/Crear3");
    };

    return (
        <ImageBackground source={require("../../assets/images/fondo-c.png")} style={styles.background} resizeMode="cover">
            <View style={styles.mainContainer}>
                <KeyboardAwareScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} extraHeight={120} enableOnAndroid keyboardOpeningTime={0}>
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Datos Académicos</Text>

                        {/* Carrera */}
                        <View style={styles.inputContainer}>
                            <Picker selectedValue={carrera} onValueChange={setCarrera} style={styles.picker} dropdownIconColor="#213A8E">
                                <Picker.Item label="Selecciona tu carrera" value="" />
                                {carreras.map(c => <Picker.Item key={c.idCarrera} label={c.nombre} value={c.nombre} />)}
                            </Picker>
                        </View>

                        {/* UV's */}
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.input} placeholder="UV'S ganadas" value={unidades} onChangeText={validarUnidades} keyboardType="numeric" />
                        </View>

                        {/* Idioma */}
                        <View style={styles.inputContainer}>
                            <Picker selectedValue={idioma} onValueChange={setIdioma} style={styles.picker} dropdownIconColor="#213A8E">
                                <Picker.Item label="Idioma que dominas" value="" />
                                {idiomas.map(i => <Picker.Item key={i.id} label={i.nombre} value={i.nombre} />)}
                            </Picker>
                        </View>

                        {/* Nivel */}
                        <View style={styles.inputContainer}>
                            <Picker selectedValue={nivel} onValueChange={setNivel} style={styles.picker} dropdownIconColor="#213A8E">
                                <Picker.Item label="Nivel de dominio" value="" />
                                {niveles.map(n => <Picker.Item key={n.id} label={n.nombre} value={n.nombre} />)}
                            </Picker>
                        </View>
                        
                        {/* Habilidades técnicas */}
                        <View style={{ zIndex: 20 }}>
                            <View style={styles.chipsInputContainer} onLayout={(event) => {
                                const { y, width } = event.nativeEvent.layout;
                                setLayoutTecnicas({ y: y, width: width });
                            }}>
                                <View style={styles.chipsContainer}>
                                    {habilidadesTecnicas.map(h => (
                                        <View key={h.idHabilidad} style={styles.chip}>
                                            <Text style={styles.chipText}>{h.nombre}</Text>
                                            <TouchableOpacity onPress={() => eliminarHabilidad(h.idHabilidad, "Técnica")} style={styles.chipClose}>
                                                <Ionicons name="close-circle" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TextInput
                                        style={styles.chipTextInput}
                                        placeholder="Habilidades técnicas"
                                        placeholderTextColor="#666"
                                        value={inputHabilidadTecnica}
                                        onChangeText={setInputHabilidadTecnica}
                                    />
                                </View>
                            </View>
                            {inputHabilidadTecnica.length > 0 && sugerenciasTecnicas.length > 0 && (
                                <View style={[styles.suggestionsList, { top: layoutTecnicas.y, width: layoutTecnicas.width }]}>
                                    {sugerenciasTecnicas.map(item => (
                                        <TouchableOpacity key={item.idHabilidad} onPress={() => agregarHabilidad(item, "Técnica")} style={styles.suggestionItem}>
                                            <Text>{item.nombre}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Habilidades blandas */}
                        <View style={{ zIndex: 10 }}>
                            <View style={styles.chipsInputContainer} onLayout={(event) => {
                                const { y, width } = event.nativeEvent.layout;
                                setLayoutBlandas({ y: y, width: width });
                            }}>
                                <View style={styles.chipsContainer}>
                                    {habilidadesBlandas.map(h => (
                                        <View key={h.idHabilidad} style={styles.chip}>
                                            <Text style={styles.chipText}>{h.nombre}</Text>
                                            <TouchableOpacity onPress={() => eliminarHabilidad(h.idHabilidad, "Blanda")} style={styles.chipClose}>
                                                <Ionicons name="close-circle" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TextInput
                                        style={styles.chipTextInput}
                                        placeholder="Habilidades blandas"
                                        placeholderTextColor="#666"
                                        value={inputHabilidadBlanda}
                                        onChangeText={setInputHabilidadBlanda}
                                    />
                                </View>
                            </View>
                            {inputHabilidadBlanda.length > 0 && sugerenciasBlandas.length > 0 && (
                                <View style={[styles.suggestionsList, { top: layoutBlandas.y, width: layoutBlandas.width }]}>
                                    {sugerenciasBlandas.map(item => (
                                        <TouchableOpacity key={item.idHabilidad} onPress={() => agregarHabilidad(item, "Blanda")} style={styles.suggestionItem}>
                                            <Text>{item.nombre}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Botones */}
                        <View style={styles.buttonsRow}>
                            <TouchableOpacity style={styles.buttonYellow} onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#fff" /></TouchableOpacity>
                            <TouchableOpacity style={styles.buttonBlue} onPress={handleSubmit}><Ionicons name="arrow-forward" size={28} color="#fff" /></TouchableOpacity>
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
    picker: { flex: 1, fontSize: 15, fontFamily: "Inter-Medium", color: "#000", height: 52 },
    
    // Estilos para el campo de entrada de chips
    chipsInputContainer: {
        backgroundColor: '#EFF1F8',
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 15,
        borderLeftColor: '#2666DE',
        paddingVertical: 10,
        minHeight: 52,
        paddingHorizontal: 5,
        justifyContent: 'center',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2666DE',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        margin: 5,
    },
    chipText: {
        color: '#fff',
        fontFamily: 'Inter-Medium',
    },
    chipClose: {
        marginLeft: 5,
    },
    chipTextInput: {
        flexGrow: 1,
        fontSize: 15,
        fontFamily: 'Inter-Medium',
        color: '#000',
        minWidth: 100,
        // Eliminado la altura fija para que se ajuste con el padding
    },
    
    // Estilos para la lista de sugerencias ahora con posición absoluta
    suggestionsList: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        zIndex: 100, // Asegura que esté por encima de otros elementos
        elevation: 5,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    
    buttonsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
    buttonYellow: { backgroundColor: "#2666DE", width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
    buttonBlue: { backgroundColor: "#F9DC50", width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
});
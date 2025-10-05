// app/(auth)/Crear2.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Dimensions, Modal, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import axios from "axios";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Habilidad { idHabilidad: number; nombre: string; tipo: string; }
interface Idioma { idIdioma: number; nombre: string; }
interface Nivel { idINivel: number; nombre: string; }

export default function Crear2() {
    const router = useRouter();
    const API_URL = "https://d06a6c5dfc30.ngrok-free.app/api";
    const params = useLocalSearchParams();
    const userData = params.userData ? JSON.parse(params.userData as string) : {};

    // Estados de selects
    const [carreras, setCarreras] = useState<{ idCarrera: number; nombre: string }[]>([]);
    const [idiomas, setIdiomas] = useState<Idioma[]>([]);
    const [niveles, setNiveles] = useState<Nivel[]>([]);
    const [unidades, setUnidades] = useState("");
    const [carrera, setCarrera] = useState<number | "">("");
    const [carreraSeleccionada, setCarreraSeleccionada] = useState("");

    // Estados para idiomas (COMO EN EDITAR)
    const [idiomasSeleccionados, setIdiomasSeleccionados] = useState<{ idIdioma: number, idINivel: number }[]>([]);
    const [modalIdiomasVisible, setModalIdiomasVisible] = useState(false);

    // Habilidades
    const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
    const [inputHabilidadTecnica, setInputHabilidadTecnica] = useState("");
    const [inputHabilidadBlanda, setInputHabilidadBlanda] = useState("");
    const [habilidadesTecnicas, setHabilidadesTecnicas] = useState<Habilidad[]>([]);
    const [habilidadesBlandas, setHabilidadesBlandas] = useState<Habilidad[]>([]);
    const [sugerenciasTecnicas, setSugerenciasTecnicas] = useState<Habilidad[]>([]);
    const [sugerenciasBlandas, setSugerenciasBlandas] = useState<Habilidad[]>([]);

    // Posición de sugerencias
    const [layoutTecnicas, setLayoutTecnicas] = useState({ y: 0, width: 0 });
    const [layoutBlandas, setLayoutBlandas] = useState({ y: 0, width: 0 });

    // Función para abreviar SOLO las palabras problemáticas
    const abreviarPalabrasProblematicas = (nombreCarrera: string): string => {
        if (!nombreCarrera) return "";
        
        // Abreviar palabras específicas que causan problemas
        return nombreCarrera
            .replace(/Licenciatura/gi, 'Lic.')
            .replace(/Ingeniería/gi, 'Ing.')
            .replace(/Técnico/gi, 'Tec.')
            .replace(/Técnica/gi, 'Tec.')
            .replace(/Especialización/gi, 'Espe.')
            .replace(/Especialidad/gi, 'Espe.')
            .replace(/Adquisición/gi, 'Adq.')
            .replace(/Extranjeras/gi, 'Ext.');
    };

    // Función para obtener el nombre completo de la carrera seleccionada
    const getCarreraCompleta = (idCarrera: number): string => {
        const carreraEncontrada = carreras.find(c => c.idCarrera === idCarrera);
        return carreraEncontrada ? carreraEncontrada.nombre : '';
    };

    // Cargar datos desde API
    useEffect(() => {
        axios.get(`${API_URL}/carreras`).then(res => setCarreras(res.data)).catch(console.error);
        axios.get(`${API_URL}/idiomas`).then(res => setIdiomas(res.data)).catch(console.error);
        axios.get(`${API_URL}/niveles`).then(res => setNiveles(res.data)).catch(console.error);
        axios.get(`${API_URL}/habilidades`).then(res => setHabilidades(res.data)).catch(console.error);
    }, []);

    // Cuando se selecciona una carrera, mostrar el nombre completo
    useEffect(() => {
        if (carrera) {
            setCarreraSeleccionada(getCarreraCompleta(carrera));
        } else {
            setCarreraSeleccionada("");
        }
    }, [carrera, carreras]);

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

    // FUNCIONES PARA IDIOMAS (COPIADAS DE EDITAR)
    const toggleIdiomaNivel = (idIdioma: number, idINivel: number) => {
        const existeIndex = idiomasSeleccionados.findIndex(item => item.idIdioma === idIdioma);

        if (existeIndex !== -1) {
            const nuevosIdiomas = [...idiomasSeleccionados];
            nuevosIdiomas.splice(existeIndex, 1);
            setIdiomasSeleccionados(nuevosIdiomas);
        } else {
            setIdiomasSeleccionados([...idiomasSeleccionados, { idIdioma, idINivel }]);
        }
    };

    const actualizarNivelIdioma = (idIdioma: number, idINivel: number) => {
        const nuevosIdiomas = idiomasSeleccionados.map(item =>
            item.idIdioma === idIdioma ? { ...item, idINivel } : item
        );
        setIdiomasSeleccionados(nuevosIdiomas);
    };

    const getIdiomasTexto = () => {
        if (idiomasSeleccionados.length === 0) return "Idiomas y niveles (opcional)";
        return `${idiomasSeleccionados.length} idioma(s) seleccionado(s)`;
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

    const handleSubmit = async () => {
        try {
            const paso1DataString = await AsyncStorage.getItem("crearPaso1");
            const paso1Data = paso1DataString ? JSON.parse(paso1DataString) : {};

            // Validación de selects obligatorios (quitamos idioma y nivel individual)
            if (!carrera) return showToast("❌ Debes seleccionar tu carrera");
            if (!unidades) return showToast("❌ Debes ingresar UV's ganadas");

            if (habilidadesTecnicas.length === 0) return showToast("❌ Debes agregar al menos una habilidad técnica");
            if (habilidadesBlandas.length === 0) return showToast("❌ Debes agregar al menos una habilidad blanda");

            // Tomamos solo el primer idioma seleccionado para compatibilidad con el backend
            const primerIdioma = idiomasSeleccionados.length > 0 ? idiomasSeleccionados[0] : null;

            const combinedData = {
                ...paso1Data,
                idCarrera: Number(carrera),
                uvs: parseInt(unidades),
                idIdioma: primerIdioma ? primerIdioma.idIdioma : null,
                idNivel: primerIdioma ? primerIdioma.idINivel : null,
                habilidadesTecnicas: habilidadesTecnicas.map(h => h.idHabilidad).join(","),
                habilidadesBlandas: habilidadesBlandas.map(h => h.idHabilidad).join(","),
            };

            await AsyncStorage.setItem("crearPaso2", JSON.stringify(combinedData));

            console.log("Datos del paso 2 guardados:", combinedData);
            showToast("✅ Paso 2 completado", true);

            router.push({
                pathname: "/(auth)/Crear3",
                params: { combinedData: JSON.stringify(combinedData) }
            });
        } catch (error) {
            console.error("Error guardando datos del paso 2:", error);
            showToast("❌ Error guardando datos");
        }
    };

    return (
        <ImageBackground source={require("../../assets/images/fondo-c.png")} style={styles.background} resizeMode="cover">
            <View style={styles.mainContainer}>
                <KeyboardAwareScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} extraHeight={120} enableOnAndroid keyboardOpeningTime={0}>
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Datos Académicos</Text>

                        {/* Carrera */}
                        <View style={styles.inputContainer}>
                            <Picker 
                                selectedValue={carrera} 
                                onValueChange={(val) => setCarrera(Number(val))} 
                                style={styles.picker} 
                                dropdownIconColor="#213A8E"
                                mode="dropdown"
                            >
                                <Picker.Item 
                                    label="Selecciona tu carrera" 
                                    value="" 
                                />
                                {carreras.map(c => (
                                    <Picker.Item 
                                        key={c.idCarrera} 
                                        label={abreviarPalabrasProblematicas(c.nombre)} 
                                        value={c.idCarrera} 
                                    />
                                ))}
                            </Picker>
                        </View>

                        {/* UV's */}
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

                        {/* Idiomas y Niveles - Selección múltiple (COMO EN EDITAR) */}
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setModalIdiomasVisible(true)}
                        >
                            <Text style={[styles.input, { color: idiomasSeleccionados.length > 0 ? "#000" : "#666" }]}>
                                {getIdiomasTexto()}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#213A8E" />
                        </TouchableOpacity>

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
                                            <Text style={styles.suggestionText}>{item.nombre}</Text>
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
                                            <Text style={styles.suggestionText}>{item.nombre}</Text>
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

            {/* Modal de Idiomas (COPIADO DE EDITAR) */}
            <Modal
                visible={modalIdiomasVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalIdiomasVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Idiomas y niveles (opcional)</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalIdiomasVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#213A8E" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {idiomas.map(idiomaItem => {
                                const estaSeleccionado = idiomasSeleccionados.some(item => item.idIdioma === idiomaItem.idIdioma);
                                const nivelSeleccionado = idiomasSeleccionados.find(item => item.idIdioma === idiomaItem.idIdioma)?.idINivel;

                                return (
                                    <View key={idiomaItem.idIdioma} style={styles.idiomaContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.idiomaOption,
                                                estaSeleccionado && styles.idiomaSelected
                                            ]}
                                            onPress={() => {
                                                if (niveles.length > 0) {
                                                    const primerNivel = niveles[0].idINivel;
                                                    toggleIdiomaNivel(idiomaItem.idIdioma, primerNivel);
                                                } else {
                                                    showToast("⚠️ Aún no se han cargado los niveles");
                                                }
                                            }}
                                        >
                                            <Ionicons
                                                name={estaSeleccionado ? "checkbox" : "square-outline"}
                                                size={22}
                                                color={estaSeleccionado ? "#2666DE" : "#666"}
                                            />
                                            <Text style={styles.idiomaText}>{idiomaItem.nombre}</Text>
                                        </TouchableOpacity>

                                        {estaSeleccionado && (
                                            <View style={styles.nivelesContainer}>
                                                <Text style={styles.nivelesTitle}>Nivel requerido:</Text>
                                                <View style={styles.nivelesOptions}>
                                                    {niveles.map(nivelItem => (
                                                        <TouchableOpacity
                                                            key={nivelItem.idINivel}
                                                            style={[
                                                                styles.nivelOption,
                                                                nivelSeleccionado === nivelItem.idINivel && styles.nivelSelected
                                                            ]}
                                                            onPress={() => actualizarNivelIdioma(idiomaItem.idIdioma, nivelItem.idINivel)}
                                                        >
                                                            <Text style={[
                                                                styles.nivelText,
                                                                nivelSeleccionado === nivelItem.idINivel && styles.nivelTextSelected
                                                            ]}>
                                                                {nivelItem.nombre}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.aplicarButton}
                                onPress={() => setModalIdiomasVisible(false)}
                            >
                                <Text style={styles.aplicarButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

// AÑADIR ESTOS ESTILOS AL FINAL DEL STYLESHEET EXISTENTE
const styles = StyleSheet.create({
    background: { flex: 1, width: "100%", height: "100%" },
    mainContainer: { flex: 1, marginTop: 220 },
    scrollContent: { flex: 1 },
    scrollContainer: { alignItems: "center", paddingBottom: 40 },
    formContainer: { width: "85%", borderRadius: 15, padding: 8, backgroundColor: "transparent" },
    title: { fontSize: 23, fontWeight: "bold", color: "#213A8E", marginBottom: 18, fontFamily: "Inter-Bold" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF1F8", borderRadius: 12, paddingHorizontal: 10, marginBottom: 15, borderLeftWidth: 15, borderLeftColor: "#2666DE", height: 52 },
    input: { flex: 1, fontSize: 15, fontFamily: "Inter-Medium", color: "#000" },

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
        alignItems: 'center' 
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
        fontSize: 12 
    },
    
    chipClose: { 
        marginLeft: 5 
    },
    
    chipTextInput: { 
        flexGrow: 1, 
        fontSize: 15, 
        fontFamily: 'Inter-Medium', 
        color: '#000', 
        minWidth: 100,
        includeFontPadding: false,
        textAlignVertical: 'center',
        paddingVertical: 0,
        marginVertical: 0,
    },

    suggestionsList: { 
        position: 'absolute', 
        backgroundColor: '#fff', 
        borderWidth: 1, 
        borderColor: '#ddd', 
        borderRadius: 8, 
        zIndex: 100, 
        elevation: 5,
        maxHeight: 150,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    
    suggestionItem: { 
        padding: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee' 
    },
    
    suggestionText: { 
        fontSize: 14, 
        fontFamily: 'Inter-Medium' 
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

    // ESTILOS DEL MODAL (COPIADOS DE EDITAR)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#213A8E',
        fontFamily: 'MyriadPro-Bold',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        paddingHorizontal: 20,
        maxHeight: '70%',
    },
    modalButtons: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    idiomaContainer: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
    },
    idiomaOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    idiomaSelected: {
        backgroundColor: '#F2F6FC',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    idiomaText: {
        marginLeft: 10,
        fontSize: 15,
        fontFamily: 'Inter-Medium',
        color: '#333',
        flex: 1,
    },
    nivelesContainer: {
        marginLeft: 32,
        marginTop: 5,
    },
    nivelesTitle: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#666',
        marginBottom: 5,
    },
    nivelesOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    nivelOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    nivelSelected: {
        backgroundColor: '#2666DE',
        borderColor: '#2666DE',
    },
    nivelText: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#666',
    },
    nivelTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    aplicarButton: {
        backgroundColor: '#2666DE',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    aplicarButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'MyriadPro-Bold',
    },
});
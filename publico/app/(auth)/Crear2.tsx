import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import axios from "axios";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Habilidad { idHabilidad: number; nombre: string; tipo: string; }

export default function Crear2() {
    const router = useRouter();
    const API_URL = "http://192.168.1.11:4000/api";
    const params = useLocalSearchParams();
    const userData = params.userData ? JSON.parse(params.userData as string) : {};

    // Estados de selects
    const [carreras, setCarreras] = useState<{ idCarrera: number; nombre: string }[]>([]);
    const [idiomas, setIdiomas] = useState<{ idIdioma: number; nombre: string }[]>([]);
    const [niveles, setNiveles] = useState<{ idINivel: number; nombre: string }[]>([]);
    const [unidades, setUnidades] = useState("");
    const [carrera, setCarrera] = useState<number | "">("");
    const [idioma, setIdioma] = useState<number | "">("");
    const [nivel, setNivel] = useState<number | "">("");
    const [carreraSeleccionada, setCarreraSeleccionada] = useState("");

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

            // Validación de selects obligatorios
            if (!carrera) return showToast("❌ Debes seleccionar tu carrera");
            if (!unidades) return showToast("❌ Debes ingresar UV's ganadas");
            if (!idioma) return showToast("❌ Debes seleccionar un idioma");
            if (!nivel) return showToast("❌ Debes seleccionar nivel de idioma");

            if (habilidadesTecnicas.length === 0) return showToast("❌ Debes agregar al menos una habilidad técnica");
            if (habilidadesBlandas.length === 0) return showToast("❌ Debes agregar al menos una habilidad blanda");

            const combinedData = {
                ...paso1Data,
                idCarrera: Number(carrera),
                uvs: parseInt(unidades),
                idIdioma: Number(idioma),
                idNivel: Number(nivel),
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

                        {/* Idioma - Mismo diseño que carrera */}
                        <View style={styles.inputContainer}>
                            <Picker 
                                selectedValue={idioma} 
                                onValueChange={setIdioma} 
                                style={styles.picker} 
                                dropdownIconColor="#213A8E"
                                mode="dropdown"
                            >
                                <Picker.Item label="Idioma que dominas" value="" />
                                {idiomas.map(i => (
                                    <Picker.Item 
                                        key={i.idIdioma} 
                                        label={i.nombre} 
                                        value={i.idIdioma} 
                                    />
                                ))}
                            </Picker>
                        </View>

                        {/* Nivel - Mismo diseño que carrera */}
                        <View style={styles.inputContainer}>
                            <Picker 
                                selectedValue={nivel} 
                                onValueChange={setNivel} 
                                style={styles.picker} 
                                dropdownIconColor="#213A8E"
                                mode="dropdown"
                            >
                                <Picker.Item label="Nivel de dominio" value="" />
                                {niveles.map(n => (
                                    <Picker.Item 
                                        key={n.idINivel} 
                                        label={n.nombre} 
                                        value={n.idINivel} 
                                    />
                                ))}
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

    // Estilo para mostrar la carrera completa
    carreraCompletaContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#2666DE',
        shadowColor: "#2666DE",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    
    carreraCompletaText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
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
});
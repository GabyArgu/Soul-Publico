// app/(main)/Aplicaciones.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, ScrollView, Modal, ActivityIndicator, Dimensions } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Aplicacion {
    idAplicacion: number;
    idProyecto: number;
    titulo: string;
    descripcion: string;
    institucion: string;
    horas: number;
    estado: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Aplicaciones() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTimeout, setSearchTimeout] = useState<any>();
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    // Filtros - TODOS LOS MISMOS QUE GUARDADOS
    const [selectedIdiomas, setSelectedIdiomas] = useState<string[]>([]);
    const [selectedCarreras, setSelectedCarreras] = useState<string[]>([]);
    const [selectedHabilidades, setSelectedHabilidades] = useState<string[]>([]);
    const [selectedHorasRange, setSelectedHorasRange] = useState<[number, number]>([0, 1000]);
    const [selectedEstado, setSelectedEstado] = useState<string[]>([]);
    const [selectedInstitucion, setSelectedInstitucion] = useState<string[]>([]);

    // Opciones de filtros - TODOS LOS MISMOS QUE GUARDADOS
    const [idiomasDisponibles, setIdiomasDisponibles] = useState<string[]>([]);
    const [carrerasDisponibles, setCarrerasDisponibles] = useState<string[]>([]);
    const [habilidadesDisponibles, setHabilidadesDisponibles] = useState<{ blandas: string[], tecnicas: string[] }>({ blandas: [], tecnicas: [] });
    const [institucionesDisponibles, setInstitucionesDisponibles] = useState<string[]>([]);

    // Obtener carnet - MISMA LÓGICA QUE GUARDADOS
    const obtenerCarnetUsuario = async (): Promise<string | null> => {
        try {
            const userData = await AsyncStorage.getItem("userData");
            if (userData) {
                const parsed = JSON.parse(userData);
                return parsed.carnet || null;
            }
            return null;
        } catch (err) {
            console.error("Error obteniendo carnet:", err);
            return null;
        }
    };

    // Cargar aplicaciones con filtros - MISMA LÓGICA QUE GUARDADOS
    const cargarAplicaciones = async () => {
        setLoading(true);
        try {
            const carnet = await obtenerCarnetUsuario();

            if (!carnet) {
                console.warn("⚠️ No se encontró carnet del usuario");
                setAplicaciones([]);
                return;
            }

            const queryParams = new URLSearchParams();

            // MISMA LÓGICA QUE EN GUARDADOS: append múltiple para arrays
            if (searchQuery) queryParams.append("search", searchQuery);
            selectedIdiomas.forEach(i => queryParams.append("idioma", i));
            selectedCarreras.forEach(c => queryParams.append("carrera", c));
            selectedHabilidades.forEach(h => queryParams.append("habilidad", h));
            selectedEstado.forEach(e => queryParams.append("estado", e));
            selectedInstitucion.forEach(i => queryParams.append("institucion", i));
            queryParams.append("minHoras", selectedHorasRange[0].toString());
            queryParams.append("maxHoras", selectedHorasRange[1].toString());
            queryParams.append("carnet", carnet);

            console.log("🔍 Enviando filtros:", queryParams.toString());

            const response = await fetch(`http://192.168.1.11:4000/api/aplicaciones?${queryParams.toString()}`);
            const data = await response.json();
            setAplicaciones(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando aplicaciones:", err);
            setAplicaciones([]);
        } finally {
            setLoading(false);
        }
    };

    // Cargar opciones de filtros - MISMA FUNCIÓN QUE GUARDADOS
    const cargarFiltrosDisponibles = async () => {
        try {
            const [idiomasRes, carrerasRes, habilidadesRes, institucionesRes] = await Promise.all([
                fetch("http://192.168.1.11:4000/api/proyectos/idiomas").then(r => r.json()),
                fetch("http://192.168.1.11:4000/api/proyectos/carreras").then(r => r.json()),
                fetch("http://192.168.1.11:4000/api/proyectos/habilidades").then(r => r.json()),
                fetch("http://192.168.1.11:4000/api/proyectos/instituciones").then(r => r.json())
            ]);

            setIdiomasDisponibles(Array.isArray(idiomasRes) ? idiomasRes : []);
            setCarrerasDisponibles(Array.isArray(carrerasRes) ? carrerasRes : []);

            setHabilidadesDisponibles({
                blandas: Array.isArray(habilidadesRes?.blandas) ? habilidadesRes.blandas : [],
                tecnicas: Array.isArray(habilidadesRes?.tecnicas) ? habilidadesRes.tecnicas : []
            });

            // CORRECCIÓN: Extraer solo los nombres de las instituciones
            if (Array.isArray(institucionesRes)) {
                const nombresInstituciones = institucionesRes.map(item =>
                    typeof item === 'string' ? item : item.nombre
                ).filter(nombre => nombre);
                setInstitucionesDisponibles(nombresInstituciones);
            } else {
                setInstitucionesDisponibles([]);
            }

        } catch (err) {
            console.error('Error al cargar filtros:', err);
            setIdiomasDisponibles([]);
            setCarrerasDisponibles([]);
            setHabilidadesDisponibles({ blandas: [], tecnicas: [] });
            setInstitucionesDisponibles([]);
        }
    };

    // Recargar al enfocar la pantalla - MISMA LÓGICA QUE GUARDADOS
    useFocusEffect(
        useCallback(() => {
            cargarAplicaciones();
            cargarFiltrosDisponibles();
        }, [])
    );

    // Limpiar timeout al desmontar - MISMA LÓGICA QUE GUARDADOS
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const toggleSelection = (item: string, selected: string[], setSelected: (arr: string[]) => void) => {
        if (selected.includes(item)) setSelected(selected.filter(i => i !== item));
        else setSelected([...selected, item]);
    };

    const aplicarFiltros = () => {
        setFilterModalVisible(false);
        cargarAplicaciones();
    };

    const limpiarFiltros = () => {
        setSelectedIdiomas([]);
        setSelectedCarreras([]);
        setSelectedHabilidades([]);
        setSelectedHorasRange([0, 1000]);
        setSelectedEstado([]);
        setSelectedInstitucion([]);
        // Aplicar filtros limpios inmediatamente
        cargarAplicaciones();
    };

    const renderCard = ({ item, index }: any) => {
        const palette = index % 2 === 0
            ? { color: "#FEFBEA", borderColor: "#F9DC50", button: "#FBEB9D", text: "#403E3E" }
            : { color: "#E5EDFB", borderColor: "#2666DE", button: "#85A9EC", text: "#403E3E" };

        return (
            <View style={[styles.card, { backgroundColor: palette.color, borderColor: palette.borderColor }]}>
                <TouchableOpacity
                    style={styles.cardIcon}
                    onPress={() => router.push({
                        pathname: "/(tabs)/detallesA",
                        params: {
                            idAplicacion: item.idAplicacion.toString(),
                            carnetUsuario: params.carnetUsuario,
                            nombreUsuario: params.nombreUsuario,
                            generoUsuario: params.generoUsuario
                        }
                    })}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color="#333" />
                </TouchableOpacity>

                <Text style={styles.cardTitle}>{truncateText(item.titulo, 33)}</Text>
                <Text style={styles.cardDesc}>{truncateText(item.descripcion, 110)}</Text>

                <View style={[styles.cardButton, { backgroundColor: palette.button }]}>
                    <Text style={[styles.cardButtonText, { color: palette.text }]}>{item.estado}</Text>
                </View>

                <View>
                    <Text style={styles.cardInfo}><Text style={styles.bold}>Institución: </Text>{truncateText(item.institucion, 28)}</Text>
                    <Text style={styles.cardInfo}><Text style={styles.bold}>Horas: </Text>{item.horas}</Text>
                </View>
            </View>
        );
    };

    if (loading) return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#2666DE" />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Aplicaciones</Text>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="#000"
                    onPress={() => router.back()}
                />
            </View>

            {/* Contenido */}
            <View style={styles.contentBackground}>
                <View style={styles.searchRow}>
                    <View style={styles.searchBox}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar"
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                clearTimeout(searchTimeout);
                                const timeout = setTimeout(() => cargarAplicaciones(), 500);
                                setSearchTimeout(timeout);
                            }}
                        />
                        <Ionicons name="search" size={20} color="#EAC306" style={styles.searchIconInside} />
                    </View>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setFilterModalVisible(true)}>
                        <Ionicons name="filter" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {aplicaciones.length === 0 ? (
                    <Text style={styles.emptyText}>No hay aplicaciones para mostrar</Text>
                ) : (
                    <FlatList
                        data={aplicaciones}
                        renderItem={renderCard}
                        keyExtractor={(item) => item.idAplicacion.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                    />
                )}
            </View>

            {/* Modal de filtros - TODOS LOS FILTROS DE GUARDADOS MÁS ESTADO E INSTITUCIÓN */}
            <Modal
                visible={filterModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtros</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#213A8E" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Horas */}
                            <Text style={styles.filterSectionTitle}>Horas Mínimas</Text>
                            <View style={styles.horasContainer}>
                                {[0, 25, 50, 75, 100].map(h => (
                                    <TouchableOpacity
                                        key={h}
                                        style={[
                                            styles.horasOption,
                                            { backgroundColor: selectedHorasRange[0] === h ? '#2666DE' : '#F2F6FC', borderColor: selectedHorasRange[0] === h ? '#2666DE' : '#D1D5DB' }
                                        ]}
                                        onPress={() => setSelectedHorasRange([h, 1000])}
                                    >
                                        <Text style={{ color: selectedHorasRange[0] === h ? '#fff' : '#213A8E', fontWeight: selectedHorasRange[0] === h ? 'bold' : '600', fontSize: 13 }}>{h}+</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Estado */}
                            <Text style={styles.filterSectionTitle}>Estado</Text>
                            <View style={styles.filterOptionsContainer}>
                                {['En proceso', 'Enviado', 'Aceptado', 'Rechazado'].map(e => (
                                    <TouchableOpacity
                                        key={e}
                                        style={[styles.filterOption, selectedEstado.includes(e) && styles.filterOptionSelected]}
                                        onPress={() => toggleSelection(e, selectedEstado, setSelectedEstado)}
                                    >
                                        <Ionicons name={selectedEstado.includes(e) ? "checkbox" : "square-outline"} size={20} color={selectedEstado.includes(e) ? "#2666DE" : "#666"} />
                                        <Text style={[styles.filterOptionText, selectedEstado.includes(e) && styles.filterOptionTextSelected]}>{e}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Institución */}
                            <Text style={styles.filterSectionTitle}>Institución</Text>
                            <View style={styles.filterOptionsContainer}>
                                {institucionesDisponibles.map(i => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.filterOption, selectedInstitucion.includes(i) && styles.filterOptionSelected]}
                                        onPress={() => toggleSelection(i, selectedInstitucion, setSelectedInstitucion)}
                                    >
                                        <Ionicons name={selectedInstitucion.includes(i) ? "checkbox" : "square-outline"} size={20} color={selectedInstitucion.includes(i) ? "#2666DE" : "#666"} />
                                        <Text style={[styles.filterOptionText, selectedInstitucion.includes(i) && styles.filterOptionTextSelected]}>{i}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Idiomas */}
                            <Text style={styles.filterSectionTitle}>Idiomas</Text>
                            <View style={styles.filterOptionsContainer}>
                                {idiomasDisponibles.map(idioma => (
                                    <TouchableOpacity
                                        key={idioma}
                                        style={[
                                            styles.filterOption,
                                            selectedIdiomas.includes(idioma) && styles.filterOptionSelected
                                        ]}
                                        onPress={() => toggleSelection(idioma, selectedIdiomas, setSelectedIdiomas)}
                                    >
                                        <Ionicons
                                            name={selectedIdiomas.includes(idioma) ? "checkbox" : "square-outline"}
                                            size={20}
                                            color={selectedIdiomas.includes(idioma) ? "#2666DE" : "#666"}
                                        />
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedIdiomas.includes(idioma) && styles.filterOptionTextSelected
                                        ]}>{idioma}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Carreras */}
                            <Text style={styles.filterSectionTitle}>Carreras</Text>
                            <View style={styles.filterOptionsContainer}>
                                {carrerasDisponibles.map(carrera => (
                                    <TouchableOpacity
                                        key={carrera}
                                        style={[
                                            styles.filterOption,
                                            selectedCarreras.includes(carrera) && styles.filterOptionSelected
                                        ]}
                                        onPress={() => toggleSelection(carrera, selectedCarreras, setSelectedCarreras)}
                                    >
                                        <Ionicons
                                            name={selectedCarreras.includes(carrera) ? "checkbox" : "square-outline"}
                                            size={20}
                                            color={selectedCarreras.includes(carrera) ? "#2666DE" : "#666"}
                                        />
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedCarreras.includes(carrera) && styles.filterOptionTextSelected
                                        ]}>{carrera}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Habilidades Blandas */}
                            <Text style={styles.filterSectionTitle}>Habilidades Blandas</Text>
                            <View style={styles.filterOptionsContainer}>
                                {habilidadesDisponibles.blandas?.map(habilidad => (
                                    <TouchableOpacity
                                        key={habilidad}
                                        style={[
                                            styles.filterOption,
                                            selectedHabilidades.includes(habilidad) && styles.filterOptionSelected
                                        ]}
                                        onPress={() => toggleSelection(habilidad, selectedHabilidades, setSelectedHabilidades)}
                                    >
                                        <Ionicons
                                            name={selectedHabilidades.includes(habilidad) ? "checkbox" : "square-outline"}
                                            size={20}
                                            color={selectedHabilidades.includes(habilidad) ? "#2666DE" : "#666"}
                                        />
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedHabilidades.includes(habilidad) && styles.filterOptionTextSelected
                                        ]}>{habilidad}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Habilidades Técnicas */}
                            <Text style={styles.filterSectionTitle}>Habilidades Técnicas</Text>
                            <View style={styles.filterOptionsContainer}>
                                {habilidadesDisponibles.tecnicas?.map(habilidad => (
                                    <TouchableOpacity
                                        key={habilidad}
                                        style={[
                                            styles.filterOption,
                                            selectedHabilidades.includes(habilidad) && styles.filterOptionSelected
                                        ]}
                                        onPress={() => toggleSelection(habilidad, selectedHabilidades, setSelectedHabilidades)}
                                    >
                                        <Ionicons
                                            name={selectedHabilidades.includes(habilidad) ? "checkbox" : "square-outline"}
                                            size={20}
                                            color={selectedHabilidades.includes(habilidad) ? "#2666DE" : "#666"}
                                        />
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedHabilidades.includes(habilidad) && styles.filterOptionTextSelected
                                        ]}>{habilidad}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.limpiarButton} onPress={limpiarFiltros}>
                                <Text style={styles.limpiarButtonText}>Limpiar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.aplicarButton} onPress={aplicarFiltros}>
                                <Text style={styles.aplicarButtonText}>Aplicar</Text>
                                <Ionicons name="checkmark" size={18} color="#fff" style={{ marginLeft: 5 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bottom nav */}
            <View style={styles.bottomNav}>
                <Ionicons
                    name="home-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push({
                        pathname: "/",
                        params: {
                            carnetUsuario: params.carnetUsuario,
                            nombreUsuario: params.nombreUsuario,
                            generoUsuario: params.generoUsuario
                        }
                    })}
                />
                <Ionicons
                    name="star-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push({
                        pathname: "/(tabs)/guardados",
                        params: {
                            carnetUsuario: params.carnetUsuario,
                            nombreUsuario: params.nombreUsuario,
                            generoUsuario: params.generoUsuario
                        }
                    })}
                />
                <Ionicons
                    name="file-tray"
                    size={28}
                    color="#fff"
                    onPress={() => router.push({
                        pathname: "/(tabs)/aplicaciones",
                        params: {
                            carnetUsuario: params.carnetUsuario,
                            nombreUsuario: params.nombreUsuario,
                            generoUsuario: params.generoUsuario
                        }
                    })}
                />
                <Ionicons
                    name="notifications-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push({
                        pathname: "/(tabs)/notificaciones",
                        params: {
                            carnetUsuario: params.carnetUsuario,
                            nombreUsuario: params.nombreUsuario,
                            generoUsuario: params.generoUsuario
                        }
                    })}
                />
                <Ionicons
                    name="person-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push({
                        pathname: "/(tabs)/cuenta",
                        params: {
                            carnetUsuario: params.carnetUsuario,
                            nombreUsuario: params.nombreUsuario,
                            generoUsuario: params.generoUsuario
                        }
                    })}
                />
            </View>
        </View>
    );
}

// Estilos - MANTENIENDO DISEÑO ORIGINAL
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 91, marginBottom: 20, backgroundColor: "#fff" },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#000", fontFamily: "MyriadPro-Bold" },
    contentBackground: { flex: 1, backgroundColor: "#F2F6FC", paddingBottom: 20 },
    searchRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginTop: 20, marginBottom: 15 },
    searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderLeftWidth: 12, borderLeftColor: "#2666DE", paddingHorizontal: 10, height: 45, position: "relative", shadowColor: "#2666DE", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 },
    searchInput: { flex: 1, fontFamily: "Inter-Medium", fontSize: 14, color: "#000" },
    searchIconInside: { position: "absolute", right: 10 },
    iconButton: { backgroundColor: "#F9DC50", marginLeft: 10, borderRadius: 12, width: 45, height: 45, justifyContent: "center", alignItems: "center", shadowColor: "#EAC306", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 },
    card: { width: "100%", minHeight: 200, borderRadius: 15, padding: 20, marginBottom: 15, borderWidth: 3.5, position: "relative" },
    cardIcon: { position: "absolute", top: 19, right: 13 },
    cardTitle: { fontSize: 15, fontWeight: "bold", fontFamily: "MyriadPro-Bold", marginBottom: 10, color: "#000", marginTop: 4 },
    cardDesc: { fontSize: 14, fontFamily: "MyriadPro-Regular", color: "#333", marginBottom: 12, lineHeight: 20 },
    cardButton: { position: "absolute", bottom: 0, right: 0, paddingHorizontal: 16, paddingVertical: 6, borderTopLeftRadius: 12, borderBottomRightRadius: 12 },
    cardButtonText: { fontSize: 13, fontFamily: "MyriadPro-Bold", fontWeight: "bold" },
    cardInfo: { fontSize: 13, color: "#444", marginBottom: 6, },
    bold: { fontFamily: "MyriadPro-Bold", fontWeight: "bold" },
    regular: { fontFamily: "MyriadPro-Regular" },
    bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, backgroundColor: "#2666DE", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 30, paddingTop: 20 },
    emptyText: { textAlign: 'center', color: '#666', fontStyle: 'italic', marginHorizontal: 20, marginVertical: 10, },

    // Estilos del modal (iguales a guardados)
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: screenHeight * 0.85, paddingBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#213A8E', fontFamily: 'MyriadPro-Bold' },
    modalContent: { paddingHorizontal: 20, maxHeight: screenHeight * 0.6 },
    filterSectionTitle: { fontSize: 16, fontWeight: '600', color: '#213A8E', marginTop: 20, marginBottom: 12, fontFamily: 'MyriadPro-Bold' },
    filterOptionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    filterOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    filterOptionSelected: { backgroundColor: '#E5EDFB', borderColor: '#2666DE' },
    filterOptionText: { marginLeft: 6, fontSize: 14, fontFamily: 'MyriadPro-Regular', color: '#666' },
    filterOptionTextSelected: { color: '#213A8E', fontWeight: '600' },
    horasContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, marginBottom: 20 },
    horasOption: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 2, minWidth: 55, alignItems: 'center' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10, gap: 12 },
    limpiarButton: { backgroundColor: '#F2F6FC', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, flex: 1, alignItems: 'center', borderWidth: 2, borderColor: '#2666DE' },
    limpiarButtonText: { color: '#2666DE', fontWeight: 'bold', fontSize: 15, fontFamily: 'MyriadPro-Bold' },
    aplicarButton: { backgroundColor: '#2666DE', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, flex: 2, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    aplicarButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, fontFamily: 'MyriadPro-Bold' },
});
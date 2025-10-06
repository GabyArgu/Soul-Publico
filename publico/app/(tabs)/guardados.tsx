// app/(main)/Guardados.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getUserData, UserData } from '../utils/session';


interface Proyecto {
    idProyecto: number;
    titulo: string;
    descripcion: string;
    capacidad: number;
    horas: number;
    tipoProyecto: string;
    carrerasRelacionadas: string;
    habilidadesRelacionadas: string;
    idiomasRelacionados: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Guardados() {

    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const data = await getUserData();
            if (data) setUserData(data);
            else router.replace('/(auth)/Login');
        };
        loadUser();
    }, []);



    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = "https://888f4c9ee1eb.ngrok-free.app/api";

    const [searchQuery, setSearchQuery] = useState("");
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<any>();

    const [idiomasDisponibles, setIdiomasDisponibles] = useState<string[]>([]);
    const [carrerasDisponibles, setCarrerasDisponibles] = useState<string[]>([]);
    const [modalidadesDisponibles, setModalidadesDisponibles] = useState<string[]>([]);

    // Agrupar carreras por tipo
    const carrerasAgrupadas = {
        tecnicos: carrerasDisponibles.filter(c => c.toLowerCase().includes('técnico') || c.toLowerCase().includes('tecnico')),
        ingenierias: carrerasDisponibles.filter(c => c.toLowerCase().includes('ingeniería') || c.toLowerCase().includes('ingenieria')),
        licenciaturas: carrerasDisponibles.filter(c =>
            !c.toLowerCase().includes('técnico') &&
            !c.toLowerCase().includes('tecnico') &&
            !c.toLowerCase().includes('ingeniería') &&
            !c.toLowerCase().includes('ingenieria')
        )
    };

    const [selectedIdiomas, setSelectedIdiomas] = useState<string[]>([]);
    const [selectedCarreras, setSelectedCarreras] = useState<string[]>([]);
    const [selectedHorasRange, setSelectedHorasRange] = useState<[number, number]>([0, 1000]);
    const [selectedModalidades, setSelectedModalidades] = useState<string[]>([]);

    const [carrerasExpandidas, setCarrerasExpandidas] = useState({
        tecnicos: false,
        ingenierias: false,
        licenciaturas: false
    });

    const router = useRouter();


    useEffect(() => {
        if (userData?.carnet) {
            cargarProyectosGuardados();
        }
    }, [userData]);

    // Función corregida para cargar proyectos
    const cargarProyectosGuardados = async () => {
        if (!userData?.carnet) return;

        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.append("search", searchQuery);
            selectedIdiomas.forEach(i => queryParams.append("idioma", i));
            selectedCarreras.forEach(c => queryParams.append("carrera", c));
            selectedModalidades.forEach(m => queryParams.append("modalidad", m)); // ✅ AGREGAR ESTA LÍNEA
            queryParams.append("minHoras", selectedHorasRange[0].toString());
            queryParams.append("maxHoras", selectedHorasRange[1].toString());
            queryParams.append("carnet", userData.carnet);

            const response = await fetch(`${API_URL}/proyectos-guardados/?${queryParams.toString()}`);
            const data = await response.json();
            setProyectos(data);
        } catch (err) {
            console.error('Error al cargar proyectos guardados:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar opciones de filtros (misma función que en Index)
    const cargarFiltrosDisponibles = async () => {
        try {
            const [idiomasRes, carrerasRes, modalidadesRes] = await Promise.all([
                fetch(`${API_URL}/proyectos/idiomas`).then(r => r.json()),
                fetch(`${API_URL}/proyectos/carreras`).then(r => r.json()),
                fetch(`${API_URL}/proyectos/modalidades`).then(r => r.json())
            ]);

            setIdiomasDisponibles(Array.isArray(idiomasRes) ? idiomasRes : []);
            setCarrerasDisponibles(Array.isArray(carrerasRes) ? carrerasRes : []);
            setModalidadesDisponibles(Array.isArray(modalidadesRes) ? modalidadesRes.map((m: any) => m.nombre) : []);

        } catch (err) {
            console.error('Error al cargar filtros:', err);
            setIdiomasDisponibles([]);
            setCarrerasDisponibles([]);
            setModalidadesDisponibles([]);
        }
    };


    // Recargar datos cuando la pantalla recibe foco
    useFocusEffect(
        useCallback(() => {
            cargarProyectosGuardados();
            cargarFiltrosDisponibles();
        }, [])
    );

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Filtrar proyectos por tipo
    const proyectosInstitucionales = proyectos.filter(p => p.tipoProyecto === "Institucional");
    const proyectosExternos = proyectos.filter(p => p.tipoProyecto === "Externo");

    const toggleSelection = (item: string, selected: string[], setSelected: (arr: string[]) => void) => {
        if (selected.includes(item)) {
            setSelected(selected.filter(i => i !== item));
        } else {
            setSelected([...selected, item]);
        }
    };

    const toggleCarreraGroup = (group: keyof typeof carrerasExpandidas) => {
        setCarrerasExpandidas(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    const aplicarFiltros = () => {
        setFilterModalVisible(false);
        cargarProyectosGuardados();
    };

    const limpiarFiltros = () => {
        setSelectedIdiomas([]);
        setSelectedCarreras([]);
        setSelectedModalidades([]);
        setSelectedHorasRange([0, 1000]);
        setCarrerasExpandidas({
            tecnicos: false,
            ingenierias: false,
            licenciaturas: false
        });
    };

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const renderCard = ({ item, index, type }: any) => {
        const yellow = { color: "#FEFBEA", borderColor: "#F9DC50", button: "#FBEB9D", text: "#403E3E" };
        const blue = { color: "#E5EDFB", borderColor: "#2666DE", button: "#85A9EC", text: "#403E3E" };

        let palette;
        if (type === "institucional") palette = (index % 2 === 0) ? yellow : blue;
        else palette = (index % 2 === 0) ? blue : yellow;

        return (
            <View style={[styles.card, { backgroundColor: palette.color, borderColor: palette.borderColor }]}>
                <Ionicons name="book-outline" size={20} color="#333" style={styles.cardIcon} />
                <Text style={styles.cardTitle}>{truncateText(item.titulo, 22)}</Text>
                <Text style={styles.cardDesc}>{truncateText(item.descripcion, 100)}</Text>
                <View style={styles.cardRow}>
                    <Text style={styles.cardInfo}><Text style={styles.bold}>Capacidad: </Text><Text style={styles.regular}>{item.capacidad}</Text></Text>
                    <Text style={styles.cardInfo}><Text style={styles.bold}>Horas: </Text><Text style={styles.regular}>{item.horas}</Text></Text>
                </View>
                <TouchableOpacity
                    style={[styles.cardButton, { backgroundColor: palette.button }]}
                    onPress={() => router.push({
                        pathname: "/(tabs)/detalles",
                        params: {
                            idProyecto: item.idProyecto.toString(),
                            carnetUsuario: userData?.carnet,
                            nombreUsuario: userData?.nombreCompleto,
                            generoUsuario: userData?.genero
                        }
                    })}
                >
                    <Text style={[styles.cardButtonText, { color: palette.text }]}>Detalles</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2666DE" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Proyectos Guardados</Text>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="#000"
                    onPress={() => router.back()}
                />
            </View>

            {/* Fondo de todo lo demás */}
            <View style={styles.contentBackground}>
                {/* Buscador + Botones */}
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
                                const timeout = setTimeout(() => {
                                    cargarProyectosGuardados();
                                }, 500);
                                setSearchTimeout(timeout);
                            }}
                        />
                        <Ionicons name="search" size={20} color="#EAC306" style={styles.searchIconInside} />
                    </View>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setFilterModalVisible(true)}>
                        <Ionicons name="filter" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView>
                    {/* Institucionales */}
                    <Text style={styles.sectionTitle}>Institucionales</Text>
                    {proyectosInstitucionales.length > 0 ? (
                        <View style={styles.carouselContainer}>
                            <FlatList
                                data={proyectosInstitucionales}
                                renderItem={({ item, index }) => renderCard({ item, index, type: "institucional" })}
                                keyExtractor={(item) => item.idProyecto.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.carouselContent}
                            />
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No hay proyectos institucionales guardados</Text>
                    )}

                    {/* Externas */}
                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Externas</Text>
                    {proyectosExternos.length > 0 ? (
                        <View style={styles.carouselContainer}>
                            <FlatList
                                data={proyectosExternos}
                                renderItem={({ item, index }) => renderCard({ item, index, type: "externa" })}
                                keyExtractor={(item) => item.idProyecto.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.carouselContent}
                            />
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No hay proyectos externos guardados</Text>
                    )}
                </ScrollView>
            </View>

            {/* Modal de Filtros Mejorado */}
            {/* Modal de Filtros Mejorado */}
            <Modal
                visible={filterModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Header del Modal */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtros</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setFilterModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#213A8E" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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

                            {/* Modalidades - NUEVO FILTRO */}
                            <Text style={styles.filterSectionTitle}>Modalidades</Text>
                            <View style={styles.filterOptionsContainer}>
                                {modalidadesDisponibles.map(modalidad => (
                                    <TouchableOpacity
                                        key={modalidad}
                                        style={[
                                            styles.filterOption,
                                            selectedModalidades.includes(modalidad) && styles.filterOptionSelected
                                        ]}
                                        onPress={() => toggleSelection(modalidad, selectedModalidades, setSelectedModalidades)}
                                    >
                                        <Ionicons
                                            name={selectedModalidades.includes(modalidad) ? "checkbox" : "square-outline"}
                                            size={20}
                                            color={selectedModalidades.includes(modalidad) ? "#2666DE" : "#666"}
                                        />
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedModalidades.includes(modalidad) && styles.filterOptionTextSelected
                                        ]}>{modalidad}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Carreras Agrupadas - MEJORADO */}
                            <Text style={styles.filterSectionTitle}>Carreras</Text>

                            {/* Técnicos */}
                            <TouchableOpacity
                                style={styles.carreraGroupHeader}
                                onPress={() => toggleCarreraGroup('tecnicos')}
                            >
                                <Text style={styles.carreraGroupTitle}>Técnicos </Text>
                                <Ionicons
                                    name={carrerasExpandidas.tecnicos ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#213A8E"
                                />
                            </TouchableOpacity>
                            {carrerasExpandidas.tecnicos && (
                                <View style={styles.filterOptionsContainer}>
                                    {carrerasAgrupadas.tecnicos.map(carrera => (
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
                            )}

                            {/* Ingenierías */}
                            <TouchableOpacity
                                style={styles.carreraGroupHeader}
                                onPress={() => toggleCarreraGroup('ingenierias')}
                            >
                                <Text style={styles.carreraGroupTitle}>Ingenierías </Text>
                                <Ionicons
                                    name={carrerasExpandidas.ingenierias ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#213A8E"
                                />
                            </TouchableOpacity>
                            {carrerasExpandidas.ingenierias && (
                                <View style={styles.filterOptionsContainer}>
                                    {carrerasAgrupadas.ingenierias.map(carrera => (
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
                            )}

                            {/* Licenciaturas */}
                            <TouchableOpacity
                                style={styles.carreraGroupHeader}
                                onPress={() => toggleCarreraGroup('licenciaturas')}
                            >
                                <Text style={styles.carreraGroupTitle}>Licenciaturas </Text>
                                <Ionicons
                                    name={carrerasExpandidas.licenciaturas ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#213A8E"
                                />
                            </TouchableOpacity>
                            {carrerasExpandidas.licenciaturas && (
                                <View style={styles.filterOptionsContainer}>
                                    {carrerasAgrupadas.licenciaturas.map(carrera => (
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
                            )}

                            {/* Rango de Horas */}
                            <Text style={styles.filterSectionTitle}>Horas Mínimas</Text>
                            <View style={styles.horasContainer}>
                                {[0, 25, 50, 75, 100].map(horas => (
                                    <TouchableOpacity
                                        key={horas}
                                        style={[
                                            styles.horasOption,
                                            {
                                                backgroundColor: selectedHorasRange[0] === horas ? '#2666DE' : '#F2F6FC',
                                                borderColor: selectedHorasRange[0] === horas ? '#2666DE' : '#D1D5DB'
                                            }
                                        ]}
                                        onPress={() => setSelectedHorasRange([horas, 1000])}
                                    >
                                        <Text style={{
                                            color: selectedHorasRange[0] === horas ? '#fff' : '#213A8E',
                                            fontWeight: selectedHorasRange[0] === horas ? 'bold' : '600',
                                            fontSize: 13
                                        }}>
                                            {horas}+
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Botones del Modal */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.limpiarButton}
                                onPress={limpiarFiltros}
                            >
                                <Text style={styles.limpiarButtonText}>Limpiar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.aplicarButton}
                                onPress={aplicarFiltros}
                            >
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
                            carnetUsuario: userData?.carnet,
                            nombreUsuario: userData?.nombreCompleto,
                            generoUsuario: userData?.genero
                        }
                    })}
                />
                <Ionicons
                    name="star"
                    size={28}
                    color="#fff"
                    onPress={() => router.push({
                        pathname: "/(tabs)/guardados",
                        params: {
                            carnetUsuario: userData?.carnet,
                            nombreUsuario: userData?.nombreCompleto,
                            generoUsuario: userData?.genero
                        }
                    })}
                />
                <Ionicons
                    name="file-tray-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push({
                        pathname: "/(tabs)/aplicaciones",
                        params: {
                            carnetUsuario: userData?.carnet,
                            nombreUsuario: userData?.nombreCompleto,
                            generoUsuario: userData?.genero
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
                            carnetUsuario: userData?.carnet,
                            nombreUsuario: userData?.nombreCompleto,
                            generoUsuario: userData?.genero
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
                            carnetUsuario: userData?.carnet,
                            nombreUsuario: userData?.nombreCompleto,
                            generoUsuario: userData?.genero
                        }
                    })}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        marginHorizontal: 20,
        marginVertical: 10,
    },
    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 65,
        marginBottom: 20,
        backgroundColor: "#fff"
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        fontFamily: "MyriadPro-Bold"
    },

    // Fondo de contenido
    contentBackground: {
        flex: 1,
        backgroundColor: "#F2F6FC",
        paddingBottom: 20,
    },

    // Buscador + botones
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 15,
    },
    searchBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderLeftWidth: 12,
        borderLeftColor: "#2666DE",
        paddingHorizontal: 10,
        height: 45,
        position: "relative",
        shadowColor: "#2666DE",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    },
    searchInput: {
        flex: 1,
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: "#000",
    },
    searchIconInside: {
        position: "absolute",
        right: 10,
    },
    iconButton: {
        backgroundColor: "#F9DC50",
        marginLeft: 10,
        borderRadius: 12,
        width: 45,
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#EAC306",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    },

    // Secciones
    sectionTitle: {
        fontSize: 19,
        fontFamily: "MyriadPro-Bold",
        fontWeight: "bold",
        color: "#213A8E",
        marginHorizontal: 20,
        marginVertical: 10,
    },

    // Carruseles
    carouselContainer: {
        height: 250,
        marginBottom: 10,
    },
    carouselContent: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    // Cards
    card: {
        width: 260,
        minHeight: 210,
        borderRadius: 15,
        padding: 15,
        marginHorizontal: 10,
        borderWidth: 3.5,
        position: "relative",
    },
    cardIcon: {
        position: "absolute",
        top: 19,
        right: 13,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "bold",
        fontFamily: "MyriadPro-Bold",
        marginBottom: 10,
        color: "#000",
        marginTop: 4,
    },
    cardDesc: {
        fontSize: 14,
        fontFamily: "MyriadPro-Regular",
        color: "#333",
        marginBottom: 12,
        lineHeight: 18,
    },
    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    cardInfo: {
        fontSize: 13,
        color: "#444",
    },
    bold: {
        fontFamily: "MyriadPro-Bold",
        fontWeight: "bold",
    },
    regular: {
        fontFamily: "MyriadPro-Regular",
    },
    cardButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderTopLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    cardButtonText: {
        fontSize: 13,
        fontFamily: "MyriadPro-Bold",
        fontWeight: "bold",
    },

    // Bottom nav
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

    // Modal Styles Mejorados
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        maxHeight: screenHeight * 0.85,
        paddingBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#213A8E',
        fontFamily: 'MyriadPro-Bold',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        paddingHorizontal: 20,
        maxHeight: screenHeight * 0.6,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#213A8E',
        marginTop: 20,
        marginBottom: 12,
        fontFamily: 'MyriadPro-Bold',
    },
    filterOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterOptionSelected: {
        backgroundColor: '#E5EDFB',
        borderColor: '#2666DE',
    },
    filterOptionText: {
        marginLeft: 6,
        fontSize: 14,
        fontFamily: 'MyriadPro-Regular',
        color: '#666',
    },
    filterOptionTextSelected: {
        color: '#213A8E',
        fontWeight: '600',
    },
    horasContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
        marginBottom: 20,
    },
    horasOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        minWidth: 55,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
        gap: 12,
    },
    limpiarButton: {
        backgroundColor: '#F2F6FC',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2666DE',
    },
    limpiarButtonText: {
        color: '#2666DE',
        fontWeight: 'bold',
        fontSize: 15,
        fontFamily: 'MyriadPro-Bold',
    },
    aplicarButton: {
        backgroundColor: '#2666DE',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        flex: 2,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: "#2666DE",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    aplicarButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
        fontFamily: 'MyriadPro-Bold',
    },
    carreraGroupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F2F6FC',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    carreraGroupTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#213A8E',
        fontFamily: 'MyriadPro-Bold',
    },
});
// app/(main)/Index.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, ScrollView, Modal, ActivityIndicator, Dimensions } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
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

export default function Index() {
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
    const loadUser = async () => {
        const data = await getUserData();
        if (data) setUserData(data);
        else router.replace('/(auth)/Login'); // Redirige a login si no hay sesión
    };
    loadUser();
        }, []);


    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<any>();

    const API_URL = "https://d06a6c5dfc30.ngrok-free.app/api";

    const [idiomasDisponibles, setIdiomasDisponibles] = useState<string[]>([]);
    const [carrerasDisponibles, setCarrerasDisponibles] = useState<string[]>([]);
    const [habilidadesDisponibles, setHabilidadesDisponibles] = useState<{ blandas: string[], tecnicas: string[] }>({ blandas: [], tecnicas: [] });

    const [selectedIdiomas, setSelectedIdiomas] = useState<string[]>([]);
    const [selectedCarreras, setSelectedCarreras] = useState<string[]>([]);
    const [selectedHabilidades, setSelectedHabilidades] = useState<string[]>([]);
    const [selectedHorasRange, setSelectedHorasRange] = useState<[number, number]>([0, 1000]);


    const procesarNombre = (nombre: string) => {
        const palabras = nombre.trim().split(" ");
        if (palabras.length === 1) return palabras[0];
        const primerNombre = palabras[0];
        const apellido = palabras[palabras.length - 1];
        return `${primerNombre} ${apellido}`;
    };

    const nombre = userData ? procesarNombre(userData.nombreCompleto) : "";
    const carnet = userData?.carnet;
    const genero = userData?.genero;


    const obtenerSaludo = (genero: string) => {
        switch (genero) {
            case 'F': return '¡Bienvenida';
            case 'M': return '¡Bienvenido';
            default: return '¡Bienvenido/a';
        }
    };

    const obtenerAvatar = (genero: string) => {
        switch (genero) {
            case 'F': return require("../../assets/images/avatar.png");
            case 'M': return require("../../assets/images/avatar2.png");
            default: return require("../../assets/images/avatar3.png");
        }
    };

    const saludo = obtenerSaludo(genero || "O"); 
const avatar = obtenerAvatar(genero || "O");

    const router = useRouter();

    // Cargar proyectos con filtros
    const cargarProyectos = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            selectedIdiomas.forEach(i => params.append("idioma", i));
            selectedCarreras.forEach(c => params.append("carrera", c));
            selectedHabilidades.forEach(h => params.append("habilidad", h));
            params.append("minHoras", selectedHorasRange[0].toString());
            params.append("maxHoras", selectedHorasRange[1].toString());

            const response = await fetch(`${API_URL}/proyectos?${params.toString()}`);

            const data = await response.json();

            setProyectos(data);
        } catch (err) {
            console.error('Error al cargar proyectos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar opciones de filtros
    const cargarFiltrosDisponibles = async () => {
        try {
            const [idiomasRes, carrerasRes, habilidadesRes] = await Promise.all([
                fetch(`${API_URL}/proyectos/idiomas`).then(r => r.json()),
                fetch(`${API_URL}/proyectos/carreras`).then(r => r.json()),
                fetch(`${API_URL}/proyectos/habilidades`).then(r => r.json())
            ]);


            // VERIFICACIÓN CLAVE: Asegurar que la respuesta es un array (o usar [])
            setIdiomasDisponibles(Array.isArray(idiomasRes) ? idiomasRes : []);
            setCarrerasDisponibles(Array.isArray(carrerasRes) ? carrerasRes : []);

            // Asegurar que las habilidades tienen la estructura correcta
            setHabilidadesDisponibles({
                blandas: Array.isArray(habilidadesRes?.blandas) ? habilidadesRes.blandas : [],
                tecnicas: Array.isArray(habilidadesRes?.tecnicas) ? habilidadesRes.tecnicas : []
            });

        } catch (err) {
            console.error('Error al cargar filtros:', err);
            // Opcional: Establecer todos los estados a vacíos en caso de fallo total
            setIdiomasDisponibles([]);
            setCarrerasDisponibles([]);
            setHabilidadesDisponibles({ blandas: [], tecnicas: [] });
        }
    };

    // Recargar datos cuando la pantalla recibe foco
    useFocusEffect(
        useCallback(() => {
            cargarProyectos();
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

    const aplicarFiltros = () => {
        setFilterModalVisible(false);
        cargarProyectos();
    };

    const limpiarFiltros = () => {
        setSelectedIdiomas([]);
        setSelectedCarreras([]);
        setSelectedHabilidades([]);
        setSelectedHorasRange([0, 200]);
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
                <View>
                    <Text style={styles.hola}>{saludo},</Text>
                    <Text style={styles.nombre}>{nombre}</Text>
                </View>
                <Image source={avatar} style={styles.avatar} />
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
                                    cargarProyectos();
                                }, 500);
                                setSearchTimeout(timeout); // Ahora acepta el 'number' sin error
                            }}
                        />
                        <Ionicons name="search" size={20} color="#EAC306" style={styles.searchIconInside} />
                    </View>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="add" size={22} color="#fff" onPress={() => router.push({
                            pathname: "/(tabs)/proyecto",
                            params: {
                                carnetUsuario: userData?.carnet,
nombreUsuario: userData?.nombreCompleto,
generoUsuario: userData?.genero
                            }
                        })} />
                    </TouchableOpacity>
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
                        <Text style={styles.emptyText}>No hay proyectos institucionales disponibles</Text>
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
                        <Text style={styles.emptyText}>No hay proyectos externos disponibles</Text>
                    )}
                </ScrollView>
            </View>

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
                                        onPress={() => setSelectedHorasRange([horas, 200])}
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
                    name="home"
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
                    name="star-outline"
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
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 65,
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    hola: {
        fontSize: 16,
        color: "#555",
        fontFamily: "MyriadPro-Regular",
    },
    nombre: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        fontFamily: "MyriadPro-Bold",
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 22,
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
});
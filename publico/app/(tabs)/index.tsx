// app/(main)/Index.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";

interface Proyecto {
  idProyecto: number;
  titulo: string;
  descripcion: string;
  capacidad: number;
  horas: number;
  tipoProyecto: string;
}

export default function Index() {
    const params = useLocalSearchParams();
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);

    const rawNombreParam = params.nombreUsuario;
    const rawNombre = Array.isArray(rawNombreParam) ? rawNombreParam[0] : rawNombreParam || "Gabriela";
    
    const generoParam = params.generoUsuario;
    const genero = Array.isArray(generoParam) ? generoParam[0] : generoParam || "O";

    const procesarNombre = (nombre: string) => {
        const palabras = nombre.trim().split(" ");
        if (palabras.length === 1) return palabras[0];
        const primerNombre = palabras[0];
        const apellido = palabras[palabras.length - 1];
        return `${primerNombre} ${apellido}`;
    };

    const nombre = procesarNombre(rawNombre);

    const obtenerSaludo = (genero: string) => {
        switch(genero) {
            case 'F': return '¡Bienvenida';
            case 'M': return '¡Bienvenido';
            default: return '¡Bienvenido/a';
        }
    };

    const obtenerAvatar = (genero: string) => {
        switch(genero) {
            case 'F': return require("../../assets/images/avatar.png");
            case 'M': return require("../../assets/images/avatar2.png");
            default: return require("../../assets/images/avatar3.png");
        }
    };

    const saludo = obtenerSaludo(genero); 
    const avatar = obtenerAvatar(genero); 

    const router = useRouter();

    // Cargar proyectos desde la API
    useEffect(() => {
        const cargarProyectos = async () => {
            try {
                const response = await fetch('http://192.168.1.11:4000/api/proyectos');
                const data = await response.json();
                setProyectos(data);
            } catch (error) {
                console.error('Error al cargar proyectos:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarProyectos();
    }, []);

    // Filtrar proyectos por tipo
    const proyectosInstitucionales = proyectos.filter(proyecto => 
        proyecto.tipoProyecto === 'Institucional'
    );
    
    const proyectosExternos = proyectos.filter(proyecto => 
        proyecto.tipoProyecto === 'Externo'
    );

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
                            idProyecto: item.idProyecto.toString()
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
                <Text>Cargando proyectos...</Text>
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
                        <TextInput style={styles.searchInput} placeholder="Buscar" placeholderTextColor="#666" />
                        <Ionicons name="search" size={20} color="#EAC306" style={styles.searchIconInside} />
                    </View>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="add" size={22} color="#fff" onPress={() => router.push("/(tabs)/proyecto")} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="filter" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView>
                    {/* Institucionales */}
                    <Text style={styles.sectionTitle}>Institucionales</Text>
                    {proyectosInstitucionales.length > 0 ? (
                        <FlatList
                            data={proyectosInstitucionales}
                            renderItem={({ item, index }) => renderCard({ item, index, type: "institucional" })}
                            keyExtractor={(item) => item.idProyecto.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    ) : (
                        <Text style={styles.emptyText}>No hay proyectos institucionales disponibles</Text>
                    )}

                    {/* Externas */}
                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Externas</Text>
                    {proyectosExternos.length > 0 ? (
                        <FlatList
                            data={proyectosExternos}
                            renderItem={({ item, index }) => renderCard({ item, index, type: "externa" })}
                            keyExtractor={(item) => item.idProyecto.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    ) : (
                        <Text style={styles.emptyText}>No hay proyectos externos disponibles</Text>
                    )}
                </ScrollView>
            </View>

            {/* Bottom nav */}
            <View style={styles.bottomNav}>
                <Ionicons
                    name="home"
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
                    name="cloud-outline"
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
                    name="file-tray-outline"
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
});
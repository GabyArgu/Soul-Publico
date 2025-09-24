// app/(main)/Guardados.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Guardados() {
    const router = useRouter();

    const institucionales = [
        { id: "1", titulo: "Agenda Cultural (Audiovisual)", descripcion: "Elaboración de una agenda en formato audiovisual para difundir actividades artísticas y comunitarias.", capacidad: 2, horas: 50 },
        { id: "2", titulo: "Programa de English+", descripcion: "Iniciativa educativa para el aprendizaje del inglés mediante talleres y clases de refuerzo.", capacidad: 5, horas: 45 },
    ];

    const externas = [
        { id: "3", titulo: "Soporte a Registro de Profesionales", descripcion: "Proyecto orientado a la asistencia en la gestión y actualización del registro de profesionales.", capacidad: 3, horas: 100 },
        { id: "4", titulo: "Jornadas de voluntariado", descripcion: "Actividades de apoyo comunitario y promoción social en el marco de la Feria SSE 2024.", capacidad: 10, horas: 40 },
    ];

    const truncateText = (text: string, maxLength: number) => {
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
                <TouchableOpacity style={[styles.cardButton, { backgroundColor: palette.button }]}>
                    <Text style={[styles.cardButtonText, { color: palette.text }]}>Detalles</Text>
                </TouchableOpacity>
            </View>
        );
    };


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Proyecto Guardados</Text>
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
                        <TextInput style={styles.searchInput} placeholder="Buscar" placeholderTextColor="#666" />
                        <Ionicons name="search" size={20} color="#EAC306" style={styles.searchIconInside} />
                    </View>
                    <TouchableOpacity style={styles.iconButton}><Ionicons name="filter" size={22} color="#fff" /></TouchableOpacity>
                </View>

                <ScrollView>
                    {/* Institucionales */}
                    <Text style={styles.sectionTitle}>Institucionales</Text>
                    <FlatList
                        data={institucionales}
                        renderItem={({ item, index }) => renderCard({ item, index, type: "institucional" })}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />

                    {/* Externas */}
                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Externas</Text>
                    <FlatList
                        data={externas}
                        renderItem={({ item, index }) => renderCard({ item, index, type: "externa" })}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </ScrollView>
            </View>

            {/* Bottom nav */}
            <View style={styles.bottomNav}>
                <Ionicons
                    name="home-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/")}
                />
                <Ionicons
                    name="star"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/guardados")}
                />
                <Ionicons
                    name="file-tray-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/aplicaciones")}
                />
                <Ionicons
                    name="notifications-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/notificaciones")}
                />
                <Ionicons
                    name="person-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/cuenta")}
                />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 91,
        marginBottom: 20,
        backgroundColor: "#fff"
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        fontFamily: "MyriadPro-Bold"
    },
    contentBackground: {
        flex: 1,
        backgroundColor: "#F2F6FC",
        paddingBottom: 20
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 15
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
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    },
    searchInput: {
        flex: 1,
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: "#000"
    },
    searchIconInside: {
        position: "absolute",
        right: 10
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
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    },
    sectionTitle: {
        fontSize: 19,
        fontFamily: "MyriadPro-Bold",
        fontWeight: "bold",
        color: "#213A8E",
        marginHorizontal: 20,
        marginVertical: 10,
    },
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
        right: 13
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
        color: "#444"
    },
    bold: {
        fontFamily: "MyriadPro-Bold",
        fontWeight: "bold"
    },
    regular: {
        fontFamily: "MyriadPro-Regular"
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
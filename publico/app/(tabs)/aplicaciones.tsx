// app/(main)/Aplicaciones.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Aplicaciones() {
    const router = useRouter();

    const aplicaciones = [
        { id: "1", titulo: "Apoyo en coordinación y logística de eventos para el área de posgrados", descripcion: "Proyecto orientado a la planificación, organización y asistencia en actividades académicas. Se requiere personal de apoyo para gestión logística y administrativa.", institucion: "Campus Soyapango UDB", horas: 50, estado: "En proceso" },
        { id: "2", titulo: "Programa de English+", descripcion: "Iniciativa educativa para el aprendizaje del inglés mediante talleres y clases de refuerzo.", institucion: "Pangudb", horas: 45, estado: "Enviado" },
        { id: "3", titulo: "Soporte a Registro de Profesionales", descripcion: "Proyecto orientado a la asistencia en la gestión y actualización del registro de profesionales.", institucion: "Campus San Salvador UDB", horas: 100, estado: "En proceso" },
        { id: "4", titulo: "Jornadas de voluntariado", descripcion: "Actividades de apoyo comunitario y promoción social en el marco de la Feria SSE 2024.", institucion: "Pangudb", horas: 40, estado: "Enviado" },
    ];

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const renderCard = ({ item, index }: any) => {
        const palette = index % 2 === 0
            ? { color: "#FEFBEA", borderColor: "#F9DC50", button: "#FBEB9D", text: "#403E3E" }
            : { color: "#E5EDFB", borderColor: "#2666DE", button: "#85A9EC", text: "#403E3E" };

        return (
            <View style={[styles.card, { backgroundColor: palette.color, borderColor: palette.borderColor }]}>
                {/* Icono de 3 puntos verticales */}
                <TouchableOpacity style={styles.cardIcon}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#333" />
                </TouchableOpacity>

                <Text style={styles.cardTitle}>{truncateText(item.titulo, 33)}</Text>
                <Text style={styles.cardDesc}>{truncateText(item.descripcion, 110)}</Text>

                <View style={[styles.cardButton, { backgroundColor: palette.button }]}>
                    <Text style={[styles.cardButtonText, { color: palette.text }]}>{item.estado}</Text>
                </View>

                {/* Institución y horas debajo del botón */}
                <View>
                    <Text style={styles.cardInfo}><Text style={styles.bold}>Institución: </Text>{truncateText(item.institucion, 28)}</Text>
                    <Text style={styles.cardInfo}><Text style={styles.bold}>Horas: </Text>{item.horas}</Text>
                </View>
            </View>
        );
    };

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
                        <TextInput style={styles.searchInput} placeholder="Buscar" placeholderTextColor="#666" />
                        <Ionicons name="search" size={20} color="#EAC306" style={styles.searchIconInside} />
                    </View>
                    <TouchableOpacity style={styles.iconButton}><Ionicons name="filter" size={22} color="#fff" /></TouchableOpacity>
                </View>

                <FlatList
                    data={aplicaciones}
                    renderItem={renderCard}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                />
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
                    name="star-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/guardados")}
                />
                <Ionicons
                    name="file-tray"
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
});

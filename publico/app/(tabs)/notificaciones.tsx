// app/(main)/Notificaciones.tsx
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Notificaciones() {
    const router = useRouter();

    const notificaciones = [
        { id: "1", tipo: "recordatorio", titulo: "¡Recordatorio!", descripcion: "Recuerda mantener tu información actualizada ciclo a ciclo.", tiempo: "23 min" },
        { id: "2", tipo: "aplicacion", titulo: "¡Revisa tu aplicación!", descripcion: "Revisa tu aplicación Instructorias CVV, su estado cambió a Aprobado", tiempo: "55 min" },
    ];

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case "recordatorio": return "time-outline";
            case "aplicacion": return "document-text-outline";
            default: return "notifications-outline";
        }
    };

    const renderNotificacion = ({ item, index }: any) => {
        const palette = index % 2 === 0
            ? { bg: "#E5EDFB", border: "#2666DE" }
            : { bg: "#FEFBEA", border: "#F9DC50" };

        const iconName = getIcon(item.tipo);

        return (
            <View style={[styles.card, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                {/* Icono (reemplaza los tres puntos) en la esquina superior derecha.
                    El color del icono coincide con el color del borde */}
                <TouchableOpacity style={styles.cardIcon} activeOpacity={0.7}>
                    <Ionicons name={iconName} size={25} color={palette.border} />
                </TouchableOpacity>

                {/* Contenido */}
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardDesc}>{item.descripcion}</Text>

                {/* Tiempo en esquina inferior derecha */}
                <View style={styles.cardTimeBox}>
                    <Text style={styles.cardTime}>{item.tiempo}</Text>
                </View>
            </View>
        );
    };

    // Footer: mostrar '...' cuando no hay más notificaciones (ej.: de momento <= 2)
    const footerComponent = notificaciones.length <= 2 ? (
        <Text style={styles.footerDots}>...</Text>
    ) : null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notificaciones</Text>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="#000"
                    onPress={() => router.back()}
                />
            </View>

            {/* Lista de notificaciones */}
            <View style={styles.contentBackground}>
                <FlatList
                    data={notificaciones}
                    renderItem={renderNotificacion}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                    ListFooterComponent={footerComponent}
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
                    name="file-tray-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/aplicaciones")}
                />
                <Ionicons
                    name="notifications"
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
    contentBackground: { flex: 1, backgroundColor: "#F2F6FC", paddingBottom: 10, paddingTop: 20, },
    card: { width: "100%", minHeight: 100, borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 2.5, position: "relative" },
    cardIcon: { position: "absolute", top: 12, right: 12 },
    cardTitle: { fontSize: 15, fontWeight: "bold", fontFamily: "MyriadPro-Bold", marginBottom: 6, color: "#000" },
    cardDesc: { fontSize: 14, fontFamily: "MyriadPro-Regular", color: "#333", marginBottom: 10 },
    cardTimeBox: { position: "absolute", bottom: 8, right: 12, backgroundColor: "transparent" },
    cardTime: { fontSize: 12, color: "#666", fontFamily: "MyriadPro-Regular" },
    footerDots: { textAlign: "center", fontSize: 22, color: "#999", marginTop: 10, fontWeight: "bold", },
    bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, backgroundColor: "#2666DE", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 30, paddingTop: 20 },
});

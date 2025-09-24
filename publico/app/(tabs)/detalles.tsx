// app/(main)/Detalle.tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-root-toast";

export default function DetalleProyecto() {
    const router = useRouter();

    const proyecto = {
        titulo: "Sistema para control de vales de combustible",
        institucion: "Cruz Roja Salvadoreña",
        descripcion:
            "Desarrollo de una herramienta digital para registrar, administrar y supervisar el uso de vales de combustible. Se requiere soporte técnico y recursos para su implementación.",
        horas: 250,
        capacidad: 3,
        modalidad: "Virtual",
        inicio: "01-09-2025",
        fin: "01-09-2026",
        telefono: "7198-8855",
        especialidad: "Ingeniería en ciencias de la computación",
        habilidades: ["PHP", "SQL", "HTML", "Responsable"],
    };

    const showToast = (message: string, success: boolean = false) => {
        Toast.show(message, {
            duration: 2000,
            position: Toast.positions.TOP,
            shadow: true,
            animation: true,
            hideOnPress: true,
            backgroundColor: success ? "#4CAF50" : "#E53935",
            textColor: "#fff",
            opacity: 0.95,
            containerStyle: {
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 10,
                marginTop: 60,
                alignSelf: "center",
            },
            textStyle: {
                fontFamily: "MyriadPro-Bold",
                fontSize: 14,
            },
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Detalle Proyecto</Text>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="#000"
                    onPress={() => router.back()}
                />
            </View>

            {/* Contenido */}
            <ScrollView style={styles.contentBackground} contentContainerStyle={{ paddingBottom: 160 }}>
                <Text style={styles.titulo}>{proyecto.titulo}</Text>

                <Text style={[styles.info, { marginTop: 12 }]}>
                    <Text style={styles.bold}>Institución: </Text>{proyecto.institucion}
                </Text>

                <Text style={styles.descripcion}>{proyecto.descripcion}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Horas </Text>{proyecto.horas}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Capacidad </Text>{proyecto.capacidad}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Modalidad </Text>{proyecto.modalidad}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Teléfono </Text>{proyecto.telefono}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Inicio </Text>{proyecto.inicio}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Fin </Text>{proyecto.fin}</Text>
                    </View>
                </View>

                <Text style={[styles.info, { marginTop: 15 }]}>
                    <Text style={styles.bold}>Especialidad Requerida{"\n"}</Text>
                    {proyecto.especialidad}
                </Text>

                <Text style={[styles.bold, { marginTop: 15 }]}>Habilidades</Text>
                <View style={styles.habilidadesContainer}>
                    {proyecto.habilidades.map((hab, idx) => (
                        <View key={idx} style={styles.habilidad}>
                            <Text style={styles.habilidadText}>{hab}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Botones flotantes */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.buttonStar}
                    onPress={() => {
                        showToast("✅ Proyecto guardado", true);
                        router.back();
                    }}
                >
                    <Ionicons name="star-outline" size={26} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonYellow}
                    onPress={() => {
                        showToast("📤 Aplicación enviada", true);
                        router.back();
                    }}
                >
                    <Ionicons name="send-outline" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Bottom nav */}
            <View style={styles.bottomNav}>
                <Ionicons name="home-outline" size={28} color="#fff" onPress={() => router.push("/")} />
                <Ionicons name="star-outline" size={28} color="#fff" />
                <Ionicons name="file-tray-outline" size={28} color="#fff" />
                <Ionicons name="notifications-outline" size={28} color="#fff" />
                <Ionicons name="person-outline" size={28} color="#fff" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 91,
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        fontFamily: "MyriadPro-Bold",
    },
    contentBackground: {
        flex: 1,
        backgroundColor: "#F2F6FC",
        paddingHorizontal: 20,
    },
    titulo: {
        fontSize: 17,
        fontWeight: "bold",
        fontFamily: "MyriadPro-Bold",
        marginBottom: 10,
        color: "#000",
        marginTop: 16,
    },
    descripcion: {
        fontSize: 14,
        fontFamily: "MyriadPro-Regular",
        color: "#333",
        marginVertical: 10,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 10,
    },
    col: { flex: 1, alignItems: "flex-start" },
    info: { fontSize: 14, color: "#000", fontFamily: "MyriadPro-Regular" },
    bold: { fontFamily: "MyriadPro-Bold", fontWeight: "bold" },
    habilidadesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 8,
    },
    habilidad: {
        backgroundColor: "#C9D9F6",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    habilidadText: {
        fontSize: 13,
        color: "#213A8E",
        fontFamily: "MyriadPro-Regular",
        fontWeight: "bold",
    },
    fabContainer: {
        position: "absolute",
        bottom: 140,
        left: 25,
        right: 25,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    buttonYellow: {
        backgroundColor: "#F9DC50",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 10,
    },
    buttonStar: {
        backgroundColor: "#2666DE",
        width: 55,
        height: 55,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2666DE",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 8,
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

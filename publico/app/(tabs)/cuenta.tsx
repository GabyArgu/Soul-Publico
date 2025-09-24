// app/(main)/Perfil.tsx
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Perfil() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mi Perfil</Text>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="#000"
                    onPress={() => router.back()}
                />
            </View>

            {/* Contenido */}
            <View style={styles.contentBackground}>
                {/* Avatar + nombre + carrera */}
                <View style={styles.topSection}>
                    <Image
                        source={require("../../assets/images/avatar.png")} // poné tu imagen
                        style={styles.avatar}
                    />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.name}>Gabriela Méndez</Text>
                        <Text style={styles.career}>Ing. en ciencias de la computación</Text>
                    </View>
                </View>

                {/* Datos en 2 columnas */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Carnet</Text>
                        <Text style={styles.value}>MB230496</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Correo</Text>
                        <Text style={styles.value}>gabmendez@gmail.com</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Cumpleaños</Text>
                        <Text style={styles.value}>18-08-2003</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Teléfono</Text>
                        <Text style={styles.value}>7690-1760</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Departamento</Text>
                        <Text style={styles.value}>San Salvador</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Municipio</Text>
                        <Text style={styles.value}>Mejicanos</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.label}>UV’S Ganadas</Text>
                        <Text style={styles.value}>78</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Disponibilidad</Text>
                        <Text style={styles.value}>Medio tiempo</Text>
                    </View>
                </View>

                {/* Currículum Vitae */}
                <View style={styles.cvSection}>
                    <Text style={styles.label}>Currículum Vitae</Text>
                    <TouchableOpacity style={styles.cvFile} activeOpacity={0.7}>
                        <Ionicons name="document-text-outline" size={20} color="#2666DE" />
                        <Text style={styles.cvText}>curriculum_MB230496.PDF</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Botones flotantes */}
            <TouchableOpacity
                style={[styles.fab, styles.fabLeft]}
                onPress={() => router.push("../(auth)/LoginScreen")}
            >
                <Ionicons name="log-out-outline" size={25} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.fab, styles.fabRight]}
                onPress={() => router.push("/(tabs)/editar")}
            >
                <Ionicons name="pencil" size={25} color="#fff" />
            </TouchableOpacity>

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
                    name="notifications-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/notificaciones")}
                />
                <Ionicons
                    name="person"
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
        padding: 20,
    },
    topSection: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    avatar: { width: 90, height: 90, borderRadius: 35 },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "MyriadPro-Bold",
        color: "#000",
    },
    career: { fontSize: 14, color: "#333", fontFamily: "MyriadPro-Regular" },
    infoGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
    infoItem: { width: "50%", marginBottom: 15 },
    label: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#000",
        fontFamily: "MyriadPro-Bold",
    },
    value: { fontSize: 14, color: "#333", fontFamily: "MyriadPro-Regular" },
    cvSection: { marginBottom: 40 },
    cvFile: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E5EDFB",
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
    },
    cvText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#2666DE",
        fontFamily: "MyriadPro-Regular",
    },
    fab: {
        position: "absolute",
        bottom: 140,
        width: 55,
        height: 55,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    fabLeft: { left: 25, backgroundColor: "#2666DE" },
    fabRight: { right: 25, backgroundColor: "#F9DC50" },
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

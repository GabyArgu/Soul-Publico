// app/(main)/Notificaciones.tsx
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { IconProps } from "@expo/vector-icons/build/createIconSet";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import axios from "axios";
import { getUserData, UserData, checkAuthStatus  } from '../utils/session';

interface Notificacion {
    idNotificacion: number;
    idUsuario: string;
    idProyecto: number | null;
    idAplicacion: number | null;
    titulo: string;
    cuerpo: string;
    estaLeida: boolean;
    fechaCreacion: string;
    proyectoNombre: string | null;
    aplicacionEstado: string | null;
}

export default function Notificaciones() {
    const router = useRouter();
    const API_URL = "https://d06a6c5dfc30.ngrok-free.app/api";

    const [userData, setUserData] = useState<UserData | null>(null);
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [cargando, setCargando] = useState(true);

    // Cargar datos del usuario logeado
    useEffect(() => {
        const loadUser = async () => {
            const data = await getUserData();
            if (data) {
                setUserData(data);
            } else {
                router.replace('/(auth)/LoginScreen');
            }
        };
        loadUser();
    }, []);

    // Cargar notificaciones cuando userData esté disponible
    useEffect(() => {
        if (userData?.carnet) {
            cargarNotificaciones();
        }
    }, [userData]);

    // Cargar notificaciones
    const cargarNotificaciones = async () => {
        try {
            setCargando(true);
            
            if (!userData?.carnet) {
                console.log("No se pudo obtener el carnet");
                setCargando(false);
                return;
            }

            const response = await axios.get(`${API_URL}/notificaciones/${userData.carnet}`);
            // Filtrar solo las no leídas
            const notificacionesNoLeidas = response.data.filter((notif: Notificacion) => !notif.estaLeida);
            setNotificaciones(notificacionesNoLeidas);
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
        } finally {
            setCargando(false);
        }
    };

    const marcarComoLeida = async (idNotificacion: number) => {
        try {
            await axios.put(`${API_URL}/notificaciones/${idNotificacion}/leer`);
            // Quitar la notificación de la lista
            setNotificaciones(prev => prev.filter(notif => notif.idNotificacion !== idNotificacion));
        } catch (error) {
            console.error("Error marcando notificación como leída:", error);
        }
    };

    type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

    const getIcon = (notificacion: Notificacion): IoniconName => {
        const titulo = notificacion.titulo.toLowerCase();
        const cuerpo = notificacion.cuerpo.toLowerCase();

        if (notificacion.idProyecto) return "rocket-outline";
        if (notificacion.idAplicacion) return "document-text-outline";
        if (titulo.includes("bienvenido") || titulo.includes("bienvenida")) return "hand-left-outline";
        if (titulo.includes("recordatorio") || cuerpo.includes("recuerda")) return "alarm-outline";
        if (titulo.includes("actualiz") || cuerpo.includes("actualiz")) return "refresh-circle-outline";
        if (titulo.includes("proyecto") || cuerpo.includes("proyecto")) return "briefcase-outline";
        if (titulo.includes("aplicación") || titulo.includes("aplicacion")) return "checkbox-outline";
        if (titulo.includes("éxito") || titulo.includes("exito") || titulo.includes("felicidades")) return "trophy-outline";
        if (titulo.includes("importante") || titulo.includes("urgente")) return "warning-outline";
        if (titulo.includes("nuevo") || titulo.includes("nueva")) return "sparkles-outline";

        const fallbackIcons: IoniconName[] = [
            "chatbubble-ellipses-outline",
            "information-circle-outline",
            "mail-unread-outline",
            "notifications-outline"
        ];

        return fallbackIcons[Math.floor(Math.random() * fallbackIcons.length)];
    };

    const parseFechaUTC = (fecha: string): Date => {
        const [fechaPart, horaPart] = fecha.split(" ");
        const [year, month, day] = fechaPart.split("-").map(Number);
        const [hour, minute, second] = horaPart.split(":").map(Number);

        return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    };

    const getTiempoTranscurrido = (fechaCreacion: string) => {
        try {
            const ahora = new Date();
            const fechaNotif = parseFechaUTC(fechaCreacion);

            const diffMs = ahora.getTime() - fechaNotif.getTime();
            if (diffMs < 0) return "Ahora"; // En caso de fechas futuras

            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor(diffMs / (1000 * 60));

            if (diffDays > 7) {
                return fechaNotif.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
            }

            if (diffDays >= 1) {
                return diffDays === 1 ? "Ayer" : `${diffDays} días`;
            }

            const horasRestantes = diffHours;
            const minsRestantes = diffMins - diffHours * 60;

            if (diffHours >= 1) {
                return minsRestantes > 0
                    ? `${horasRestantes} h ${minsRestantes} min`
                    : `${horasRestantes} h`;
            }

            if (diffMins >= 1) {
                return `${diffMins} min`;
            }

            return "Ahora";
        } catch (error) {
            console.error("Error calculando tiempo:", error);
            return "Reciente";
        }
    };

    const handleNotificacionPress = async (notificacion: Notificacion) => {
        // Marcar como leída inmediatamente
        await marcarComoLeida(notificacion.idNotificacion);

        // Navegar según el tipo de notificación
        if (notificacion.idProyecto) {
            // Navegar a detalles del proyecto
            router.push({
                pathname: "/(tabs)/detalles",
                params: {
                    idProyecto: notificacion.idProyecto.toString(),
                    carnetUsuario: userData?.carnet,
                    nombreUsuario: userData?.nombreCompleto,
                    generoUsuario: userData?.genero
                }
            });
        }
        // Si es de aplicación o general, solo se cierra
    };

    const renderNotificacion = ({ item, index }: { item: Notificacion; index: number }) => {
        const palette = index % 2 === 0
            ? { bg: "#E5EDFB", border: "#2666DE" }
            : { bg: "#FEFBEA", border: "#F9DC50" };

        const iconName = getIcon(item);

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: palette.bg, borderColor: palette.border }]}
                onPress={() => handleNotificacionPress(item)}
                activeOpacity={0.7}
            >
                {/* Icono */}
                <View style={styles.cardIcon}>
                    <Ionicons name={iconName} size={25} color={palette.border} />
                </View>

                {/* Contenido */}
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardDesc}>{item.cuerpo}</Text>

                {/* Tiempo */}
                <View style={styles.cardTimeBox}>
                    <Text style={styles.cardTime}>{getTiempoTranscurrido(item.fechaCreacion)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Footer: mostrar '...' cuando no hay más notificaciones (siempre que haya al menos una)
    const footerComponent = notificaciones.length > 0 ? (
        <Text style={styles.footerDots}>...</Text>
    ) : null;

    if (cargando) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notificaciones</Text>
                    <Ionicons
                        name="arrow-back"
                        size={28}
                        color="#000"
                        onPress={() => router.back()}
                    />
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Cargando notificaciones...</Text>
                </View>
            </View>
        );
    }

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
                {notificaciones.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No tienes notificaciones nuevas</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notificaciones}
                        renderItem={renderNotificacion}
                        keyExtractor={(item) => item.idNotificacion.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        ListFooterComponent={footerComponent}
                    />
                )}
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
        paddingBottom: 10,
        paddingTop: 20,
    },
    card: {
        width: "100%",
        minHeight: 100,
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        borderWidth: 2.5,
        position: "relative"
    },
    cardIcon: {
        position: "absolute",
        top: 12,
        right: 12
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "bold",
        fontFamily: "MyriadPro-Bold",
        marginBottom: 6,
        color: "#000"
    },
    cardDesc: {
        fontSize: 14,
        fontFamily: "MyriadPro-Regular",
        color: "#333",
        marginBottom: 10
    },
    cardTimeBox: {
        position: "absolute",
        bottom: 8,
        right: 12,
        backgroundColor: "transparent"
    },
    cardTime: {
        fontSize: 12,
        color: "#666",
        fontFamily: "MyriadPro-Regular"
    },
    footerDots: {
        textAlign: "center",
        fontSize: 22,
        color: "#999",
        marginTop: 10,
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
        paddingTop: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F6FC",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        fontFamily: "Inter-Regular",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        fontFamily: "Inter-Regular",
        marginTop: 10,
    },
});
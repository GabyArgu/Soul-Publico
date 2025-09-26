// app/(main)/Perfil.tsx
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dialog, Portal, Button, Paragraph } from 'react-native-paper';

// Interface para los datos del usuario
interface Usuario {
    nombreCompleto: string;
    carnet: string;
    email: string;
    fechaNacimiento: string;
    telefono: string;
    departamento: string;
    municipio: string;
    carrera: string;
    uvs: number;
    disponibilidad: string;
    urlCv: string;
    genero: string;
}

export default function Perfil() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [cvErrorVisible, setCvErrorVisible] = useState(false);
    const [cvErrorMessage, setCvErrorMessage] = useState("");
    const API_URL = "http://192.168.1.11:4000/api";

    // Obtener carnet del usuario logeado
    const obtenerCarnetUsuario = async (): Promise<string | null> => {
        try {
            const userData = await AsyncStorage.getItem("userData");
            if (userData) {
                const parsedData = JSON.parse(userData);
                return parsedData.carnet || null;
            }
            if (params.carnet) {
                return params.carnet as string;
            }
            return null;
        } catch (error) {
            console.error("Error obteniendo carnet:", error);
            return null;
        }
    };

    // Obtener datos del usuario al cargar el componente
    useEffect(() => {
        const cargarDatosUsuario = async () => {
            try {
                setCargando(true);
                setError(null);
                const carnetUsuario = await obtenerCarnetUsuario();

                if (!carnetUsuario) {
                    setError("No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.");
                    setCargando(false);
                    return;
                }
                console.log("Cargando datos para carnet:", carnetUsuario);

                const respuesta = await axios.get(`${API_URL}/usuarios/${carnetUsuario}`);

                if (respuesta.data && respuesta.data.carnet) {
                    setUsuario(respuesta.data);
                } else {
                    setError("No se encontraron datos para el usuario");
                }
            } catch (error: any) {
                console.error("Error cargando datos del usuario:", error);
                if (error.response?.status === 404) {
                    setError("Usuario no encontrado en el sistema");
                } else if (error.response?.status === 401) {
                    setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
                } else if (error.code === "NETWORK_ERROR") {
                    setError("Error de conexión. Verifica tu internet.");
                } else {
                    setError("Error al cargar los datos del usuario");
                }
            } finally {
                setCargando(false);
            }
        };
        cargarDatosUsuario();
    }, []);

    // Función para manejar cierre de sesión
    const handleLogout = () => {
        setLogoutVisible(true);
    };

    const confirmLogout = async () => {
        try {
            await AsyncStorage.multiRemove(["userData", "authToken"]);
            setLogoutVisible(false);
            router.replace("/(auth)/LoginScreen");
        } catch (error) {
            console.error("Error cerrando sesión:", error);
            router.replace("/(auth)/LoginScreen");
        }
    };

    // Función para formatear fecha
    const formatearFecha = (fechaISO: string) => {
        if (!fechaISO) return "No especificada";
        try {
            const fecha = new Date(fechaISO);
            return fecha.toLocaleDateString("es-SV", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (error) {
            return "Fecha inválida";
        }
    };

    // Obtener avatar según género
    const obtenerAvatar = (genero: string) => {
        switch (genero) {
            case "F":
                return require("../../assets/images/avatar.png");
            case "M":
                return require("../../assets/images/avatar2.png");
            default:
                return require("../../assets/images/avatar3.png");
        }
    };

    // Extraer nombre del archivo CV de la URL
    const obtenerNombreCV = (urlCv: string) => {
        if (!urlCv) return "No disponible";
        const partes = urlCv.split("/");
        return partes[partes.length - 1] || "curriculum.pdf";
    };

    const handleDownloadCv = async () => {
        if (!usuario?.urlCv) {
            setCvErrorMessage("No hay currículum cargado para este usuario.");
            setCvErrorVisible(true);
            return;
        }

        try {
            await Linking.openURL(usuario.urlCv);
        } catch (err: any) {
            console.error("Error abriendo CV:", err);
            setCvErrorMessage("No se pudo abrir el CV. Verifica la conexión al servidor.");
            setCvErrorVisible(true);
        }
    };

    if (cargando) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Cargando perfil...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={50} color="#E53935" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => router.replace("/(auth)/LoginScreen")}
                    >
                        <Text style={styles.retryButtonText}>Volver al Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!usuario) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No se pudieron cargar los datos del usuario</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => router.replace("/(auth)/LoginScreen")}
                    >
                        <Text style={styles.retryButtonText}>Volver al Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mi Perfil</Text>
                <Ionicons name="arrow-back" size={28} color="#000" onPress={() => router.back()} />
            </View>

            {/* Contenido */}
            <View style={styles.contentBackground}>
                {/* Avatar + nombre + carrera */}
                <View style={styles.topSection}>
                    <Image source={obtenerAvatar(usuario.genero)} style={styles.avatar} />
                    <View style={styles.nameAndCareerContainer}>
                        <Text style={styles.name}>{usuario.nombreCompleto}</Text>
                        <Text style={styles.career}>
                            {usuario.carrera || "Carrera no especificada"}
                        </Text>
                    </View>
                </View>

                {/* Datos */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Carnet</Text>
                        <Text style={styles.value}>{usuario.carnet}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Correo</Text>
                        <Text style={styles.value}>{usuario.email || "No especificado"}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Cumpleaños</Text>
                        <Text style={styles.value}>{formatearFecha(usuario.fechaNacimiento)}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Teléfono</Text>
                        <Text style={styles.value}>{usuario.telefono || "No especificado"}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Departamento</Text>
                        <Text style={styles.value}>{usuario.departamento || "No especificado"}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Municipio</Text>
                        <Text style={styles.value}>{usuario.municipio || "No especificado"}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>UV's Ganadas</Text>
                        <Text style={styles.value}>{usuario.uvs || 0}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Disponibilidad</Text>
                        <Text style={styles.value}>{usuario.disponibilidad || "No especificada"}</Text>
                    </View>
                </View>

                {/* CV */}
                <View style={styles.cvSection}>
                    <Text style={styles.label}>Currículum Vitae</Text>
                    <TouchableOpacity
                        style={styles.cvFile}
                        activeOpacity={0.7}
                        onPress={handleDownloadCv}
                    >
                        <Ionicons name="document-text-outline" size={20} color="#2666DE" />
                        <Text style={styles.cvText}>{obtenerNombreCV(usuario.urlCv)}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Botones flotantes */}
            <TouchableOpacity style={[styles.fab, styles.fabLeft]} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={25} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.fab, styles.fabRight]}
                onPress={() =>
                    router.push({
                        pathname: "/(tabs)/editar",
                        params: { carnet: usuario.carnet },
                    })
                }
            >
                <Ionicons name="pencil" size={25} color="#fff" />
            </TouchableOpacity>

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
                                name="person"
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

            {/* Portal para los diálogos profesionales */}
            <Portal>
                {/* Diálogo de Cerrar Sesión */}
                <Dialog 
                    visible={logoutVisible} 
                    onDismiss={() => setLogoutVisible(false)}
                    style={styles.dialog}
                >
                    <Dialog.Title style={styles.dialogTitle}>
                        Cerrar Sesión
                    </Dialog.Title>
                    <Dialog.Content>
                        <Paragraph style={styles.dialogText}>
                            ¿Estás seguro de que quieres cerrar sesión?
                        </Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions style={styles.dialogActions}>
                        <Button 
                            onPress={() => setLogoutVisible(false)}
                            textColor="#666"
                            style={styles.dialogButton}
                            labelStyle={styles.dialogButtonLabel}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onPress={confirmLogout}
                            textColor="#E53935"
                            style={styles.dialogButton}
                            labelStyle={styles.dialogButtonLabel}
                        >
                            Cerrar Sesión
                        </Button>
                    </Dialog.Actions>
                </Dialog>

                {/* Diálogo de Error CV */}
                <Dialog 
                    visible={cvErrorVisible} 
                    onDismiss={() => setCvErrorVisible(false)}
                    style={styles.dialog}
                >
                    <Dialog.Title style={styles.dialogTitle}>
                        CV no disponible
                    </Dialog.Title>
                    <Dialog.Content>
                        <Paragraph style={styles.dialogText}>
                            {cvErrorMessage}
                        </Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions style={styles.dialogActions}>
                        <Button 
                            onPress={() => setCvErrorVisible(false)}
                            textColor="#2666DE"
                            style={styles.dialogButton}
                            labelStyle={styles.dialogButtonLabel}
                        >
                            Aceptar
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { fontSize: 16, color: "#666", fontFamily: "Inter-Regular" },
    errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    errorText: {
        fontSize: 16,
        color: "#E53935",
        textAlign: "center",
        marginVertical: 20,
        fontFamily: "Inter-Regular",
    },
    retryButton: {
        backgroundColor: "#2666DE",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: { color: "#fff", fontSize: 14, fontFamily: "Inter-Bold" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 91,
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#000", fontFamily: "MyriadPro-Bold" },
    contentBackground: { flex: 1, backgroundColor: "#F2F6FC", padding: 20 },
    topSection: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    avatar: { width: 90, height: 90, borderRadius: 35 },
    nameAndCareerContainer: { marginLeft: 12, flex: 1 },
    name: { fontSize: 18, fontWeight: "bold", fontFamily: "MyriadPro-Bold", color: "#000" },
    career: { fontSize: 14, color: "#333", fontFamily: "MyriadPro-Regular" },
    infoGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
    infoItem: { width: "50%", marginBottom: 15 },
    label: { fontSize: 13, fontWeight: "bold", color: "#000", fontFamily: "MyriadPro-Bold" },
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
    cvText: { marginLeft: 8, fontSize: 14, color: "#2666DE", fontFamily: "MyriadPro-Regular" },
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
    dialog: {
        borderRadius: 16,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    dialogTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'MyriadPro-Bold',
        textAlign: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    dialogText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
        fontFamily: 'MyriadPro-Regular',
        lineHeight: 15,
        marginTop: 10,
    },
    dialogActions: {
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    dialogButton: {
        minWidth: 100,
        borderRadius: 8,
        paddingHorizontal: 15,
    },
    dialogButtonLabel: {
        fontSize: 14,
        fontFamily: 'MyriadPro-Bold',
        fontWeight: 'bold',
    },
});
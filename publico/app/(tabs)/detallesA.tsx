// app/(tabs)/detallesA.tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-root-toast";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AplicacionDetalle {
    idAplicacion: number;
    idProyecto: number;
    titulo: string;
    descripcion: string;
    capacidad: number;
    horas: number;
    carrerasRelacionadas: string;
    habilidadesRelacionadas: string;
    idiomasRelacionados: string;
    institucion: string;
    fechaInicio: string;
    fechaFin: string;
    telefonoContacto: string;
    emailContacto: string;
    nombreContacto: string;
    estado: string;
    enviadoEn: string;
    revisadoEn: string;
    aceptadoEn: string;
    rechazadoEn: string;
    finalizadoEn: string;
    urlCartaAceptacion: string;
}

interface EstadoTracking {
    id: number;
    nombre: string;
    fecha: string;
    completado: boolean;
    activo: boolean;
    descripcion: string;
}

export default function DetalleAplicacion() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [aplicacion, setAplicacion] = useState<AplicacionDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingEstados, setTrackingEstados] = useState<EstadoTracking[]>([]);

    const idAplicacion = params.idAplicacion;

    // Cargar detalles de la aplicación
    useEffect(() => {
        const cargarDetallesAplicacion = async () => {
            try {
                setLoading(true);

                // Cargar detalles de la aplicación
                const response = await fetch(`http://192.168.1.11:4000/api/aplicaciones/detalle/${idAplicacion}`);
                if (!response.ok) throw new Error("Error al cargar detalles de la aplicación");
                const data = await response.json();
                setAplicacion(data);

                // Configurar tracking de estados
                configurarTrackingEstados(data);

            } catch (error) {
                console.error("Error al cargar detalles de la aplicación:", error);
                showToast("Error al cargar los detalles de la aplicación", false);
            } finally {
                setLoading(false);
            }
        };

        if (idAplicacion) {
            cargarDetallesAplicacion();
        }
    }, [idAplicacion]);

    const configurarTrackingEstados = (app: AplicacionDetalle) => {
        const estados: EstadoTracking[] = [
            {
                id: 1,
                nombre: "Enviado",
                fecha: app.enviadoEn || "",
                completado: !!app.enviadoEn,
                activo: app.estado === "Enviado",
                descripcion: "Tu aplicación ha sido enviada exitosamente"
            },
            {
                id: 2,
                nombre: "Revisado",
                fecha: app.revisadoEn || "",
                completado: !!app.revisadoEn,
                activo: app.estado === "Revisado",
                descripcion: "Tu aplicación está siendo revisada por la institución"
            },
            {
                id: 3,
                nombre: "Aceptado",
                fecha: app.aceptadoEn || "",
                completado: !!app.aceptadoEn,
                activo: app.estado === "Aceptado",
                descripcion: "¡Felicidades! Tu aplicación ha sido aceptada"
            },
            {
                id: 4,
                nombre: "Rechazado",
                fecha: app.rechazadoEn || "",
                completado: !!app.rechazadoEn,
                activo: app.estado === "Rechazado",
                descripcion: "Tu aplicación no fue seleccionada en esta ocasión"
            },
            {
                id: 5,
                nombre: "Finalizado",
                fecha: app.finalizadoEn || "",
                completado: !!app.finalizadoEn,
                activo: app.estado === "Finalizado",
                descripcion: "Has completado exitosamente el servicio social"
            }
        ];

        setTrackingEstados(estados);
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

    const formatearFecha = (fecha: string) => {
        if (!fecha) return 'No especificada';
        if (fecha.includes('T')) {
            return new Date(fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return fecha;
    };

    const formatearFechaCorta = (fecha: string) => {
        if (!fecha) return '';
        if (fecha.includes('T')) {
            return new Date(fecha).toLocaleDateString('es-ES');
        }
        return fecha;
    };

    const abreviarCarreras = (texto: string) => {
        return texto
            .replace(/\bIngeniería\b/gi, "Ing.")
            .replace(/\bTécnico\b/gi, "Téc.")
            .replace(/\bLicenciatura\b/gi, "Lic.");
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'Enviado': return '#2666DE';
            case 'Revisado': return '#F9DC50';
            case 'Aceptado': return '#4CAF50';
            case 'Rechazado': return '#E53935';
            case 'Finalizado': return '#666';
            default: return '#666';
        }
    };

    const getEstadoIcon = (estado: string, completado: boolean) => {
        if (completado) return "checkmark";
        
        switch (estado) {
            case 'Enviado': return "send";
            case 'Revisado': return "eye";
            case 'Aceptado': return "thumbs-up";
            case 'Rechazado': return "thumbs-down";
            case 'Finalizado': return "flag";
            default: return "time";
        }
    };

    const handleAbrirCarta = () => {
        if (aplicacion?.urlCartaAceptacion) {
            Linking.openURL(aplicacion.urlCartaAceptacion).catch(err => {
                showToast("Error al abrir la carta de aceptación");
            });
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Detalle Aplicación</Text>
                    <Ionicons name="arrow-back" size={28} color="#000" onPress={() => router.back()} />
                </View>
                <View style={[styles.contentBackground, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#2666DE" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Cargando detalles...</Text>
                </View>
            </View>
        );
    }

    if (!aplicacion) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Detalle Aplicación</Text>
                    <Ionicons name="arrow-back" size={28} color="#000" onPress={() => router.back()} />
                </View>
                <View style={[styles.contentBackground, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#666', textAlign: 'center' }}>No se pudo cargar la información de la aplicación</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                        <Text style={styles.retryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const habilidadesArray = aplicacion.habilidadesRelacionadas
        ? aplicacion.habilidadesRelacionadas.split(',').map(h => h.trim()).filter(h => h !== '')
        : [];
    const carrerasArray = aplicacion.carrerasRelacionadas
        ? aplicacion.carrerasRelacionadas.split(',').map(c => abreviarCarreras(c.trim())).filter(c => c !== '')
        : [];
    const idiomasArray = aplicacion.idiomasRelacionados
        ? aplicacion.idiomasRelacionados.split(',').map(i => i.trim()).filter(i => i !== '')
        : [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Detalle Aplicación</Text>
                <Ionicons name="arrow-back" size={28} color="#000" onPress={() => router.back()} />
            </View>

            <ScrollView style={styles.contentBackground} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Tracking de Estados - NUEVO DISEÑO */}
                <View style={styles.trackingContainer}>
                    <View style={styles.trackingHeader}>
                        <Ionicons name="time" size={24} color="#2666DE" />
                        <Text style={styles.trackingTitle}>Progreso de tu aplicación</Text>
                    </View>
                    
                    {/* Estado Actual */}
                    <View style={styles.estadoActualContainer}>
                        <Text style={styles.estadoActualLabel}>Estado actual:</Text>
                        <View style={[styles.estadoActualBadge, { backgroundColor: getEstadoColor(aplicacion.estado) }]}>
                            <Text style={styles.estadoActualText}>{aplicacion.estado}</Text>
                        </View>
                    </View>

                    {/* Pasos del Tracking */}
                    <View style={styles.trackingSteps}>
                        {trackingEstados.map((estado, index) => (
                            <View key={estado.id} style={[
                                styles.stepContainer,
                                estado.activo && styles.stepContainerActive
                            ]}>
                                {/* Línea conectadora */}
                                {index > 0 && (
                                    <View style={[
                                        styles.stepConnector,
                                        { 
                                            backgroundColor: trackingEstados[index - 1].completado ? 
                                                getEstadoColor(trackingEstados[index - 1].nombre) : '#E5E7EB'
                                        }
                                    ]} />
                                )}
                                
                                {/* Ícono del paso */}
                                <View style={[
                                    styles.stepIconContainer,
                                    { 
                                        backgroundColor: estado.activo ? getEstadoColor(estado.nombre) : 
                                        estado.completado ? getEstadoColor(estado.nombre) : '#F2F6FC',
                                        borderColor: estado.activo ? getEstadoColor(estado.nombre) : 
                                        estado.completado ? getEstadoColor(estado.nombre) : '#D1D5DB'
                                    }
                                ]}>
                                    <Ionicons 
                                        name={getEstadoIcon(estado.nombre, estado.completado)} 
                                        size={18} 
                                        color={estado.completado || estado.activo ? "#fff" : "#666"} 
                                    />
                                </View>

                                {/* Información del paso */}
                                <View style={styles.stepContent}>
                                    <View style={styles.stepHeader}>
                                        <Text style={[
                                            styles.stepName,
                                            { 
                                                color: estado.activo ? getEstadoColor(estado.nombre) : 
                                                estado.completado ? getEstadoColor(estado.nombre) : '#666'
                                            }
                                        ]}>
                                            {estado.nombre}
                                        </Text>
                                        {estado.fecha ? (
                                            <Text style={styles.stepDate}>
                                                {formatearFechaCorta(estado.fecha)}
                                            </Text>
                                        ) : (
                                            <Text style={styles.stepPending}>
                                                Pendiente
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={styles.stepDescription}>
                                        {estado.descripcion}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Información del Proyecto */}
                <View style={styles.proyectoContainer}>
                    <Text style={styles.titulo}>{aplicacion.titulo}</Text>

                    <Text style={[styles.info, { marginTop: 2 }]}>
                        <Text style={styles.bold}>Institución: </Text>{aplicacion.institucion || 'No especificada'}
                    </Text>

                    <Text style={styles.descripcion}>{aplicacion.descripcion}</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.col}>
                            <Text style={styles.info}><Text style={styles.bold}>Horas: </Text>{aplicacion.horas}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.info}><Text style={styles.bold}>Capacidad: </Text>{aplicacion.capacidad}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.col}>
                            <Text style={styles.info}><Text style={styles.bold}>Inicio: </Text>{formatearFecha(aplicacion.fechaInicio)}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.info}><Text style={styles.bold}>Fin: </Text>{formatearFecha(aplicacion.fechaFin)}</Text>
                        </View>
                    </View>

                    {/* Contacto y Teléfono */}
                    {(aplicacion.nombreContacto || aplicacion.telefonoContacto || aplicacion.emailContacto) && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 15, marginBottom: 8 }]}>Información de Contacto</Text>
                            {aplicacion.nombreContacto && (
                                <Text style={styles.info}><Text style={styles.bold}>Contacto: </Text>{aplicacion.nombreContacto}</Text>
                            )}
                            {aplicacion.telefonoContacto && (
                                <Text style={styles.info}><Text style={styles.bold}>Teléfono: </Text>{aplicacion.telefonoContacto}</Text>
                            )}
                            {aplicacion.emailContacto && (
                                <Text style={styles.info}><Text style={styles.bold}>Email: </Text>{aplicacion.emailContacto}</Text>
                            )}
                        </>
                    )}

                    {/* Carreras Relacionadas */}
                    {carrerasArray.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Carreras Relacionadas</Text>
                            <View style={styles.habilidadesContainer}>
                                {carrerasArray.map((carrera, idx) => (
                                    <View key={idx} style={[styles.habilidad, { backgroundColor: '#E5EDFB' }]}>
                                        <Text style={[styles.habilidadText, { color: '#213A8E' }]}>{carrera}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Habilidades */}
                    {habilidadesArray.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Habilidades</Text>
                            <View style={styles.habilidadesContainer}>
                                {habilidadesArray.map((hab, idx) => (
                                    <View key={idx} style={styles.habilidad}>
                                        <Text style={styles.habilidadText}>{hab}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Idiomas */}
                    {idiomasArray.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Idiomas Requeridos</Text>
                            <View style={styles.habilidadesContainer}>
                                {idiomasArray.map((idioma, idx) => (
                                    <View key={idx} style={[styles.habilidad, { backgroundColor: '#f9dd5048' }]}>
                                        <Text style={[styles.habilidadText, { color: '#B78800' }]}>{idioma}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Carta de Aceptación */}
                    {aplicacion.urlCartaAceptacion && (
                        <TouchableOpacity style={styles.cartaButton} onPress={handleAbrirCarta}>
                            <Ionicons name="document-text" size={24} color="#2666DE" />
                            <Text style={styles.cartaButtonText}>Ver carta de aceptación</Text>
                            <Ionicons name="open-outline" size={18} color="#2666DE" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

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
    header: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        paddingHorizontal: 20, 
        paddingTop: 91, 
        marginBottom: 10, 
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
        paddingHorizontal: 20 
    },
    
    // Tracking Styles - NUEVO DISEÑO MEJORADO
    trackingContainer: { 
        backgroundColor: '#fff', 
        borderRadius: 15, 
        padding: 20, 
        marginTop: 16,
        borderWidth: 2,
        borderColor: '#E5EDFB',
        shadowColor: '#2666DE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
    },
    trackingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F6FC'
    },
    trackingTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#213A8E', 
        fontFamily: 'MyriadPro-Bold', 
        marginLeft: 10
    },
    estadoActualContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#F8FAFC', 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5EDFB'
    },
    estadoActualLabel: { 
        fontSize: 16, 
        color: '#213A8E', 
        fontFamily: 'MyriadPro-Bold'
    },
    estadoActualBadge: { 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 20 
    },
    estadoActualText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 14, 
        fontFamily: 'MyriadPro-Bold' 
    },
    trackingSteps: {
        position: 'relative',
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 25,
        position: 'relative',
        padding: 12,
        borderRadius: 12,
    },
    stepContainerActive: {
        backgroundColor: '#F8FAFC',
        borderLeftWidth: 4,
        borderLeftColor: '#2666DE',
    },
    stepConnector: {
        position: 'absolute',
        left: 25,
        top: -15,
        width: 2,
        height: 30,
        zIndex: 1,
    },
    stepIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 2,
        zIndex: 2,
    },
    stepContent: {
        flex: 1,
        paddingTop: 2,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    stepName: { 
        fontSize: 16, 
        fontWeight: '600', 
        fontFamily: 'MyriadPro-Bold', 
        flex: 1 
    },
    stepDate: { 
        fontSize: 12, 
        color: '#4CAF50', 
        fontFamily: 'MyriadPro-Bold',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    stepPending: { 
        fontSize: 12, 
        color: '#999', 
        fontFamily: 'MyriadPro-Regular', 
        fontStyle: 'italic' 
    },
    stepDescription: { 
        fontSize: 14, 
        color: '#666', 
        fontFamily: 'MyriadPro-Regular', 
        lineHeight: 20 
    },
    
    // Proyecto Container
    proyectoContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginTop: 16,
        borderWidth: 2,
        borderColor: '#E5EDFB',
    },
    titulo: { 
        fontSize: 18, 
        fontWeight: "bold", 
        fontFamily: "MyriadPro-Bold", 
        marginBottom: 10, 
        color: "#000" 
    },
    descripcion: { 
        fontSize: 14, 
        fontFamily: "MyriadPro-Regular", 
        color: "#333", 
        marginVertical: 10, 
        lineHeight: 20 
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'MyriadPro-Bold',
        color: '#213A8E',
        marginBottom: 8,
    },
    infoRow: { 
        flexDirection: "row", 
        justifyContent: "flex-start", 
        marginBottom: 8 
    },
    col: { 
        flex: 1, 
        alignItems: "flex-start" 
    },
    info: { 
        fontSize: 14, 
        color: "#000", 
        fontFamily: "MyriadPro-Regular", 
        marginBottom: 4 
    },
    bold: { 
        fontFamily: "MyriadPro-Bold", 
        fontWeight: "bold" 
    },
    habilidadesContainer: { 
        flexDirection: "row", 
        flexWrap: "wrap", 
        marginTop: 10, 
        gap: 8 
    },
    habilidad: { 
        backgroundColor: "#c9d9f694", 
        paddingHorizontal: 12, 
        paddingVertical: 8, 
        borderRadius: 8, 
        marginRight: 8, 
        marginBottom: 8 
    },
    habilidadText: { 
        fontSize: 13, 
        color: "#213A8E", 
        fontFamily: "MyriadPro-Regular", 
        fontWeight: "bold" 
    },
    
    // Carta Button
    cartaButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#E5EDFB', 
        padding: 16, 
        borderRadius: 12, 
        marginTop: 20, 
        borderWidth: 2, 
        borderColor: '#2666DE', 
        justifyContent: 'center' 
    },
    cartaButtonText: { 
        marginLeft: 8, 
        color: '#2666DE', 
        fontWeight: 'bold', 
        fontSize: 16, 
        fontFamily: 'MyriadPro-Bold' 
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
    retryButton: { 
        backgroundColor: '#2666DE', 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        borderRadius: 8, 
        marginTop: 15 
    },
    retryButtonText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 14 
    },
});
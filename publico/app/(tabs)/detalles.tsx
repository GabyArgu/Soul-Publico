// app/(tabs)/detalles.tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-root-toast";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ProyectoDetalle {
    idProyecto: number;
    titulo: string;
    descripcion: string;
    capacidad: number;
    horas: number;
    carrerasRelacionadas: string;
    habilidadesRelacionadas: string;
    idiomasRelacionados: string;
    institucion: string;
    modalidad: string;
    fechaInicio: string;
    fechaFin: string;
    telefono: string;
    emailContacto: string;
    nombreContacto: string;
}

interface ProyectoGuardado {
    idUsuario: number;
    idProyecto: number;
    guardadoEn: string;
}

export default function DetalleProyecto() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [proyecto, setProyecto] = useState<ProyectoDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuardado, setIsGuardado] = useState(false);
    const [idUsuario, setIdUsuario] = useState<number | null>(null);
    const [cargandoGuardado, setCargandoGuardado] = useState(false);
    const [userDataState, setUserDataState] = useState<any>(null);

    const idProyecto = params.idProyecto;

    const obtenerIdUsuario = async (): Promise<number | null> => {
    try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) return null;

        const parsedData = JSON.parse(userData);
        const carnet = parsedData.carnet;
        if (!carnet) return null;

        const response = await fetch(`http://192.168.1.11:4000/api/usuarios/${carnet}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const usuario = await response.json();
        console.log("Datos completos del usuario:", usuario);

        setUserDataState(usuario); // 👈 guardamos todo el usuario en el state
        return usuario.idUsuario || null;
    } catch (error) {
        console.error("Error obteniendo ID de usuario:", error);
        return null;
    }
};

    // Verificar si el proyecto está guardado
    const verificarProyectoGuardado = async () => {
        try {
            if (!idUsuario || !idProyecto) {
                console.log("No hay usuario o proyecto para verificar");
                return;
            }

            console.log("Verificando guardado - Usuario:", idUsuario, "Proyecto:", idProyecto);

            const response = await fetch(`http://192.168.1.11:4000/api/proyectos-guardados/verificar?userId=${idUsuario}&proyectoId=${idProyecto}`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log("Resultado verificación:", data);
            setIsGuardado(data.estaGuardado);

        } catch (error) {
            console.error('Error al verificar proyecto guardado:', error);
            setIsGuardado(false);
        }
    };

    // 1️⃣ Cargar detalles + obtener ID de usuario
    useEffect(() => {
        const cargarDetallesProyecto = async () => {
            try {
                setLoading(true);
                const userId = await obtenerIdUsuario();
                if (!userId) {
                    console.log("No se pudo obtener el ID del usuario");
                    showToast("Debes iniciar sesión para usar esta función", false);
                    return;
                }

                setIdUsuario(userId); // 👈 acá solo seteás, no verificás todavía

                // Cargar detalles del proyecto
                const response = await fetch(`http://192.168.1.11:4000/api/proyectos/${idProyecto}`);
                if (!response.ok) throw new Error("Error al cargar detalles del proyecto");
                const data = await response.json();
                setProyecto(data);
            } catch (error) {
                console.error("Error al cargar detalles del proyecto:", error);
                showToast("Error al cargar los detalles del proyecto", false);
            } finally {
                setLoading(false);
            }
        };

        if (idProyecto) {
            cargarDetallesProyecto();
        }
    }, [idProyecto]);

    // 2️⃣ Verificar guardado solo cuando idUsuario y idProyecto estén listos

    // 3️⃣ Verificar aplicación después de tener idUsuario e idProyecto
useEffect(() => {
    if (idUsuario && idProyecto) {
        const checkAplicacion = async () => {
            try {
                const pool = await fetch(
                    `http://192.168.1.11:4000/api/aplicaciones/verificar?userId=${idUsuario}&proyectoId=${idProyecto}`
                );
                const data = await pool.json();
                setYaAplico(data.yaAplico);

                // Mostrar toast si ya aplicó
                if (data.yaAplico) {
                    showToast("⚠️ Ya aplicaste a este proyecto", false, "warning");
                }
            } catch (error) {
                console.error("Error verificando aplicación:", error);
            }
        };

        checkAplicacion();
        verificarProyectoGuardado();
    }
}, [idUsuario, idProyecto]);



    const showToast = (message: string, success: boolean = false, type: "success" | "error" | "warning" = "error") => {
    let backgroundColor = "#E53935"; // rojo por defecto
    if (type === "success") backgroundColor = "#4CAF50";
    if (type === "warning") backgroundColor = "#F0C02A"; // amarillo

    Toast.show(message, {
        duration: 2000,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor,
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


    // Guardar proyecto
    const guardarProyecto = async () => {
        if (!idUsuario || !idProyecto) {
            showToast("Error: Usuario no identificado", false);
            return;
        }

        try {
            setCargandoGuardado(true);
            const fechaActual = new Date().toISOString();

            const response = await fetch('http://192.168.1.11:4000/api/proyectos-guardados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idUsuario: idUsuario,
                    idProyecto: parseInt(idProyecto as string),
                    guardadoEn: fechaActual
                }),
            });

            if (response.ok) {
                setIsGuardado(true);
                showToast("✅ Proyecto guardado", true, "success");
            } else {
                throw new Error('Error al guardar proyecto');
            }
        } catch (error) {
            console.error('Error al guardar proyecto:', error);
            showToast("Error al guardar el proyecto", false);
        } finally {
            setCargandoGuardado(false);
        }
    };

    // Desguardar proyecto
    const desguardarProyecto = async () => {
        if (!idUsuario || !idProyecto) {
            showToast("Error: Usuario no identificado", false);
            return;
        }

        try {
            setCargandoGuardado(true);
            const response = await fetch(`http://192.168.1.11:4000/api/proyectos-guardados?userId=${idUsuario}&proyectoId=${idProyecto}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setIsGuardado(false);
            } else {
                throw new Error('Error al desguardar proyecto');
            }
        } catch (error) {
            console.error('Error al desguardar proyecto:', error);
            showToast("Error al desguardar el proyecto", false);
        } finally {
            setCargandoGuardado(false);
        }
    };

    // Manejar clic en la estrella
    const handleGuardarClick = () => {
        if (isGuardado) {
            desguardarProyecto();
        } else {
            guardarProyecto();
        }
    };

    const [yaAplico, setYaAplico] = useState(false);

const verificarAplicacion = async () => {
  if (!idUsuario || !idProyecto) return;

  try {
    const response = await fetch(
      `http://192.168.1.11:4000/api/aplicaciones/verificar?userId=${idUsuario}&proyectoId=${idProyecto}`
    );

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    setYaAplico(data.yaAplico); // asumimos que la API devuelve { yaAplico: true/false }
  } catch (error) {
    console.error("Error verificando aplicación:", error);
    setYaAplico(false);
  }
};

// 3️⃣ Verificar aplicación después de tener idUsuario e idProyecto
useEffect(() => {
  if (idUsuario && idProyecto) {
    verificarAplicacion();
  }
}, [idUsuario, idProyecto]);

const handleAplicarClick = async () => {
  if (yaAplico) {
    showToast("❌ Ya aplicaste a este proyecto", false);
    return;
  }

  // Tu lógica actual de aplicar
  if (!idUsuario || !proyecto || !userDataState?.urlCv) {
    showToast("Error: Usuario o CV no disponible", false);
    return;
  }

  try {
    const usuario = {
      idUsuario,
      nombreCompleto: userDataState.nombreCompleto || "Sin nombre",
      email: userDataState.email || "Sin email",
      urlCv: userDataState.urlCv,
    };

    const response = await fetch("http://192.168.1.11:4000/api/aplicaciones/aplicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idProyecto: proyecto.idProyecto, usuario }),
    });

    if (!response.ok) throw new Error("Error al enviar aplicación");

    setYaAplico(true); // bloqueamos después de aplicar
    showToast("✅ Aplicación enviada correctamente", true, "success");
  } catch (error) {
    console.error(error);
    showToast("Error al enviar la aplicación", false);
  }
};




    const formatearFecha = (fecha: string) => {
        if (!fecha) return 'No especificada';
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

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Detalle Proyecto</Text>
                    <Ionicons name="arrow-back" size={28} color="#000" onPress={() => router.back()} />
                </View>
                <View style={[styles.contentBackground, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#2666DE" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Cargando detalles...</Text>
                </View>
            </View>
        );
    }

    if (!proyecto) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Detalle Proyecto</Text>
                    <Ionicons name="arrow-back" size={28} color="#000" onPress={() => router.back()} />
                </View>
                <View style={[styles.contentBackground, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#666', textAlign: 'center' }}>No se pudo cargar la información del proyecto</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                        <Text style={styles.retryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const habilidadesArray = proyecto.habilidadesRelacionadas
        ? proyecto.habilidadesRelacionadas.split(',').map(h => h.trim()).filter(h => h !== '')
        : [];
    const carrerasArray = proyecto.carrerasRelacionadas
        ? proyecto.carrerasRelacionadas.split(',').map(c => abreviarCarreras(c.trim())).filter(c => c !== '')
        : [];
    const idiomasArray = proyecto.idiomasRelacionados
        ? proyecto.idiomasRelacionados.split(',').map(i => i.trim()).filter(i => i !== '')
        : [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Detalle Proyecto</Text>
                <Ionicons name="arrow-back" size={28} color="#000" onPress={() => router.back()} />
            </View>

            <ScrollView style={styles.contentBackground} contentContainerStyle={{ paddingBottom: 30 }}>
                <Text style={styles.titulo}>{proyecto.titulo}</Text>

                <Text style={[styles.info, { marginTop: 2 }]}>
                    <Text style={styles.bold}>Institución: </Text>{proyecto.institucion || 'No especificada'}
                </Text>

                <Text style={styles.descripcion}>{proyecto.descripcion}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Horas: </Text>{proyecto.horas}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Capacidad: </Text>{proyecto.capacidad}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Inicio: </Text>{formatearFecha(proyecto.fechaInicio)}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.info}><Text style={styles.bold}>Fin: </Text>{formatearFecha(proyecto.fechaFin)}</Text>
                    </View>
                </View>

                {/* Contacto y Teléfono en la misma fila */}
                {(proyecto.nombreContacto || proyecto.telefono || proyecto.emailContacto) && (
                    <View style={[styles.infoRow]}>
                        {proyecto.nombreContacto && (
                            <View style={styles.col}>
                                <Text style={styles.info}><Text style={styles.bold}>Contacto: </Text>{proyecto.nombreContacto}</Text>
                            </View>
                        )}
                        {proyecto.telefono && (
                            <View style={styles.col}>
                                <Text style={styles.info}><Text style={styles.bold}>Teléfono: </Text>{proyecto.telefono}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Email debajo */}
                {proyecto.emailContacto && (
                    <Text style={[styles.info, { marginTop: 5 }]}>
                        <Text style={styles.bold}>Email: </Text>{proyecto.emailContacto}
                    </Text>
                )}

                {/* Carreras Relacionadas */}
                {carrerasArray.length > 0 && (
                    <>
                        <Text style={[styles.bold, { marginTop: 15 }]}>Carreras Relacionadas</Text>
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
                        <Text style={[styles.bold, { marginTop: 15 }]}>Habilidades</Text>
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
                        <Text style={[styles.bold, { marginTop: 15 }]}>Idiomas Requeridos</Text>
                        <View style={styles.habilidadesContainer}>
                            {idiomasArray.map((idioma, idx) => (
                                <View key={idx} style={[styles.habilidad, { backgroundColor: '#f9dd5048' }]}>
                                    <Text style={[styles.habilidadText, { color: '#B78800' }]}>{idioma}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Botones abajo */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.buttonLeft}
                        onPress={handleGuardarClick}
                        disabled={cargandoGuardado}
                    >
                        {cargandoGuardado ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons
                                name={isGuardado ? "star" : "star-outline"}
                                size={26}
                                color="#fff"
                            />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buttonRight, yaAplico && { opacity: 0.9 }]}
                        onPress={handleAplicarClick}
                        disabled={yaAplico} 
                    >
                        <Ionicons
                            name={yaAplico ? "send" : "send-outline"}
                            size={26}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
                    name="star-outline"
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
    container: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 91, marginBottom: 10, backgroundColor: "#fff" },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#000", fontFamily: "MyriadPro-Bold" },
    contentBackground: { flex: 1, backgroundColor: "#F2F6FC", paddingHorizontal: 20 },
    titulo: { fontSize: 18, fontWeight: "bold", fontFamily: "MyriadPro-Bold", marginBottom: 10, color: "#000", marginTop: 16 },
    descripcion: { fontSize: 14, fontFamily: "MyriadPro-Regular", color: "#333", marginVertical: 10, lineHeight: 20 },
    infoRow: { flexDirection: "row", justifyContent: "flex-start", marginBottom: 8 },
    col: { flex: 1, alignItems: "flex-start" },
    info: { fontSize: 14, color: "#000", fontFamily: "MyriadPro-Regular" },
    bold: { fontFamily: "MyriadPro-Bold", fontWeight: "bold" },
    habilidadesContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 8 },
    habilidad: { backgroundColor: "#c9d9f694", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
    habilidadText: { fontSize: 13, color: "#213A8E", fontFamily: "MyriadPro-Regular", fontWeight: "bold" },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
    buttonLeft: { backgroundColor: "#2666DE", width: 55, height: 55, borderRadius: 28, justifyContent: "center", alignItems: "center", shadowColor: "#2666DE", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 8 },
    buttonRight: { backgroundColor: "#F9DC50", width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", shadowColor: "#FFD700", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 10 },
    bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, backgroundColor: "#2666DE", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 30, paddingTop: 20 },
    retryButton: { backgroundColor: '#2666DE', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 15 },
    retryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});